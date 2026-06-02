import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { ResultSetHeader } from "mysql2/promise";
import { resolveOwnerId } from "../middleware/auth.js";
import { pool } from "../services/database.js";
import { uploadImage } from "../services/storageService.js";

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 20 },
  fileFilter: (_request, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      callback(new Error("Only image uploads are allowed"));
      return;
    }
    callback(null, true);
  }
});

export const albumPhotosController = Router({ mergeParams: true });

function albumIdOf(request: Parameters<Parameters<typeof albumPhotosController.get>[1]>[0]) {
  return String((request.params as Record<string, string>).albumId);
}

albumPhotosController.get("/", async (request, response, next) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT
          id,
          album_id AS albumId,
          image_url AS imageUrl,
          description,
          metadata,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM album_photos
        WHERE album_id = ? AND (user_id = ? OR user_id IS NULL)
        ORDER BY created_at DESC
      `,
      [albumIdOf(request), await resolveOwnerId(request)]
    );
    response.json(rows);
  } catch (error) {
    next(error);
  }
});

albumPhotosController.post("/", imageUpload.array("images", 20), async (request, response, next) => {
  const files = (request.files ?? []) as Express.Multer.File[];
  if (files.length === 0) {
    response.status(400).json({ message: "Missing image files" });
    return;
  }
  const connection = await pool.getConnection();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    const saved = [];
    for (const file of files) {
      const uploaded = await uploadImage(file, userId, "albums");
      const id = randomUUID();
      const description = String(request.body.description ?? "");
      const metadata = JSON.stringify({
        key: uploaded.key,
        bucket: uploaded.bucket,
        contentType: uploaded.contentType,
        originalName: file.originalname,
        size: file.size
      });
      await connection.query(
        "INSERT INTO album_photos (id, user_id, album_id, image_url, description, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))",
        [id, userId, albumIdOf(request), uploaded.url, description, metadata]
      );
      saved.push({ id, albumId: albumIdOf(request), imageUrl: uploaded.url, description, metadata: JSON.parse(metadata), ...uploaded });
    }
    await connection.commit();
    response.status(201).json(saved);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

albumPhotosController.put("/:id", async (request, response, next) => {
  const connection = await pool.getConnection();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    const [result] = await connection.query<ResultSetHeader>(
      "UPDATE album_photos SET description = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND album_id = ? AND (user_id = ? OR user_id IS NULL)",
      [request.body.description ?? "", request.params.id, albumIdOf(request), userId]
    );
    await connection.commit();
    if (result.affectedRows === 0) {
      response.status(404).json({ message: "Not found" });
      return;
    }
    const [rows] = await pool.query("SELECT id, album_id AS albumId, image_url AS imageUrl, description, metadata, created_at AS createdAt, updated_at AS updatedAt FROM album_photos WHERE id = ? AND (user_id = ? OR user_id IS NULL)", [request.params.id, userId]);
    response.json((rows as unknown[])[0]);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

albumPhotosController.delete("/:id", async (request, response, next) => {
  const connection = await pool.getConnection();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    const [result] = await connection.query<ResultSetHeader>("DELETE FROM album_photos WHERE id = ? AND album_id = ? AND (user_id = ? OR user_id IS NULL)", [request.params.id, albumIdOf(request), userId]);
    await connection.commit();
    response.status(result.affectedRows > 0 ? 204 : 404).send();
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});
