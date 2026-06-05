import { randomUUID } from "node:crypto";
import { Router } from "express";
import { PoolConnection } from "mysql2/promise";
import { SyncEntityName, SyncMutation } from "@life-museum/shared-types";
import { entityConfigs, EntityKey, toSnake } from "../models/entities.js";
import { resolveOwnerId } from "../middleware/auth.js";
import { createCrudService } from "../services/crudService.js";
import { pool } from "../services/database.js";

type AnyRecord = Record<string, unknown>;

const services = {
  articles: createCrudService("articles"),
  moments: createCrudService("moments"),
  albums: createCrudService("albums"),
  album_photos: createCrudService("albumPhotos"),
  categories: createCrudService("categories"),
  tags: createCrudService("tags"),
  memory_capsules: createCrudService("memoryCapsules"),
  inspirations: createCrudService("inspirations"),
  moodRecords: createCrudService("moodRecords"),
  locations: createCrudService("locations"),
  settings: createCrudService("settings")
};

const entityKeyMap: Record<SyncEntityName, EntityKey> = {
  articles: "articles",
  moments: "moments",
  albums: "albums",
  album_photos: "albumPhotos",
  categories: "categories",
  tags: "tags",
  memory_capsules: "memoryCapsules",
  inspirations: "inspirations",
  moodRecords: "moodRecords",
  locations: "locations",
  settings: "settings"
};

export const syncController = Router();

syncController.get("/pull", async (request, response, next) => {
  try {
    const since = String(request.query.since ?? "");
    response.json({
      serverTime: new Date().toISOString(),
      strategy: "last-write-wins",
      articles: await services.articles.list(since, await resolveOwnerId(request)),
      moments: await services.moments.list(since, await resolveOwnerId(request)),
      albums: await services.albums.list(since, await resolveOwnerId(request)),
      albumPhotos: await services.album_photos.list(since, await resolveOwnerId(request)),
      categories: await services.categories.list(since, await resolveOwnerId(request)),
      tags: await services.tags.list(since, await resolveOwnerId(request)),
      memoryCapsules: await services.memory_capsules.list(since, await resolveOwnerId(request)),
      inspirations: await services.inspirations.list(since, await resolveOwnerId(request)),
      moodRecords: await services.moodRecords.list(since, await resolveOwnerId(request)),
      locations: await services.locations.list(since, await resolveOwnerId(request)),
      settings: await services.settings.list(since, await resolveOwnerId(request))
    });
  } catch (error) {
    next(error);
  }
});

syncController.post("/push", async (request, response, next) => {
  const connection = await pool.getConnection();
  const mutations = (request.body.mutations ?? []) as SyncMutation[];
  const userId = await resolveOwnerId(request);

  try {
    await connection.beginTransaction();
    const results = [];

    for (const mutation of mutations) {
      const result = await applyMutation(connection, mutation, userId);
      results.push({
        mutationId: (mutation as unknown as AnyRecord).id,
        entity: mutation.entity,
        method: mutation.method ?? "POST",
        status: result
      });
    }

    await connection.commit();
    response.json({
      strategy: "last-write-wins",
      serverTime: new Date().toISOString(),
      results
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

async function applyMutation(connection: PoolConnection, mutation: SyncMutation, userId: string) {
  const data = (mutation.data ?? {}) as AnyRecord;
  const method = mutation.method ?? "POST";

  if (method === "DELETE") {
    await deleteEntity(connection, mutation.entity, data, userId);
    return "deleted";
  }

  if (mutation.entity === "moments") {
    await upsertMoment(connection, data, method, userId);
    return method === "PUT" ? "updated" : "upserted";
  }

  if (mutation.entity === "settings") {
    await upsertSetting(connection, data, userId);
    return "upserted";
  }

  if (method === "PUT") {
    await updateEntity(connection, mutation.entity, data, userId);
    return "updated";
  }

  await upsertEntity(connection, mutation.entity, data, userId);
  return "upserted";
}

async function deleteEntity(connection: PoolConnection, entity: SyncEntityName, data: AnyRecord, userId: string) {
  if (entity === "settings" && data.key) {
    await connection.query("DELETE FROM settings WHERE `key` = ? AND (user_id = ? OR user_id IS NULL)", [String(data.key), userId]);
    return;
  }

  const id = String(data.id ?? "");
  if (!id) throw new Error(`Missing id for ${entity} delete`);

  if (entity === "moments") {
    await connection.query("DELETE FROM moment_tags WHERE moment_id = ?", [id]);
  }

  const config = entityConfigs[entityKeyMap[entity]];
  await connection.query(`DELETE FROM ${config.table} WHERE id = ? AND (user_id = ? OR user_id IS NULL)`, [id, userId]);
}

async function upsertEntity(connection: PoolConnection, entity: SyncEntityName, rawData: AnyRecord, userId: string) {
  const config = entityConfigs[entityKeyMap[entity]];
  const data = toSnake(rawData);
  const id = String(data.id ?? randomUUID());
  const fields = config.writable.filter((field) => data[field] !== undefined);
  const columns = ["id", "user_id", ...fields];
  const values = [id, userId, ...fields.map((field) => serialize(data[field]))];
  const updates = fields.map((field) => `${field} = VALUES(${field})`);

  if (fields.length === 0) {
    return;
  }

  await connection.query(
    `
      INSERT INTO ${config.table} (${columns.join(", ")}, created_at, updated_at)
      VALUES (${columns.map(() => "?").join(", ")}, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
      ON DUPLICATE KEY UPDATE ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP(3)
    `,
    values
  );
}

async function updateEntity(connection: PoolConnection, entity: SyncEntityName, rawData: AnyRecord, userId: string) {
  const config = entityConfigs[entityKeyMap[entity]];
  const data = toSnake(rawData);
  const id = String(data.id ?? "");
  if (!id) throw new Error(`Missing id for ${entity} update`);

  const fields = config.writable.filter((field) => data[field] !== undefined);
  if (fields.length === 0) return;

  await connection.query(
    `UPDATE ${config.table} SET ${fields.map((field) => `${field} = ?`).join(", ")}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND (user_id = ? OR user_id IS NULL)`,
    [...fields.map((field) => serialize(data[field])), id, userId]
  );
}

async function upsertMoment(connection: PoolConnection, rawData: AnyRecord, method: "POST" | "PUT", userId: string) {
  const data = toSnake(rawData);
  const id = String(data.id ?? randomUUID());
  const fields = ["content", "image_url"].filter((field) => data[field] !== undefined);

  if (method === "PUT") {
    if (fields.length > 0) {
      await connection.query(
        `UPDATE moments SET ${fields.map((field) => `${field} = ?`).join(", ")}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? AND (user_id = ? OR user_id IS NULL)`,
        [...fields.map((field) => serialize(data[field])), id, userId]
      );
    }
  } else {
    if (!data.content) throw new Error("Missing required fields: content");
    await connection.query(
      `
        INSERT INTO moments (id, user_id, content, image_url, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        ON DUPLICATE KEY UPDATE content = VALUES(content), image_url = VALUES(image_url), updated_at = CURRENT_TIMESTAMP(3)
      `,
      [id, userId, data.content, data.image_url ?? null]
    );
  }

  if (Array.isArray(rawData.tagIds)) {
    await connection.query("DELETE FROM moment_tags WHERE moment_id = ?", [id]);
    if (rawData.tagIds.length > 0) {
      await connection.query(
        `INSERT INTO moment_tags (moment_id, tag_id) VALUES ${rawData.tagIds.map(() => "(?, ?)").join(", ")}`,
        rawData.tagIds.flatMap((tagId) => [id, tagId])
      );
    }
  }
}

async function upsertSetting(connection: PoolConnection, rawData: AnyRecord, userId: string) {
  const key = String(rawData.key ?? "");
  if (!key) throw new Error("Missing required fields: key");

  await connection.query(
    `
      INSERT INTO settings (id, user_id, \`key\`, \`value\`, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
      ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), updated_at = CURRENT_TIMESTAMP(3)
    `,
    [String(rawData.id ?? randomUUID()), userId, key, serialize(rawData.value)]
  );
}

function serialize(value: unknown) {
  if (value && typeof value === "object") return JSON.stringify(value);
  return value;
}
