import { randomUUID } from "node:crypto";
import { Router } from "express";
import { ResultSetHeader } from "mysql2/promise";
import { resolveOwnerId } from "../middleware/auth.js";
import { pool } from "../services/database.js";

type MomentInput = {
  id?: string;
  content?: string;
  imageUrl?: string | null;
  image_url?: string | null;
  tagIds?: string[];
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

async function getMoment(id: string, userId: string) {
  const [rows] = await pool.query(
    `
      SELECT
        m.id,
        m.content,
        m.image_url AS imageUrl,
        m.created_at AS createdAt,
        m.updated_at AS updatedAt,
        JSON_ARRAYAGG(mt.tag_id) AS tagIds
      FROM moments m
      LEFT JOIN moment_tags mt ON mt.moment_id = m.id
      WHERE m.id = ? AND (m.user_id = ? OR m.user_id IS NULL)
      GROUP BY m.id
      LIMIT 1
    `,
    [id, userId]
  );
  const row = (rows as Array<Record<string, unknown>>)[0];
  return row ? { ...row, tagIds: parseJsonArray(row.tagIds).filter(Boolean) } : null;
}

async function setMomentTags(connection: Awaited<ReturnType<typeof pool.getConnection>>, momentId: string, tagIds: string[] = []) {
  await connection.query("DELETE FROM moment_tags WHERE moment_id = ?", [momentId]);
  if (tagIds.length > 0) {
    await connection.query(
      `INSERT INTO moment_tags (moment_id, tag_id) VALUES ${tagIds.map(() => "(?, ?)").join(", ")}`,
      tagIds.flatMap((tagId) => [momentId, tagId])
    );
  }
}

export const momentsController = Router();

momentsController.get("/", async (_request, response, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        m.id,
        m.content,
        m.image_url AS imageUrl,
        m.created_at AS createdAt,
        m.updated_at AS updatedAt,
        JSON_ARRAYAGG(mt.tag_id) AS tagIds
      FROM moments m
      LEFT JOIN moment_tags mt ON mt.moment_id = m.id
      WHERE m.user_id = ? OR m.user_id IS NULL
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `, [await resolveOwnerId(_request)]);
    response.json((rows as Array<Record<string, unknown>>).map((row) => ({
      ...row,
      tagIds: parseJsonArray(row.tagIds).filter(Boolean)
    })));
  } catch (error) {
    next(error);
  }
});

momentsController.get("/:id", async (request, response, next) => {
  try {
    const item = await getMoment(request.params.id, await resolveOwnerId(request));
    if (!item) response.status(404).json({ message: "Not found" });
    else response.json(item);
  } catch (error) {
    next(error);
  }
});

momentsController.post("/", async (request, response, next) => {
  const input = request.body as MomentInput;
  if (!input.content) {
    response.status(400).json({ message: "Missing required fields: content" });
    return;
  }
  const connection = await pool.getConnection();
  const id = input.id ?? randomUUID();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    await connection.query(
      "INSERT INTO moments (id, user_id, content, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))",
      [id, userId, input.content, input.imageUrl ?? input.image_url ?? null]
    );
    await setMomentTags(connection, id, input.tagIds ?? []);
    await connection.commit();
    response.status(201).json(await getMoment(id, userId));
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

momentsController.put("/:id", async (request, response, next) => {
  const input = request.body as MomentInput;
  const connection = await pool.getConnection();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    await connection.query(
      "UPDATE moments SET content = COALESCE(?, content), image_url = COALESCE(?, image_url), updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND (user_id = ? OR user_id IS NULL)",
      [input.content ?? null, input.imageUrl ?? input.image_url ?? null, request.params.id, userId]
    );
    if (input.tagIds) await setMomentTags(connection, request.params.id, input.tagIds);
    await connection.commit();
    const item = await getMoment(request.params.id, userId);
    if (!item) response.status(404).json({ message: "Not found" });
    else response.json(item);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

momentsController.delete("/:id", async (request, response, next) => {
  const connection = await pool.getConnection();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM moment_tags WHERE moment_id = ?", [request.params.id]);
    const [result] = await connection.query<ResultSetHeader>("DELETE FROM moments WHERE id = ? AND (user_id = ? OR user_id IS NULL)", [request.params.id, userId]);
    await connection.commit();
    response.status(result.affectedRows > 0 ? 204 : 404).send();
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});
