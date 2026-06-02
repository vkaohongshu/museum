import { randomUUID } from "node:crypto";
import { Router } from "express";
import { resolveOwnerId } from "../middleware/auth.js";
import { pool } from "../services/database.js";

export const settingsController = Router();

function parseStoredValue(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

settingsController.get("/:key", async (request, response, next) => {
  try {
    const [rows] = await pool.query("SELECT id, `key`, `value`, created_at AS createdAt, updated_at AS updatedAt FROM settings WHERE `key` = ? AND (user_id = ? OR user_id IS NULL) LIMIT 1", [request.params.key, await resolveOwnerId(request)]);
    const item = (rows as Array<Record<string, unknown>>)[0];
    if (!item) {
      response.status(404).json({ message: "Not found" });
      return;
    }
    item.value = parseStoredValue(item.value);
    response.json(item);
  } catch (error) {
    next(error);
  }
});

settingsController.put("/:key", async (request, response, next) => {
  const connection = await pool.getConnection();
  const userId = await resolveOwnerId(request);
  try {
    await connection.beginTransaction();
    const value = JSON.stringify(request.body.value ?? request.body);
    await connection.query(
      `
        INSERT INTO settings (id, user_id, \`key\`, \`value\`, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), updated_at = CURRENT_TIMESTAMP(3)
      `,
      [randomUUID(), userId, request.params.key, value]
    );
    await connection.commit();
    const [rows] = await pool.query("SELECT id, `key`, `value`, created_at AS createdAt, updated_at AS updatedAt FROM settings WHERE `key` = ? LIMIT 1", [request.params.key]);
    const item = (rows as Array<Record<string, unknown>>)[0];
    item.value = parseStoredValue(item.value);
    response.json(item);
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});
