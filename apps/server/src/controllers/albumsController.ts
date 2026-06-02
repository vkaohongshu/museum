import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ResultSetHeader } from "mysql2/promise";
import { resolveOwnerId } from "../middleware/auth.js";
import { pool } from "../services/database.js";

type AlbumInput = {
  id?: string;
  title?: string;
  name?: string;
  description?: string | null;
};

function parseJsonArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function getAlbum(id: string, userId: string) {
  const [rows] = await pool.query(
    `
      SELECT
        a.id,
        a.title,
        a.description,
        a.created_at AS createdAt,
        a.updated_at AS updatedAt,
        COALESCE(
          JSON_ARRAYAGG(
            CASE
              WHEN p.id IS NULL THEN NULL
              ELSE JSON_OBJECT(
                'id', p.id,
                'albumId', p.album_id,
                'imageUrl', p.image_url,
                'description', p.description,
                'metadata', p.metadata,
                'createdAt', p.created_at,
                'updatedAt', p.updated_at
              )
            END
          ),
          JSON_ARRAY()
        ) AS photos
      FROM albums a
      LEFT JOIN album_photos p ON p.album_id = a.id
      WHERE a.id = ? AND (a.user_id = ? OR a.user_id IS NULL)
      GROUP BY a.id
      LIMIT 1
    `,
    [id, userId]
  );
  const row = (rows as Array<Record<string, unknown>>)[0];
  return row ? { ...row, photos: parseJsonArray(row.photos).filter(Boolean) } : null;
}

export const albumsController = Router();

albumsController.get("/", async (_request, response, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        a.id,
        a.title,
        a.description,
        a.created_at AS createdAt,
        a.updated_at AS updatedAt,
        COALESCE(
          JSON_ARRAYAGG(
            CASE
              WHEN p.id IS NULL THEN NULL
              ELSE JSON_OBJECT(
                'id', p.id,
                'albumId', p.album_id,
                'imageUrl', p.image_url,
                'description', p.description,
                'metadata', p.metadata,
                'createdAt', p.created_at,
                'updatedAt', p.updated_at
              )
            END
          ),
          JSON_ARRAY()
        ) AS photos
      FROM albums a
      LEFT JOIN album_photos p ON p.album_id = a.id
      WHERE a.user_id = ? OR a.user_id IS NULL
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `, [await resolveOwnerId(_request)]);
    response.json((rows as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      photos: parseJsonArray(row.photos).filter(Boolean)
    })));
  } catch (error) {
    next(error);
  }
});

albumsController.get("/:id", async (request, response, next) => {
  try {
    const item = await getAlbum(request.params.id, await resolveOwnerId(request));
    if (!item) response.status(404).json({ message: "Not found" });
    else response.json(item);
  } catch (error) {
    next(error);
  }
});

albumsController.post("/", async (request, response, next) => {
  const input = request.body as AlbumInput;
  const title = input.title ?? input.name;
  if (!title) {
    response.status(400).json({ message: "Missing required fields: title" });
    return;
  }
  const connection = await pool.getConnection();
  const id = input.id ?? randomUUID();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    await connection.query(
      "INSERT INTO albums (id, user_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))",
      [id, userId, title, input.description ?? null]
    );
    await connection.commit();
    response.status(201).json(await getAlbum(id, userId));
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

albumsController.put("/:id", async (request, response, next) => {
  const input = request.body as AlbumInput;
  const connection = await pool.getConnection();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    await connection.query(
      "UPDATE albums SET title = COALESCE(?, title), description = COALESCE(?, description), updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND (user_id = ? OR user_id IS NULL)",
      [input.title ?? input.name ?? null, input.description ?? null, request.params.id, userId]
    );
    await connection.commit();
    const item = await getAlbum(request.params.id, userId);
    if (!item) response.status(404).json({ message: "Not found" });
    else response.json(item);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

albumsController.delete("/:id", async (request, response, next) => {
  const connection = await pool.getConnection();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    const [result] = await connection.query<ResultSetHeader>("DELETE FROM albums WHERE id = ? AND (user_id = ? OR user_id IS NULL)", [request.params.id, userId]);
    await connection.commit();
    response.status(result.affectedRows > 0 ? 204 : 404).send();
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});
