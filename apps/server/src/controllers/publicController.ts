import { Router } from "express";
import { resolveOwnerId } from "../middleware/auth.js";
import { createCrudService } from "../services/crudService.js";
import { pool } from "../services/database.js";

export const publicController = Router();

const articles = createCrudService("articles");
const moments = createCrudService("moments");
const albums = createCrudService("albums");
const settings = createCrudService("settings");

publicController.get("/articles", async (request, response, next) => {
  try {
    response.json(await articles.list("", await resolveOwnerId(request)));
  } catch (error) {
    next(error);
  }
});

publicController.get("/articles/:id", async (request, response, next) => {
  try {
    const item = await articles.get(request.params.id, await resolveOwnerId(request));
    if (!item) response.status(404).json({ message: "Not found" });
    else response.json(item);
  } catch (error) {
    next(error);
  }
});

publicController.get("/moments", async (request, response, next) => {
  try {
    response.json(await moments.list("", await resolveOwnerId(request)));
  } catch (error) {
    next(error);
  }
});

publicController.get("/albums", async (request, response, next) => {
  try {
    response.json(await listAlbumsWithPhotos(await resolveOwnerId(request)));
  } catch (error) {
    next(error);
  }
});

publicController.get("/albums/:id", async (request, response, next) => {
  try {
    const item = (await listAlbumsWithPhotos(await resolveOwnerId(request), request.params.id))[0];
    if (!item) response.status(404).json({ message: "Not found" });
    else response.json(item);
  } catch (error) {
    next(error);
  }
});

publicController.get("/timeline", async (request, response, next) => {
  try {
    const userId = await resolveOwnerId(request);
    const [articleRows] = await pool.query("SELECT id, title, created_at AS createdAt FROM articles WHERE user_id = ? OR user_id IS NULL", [userId]);
    const [momentRows] = await pool.query("SELECT id, content, created_at AS createdAt FROM moments WHERE user_id = ? OR user_id IS NULL", [userId]);
    const [albumRows] = await pool.query("SELECT id, title, created_at AS createdAt FROM albums WHERE user_id = ? OR user_id IS NULL", [userId]);
    response.json({ articles: articleRows, moments: momentRows, albums: albumRows });
  } catch (error) {
    next(error);
  }
});

publicController.get("/monthly-digest", (_request, response) => {
  response.json({ items: [] });
});

publicController.get("/year-review", (_request, response) => {
  response.json({ items: [] });
});

publicController.get("/settings", async (request, response, next) => {
  try {
    response.json(await settings.list("", await resolveOwnerId(request)));
  } catch (error) {
    next(error);
  }
});

async function listAlbumsWithPhotos(userId: string, albumId?: string) {
  const where = albumId ? "WHERE a.id = ? AND (a.user_id = ? OR a.user_id IS NULL)" : "WHERE a.user_id = ? OR a.user_id IS NULL";
  const params = albumId ? [albumId, userId] : [userId];
  const [rows] = await pool.query(
    `
      SELECT
        a.id,
        a.title,
        a.description,
        a.created_at AS createdAt,
        a.updated_at AS updatedAt,
        COALESCE(JSON_ARRAYAGG(
          CASE WHEN p.id IS NULL THEN NULL ELSE JSON_OBJECT(
            'id', p.id,
            'albumId', p.album_id,
            'imageUrl', p.image_url,
            'description', p.description,
            'createdAt', p.created_at,
            'updatedAt', p.updated_at
          ) END
        ), JSON_ARRAY()) AS photos
      FROM albums a
      LEFT JOIN album_photos p ON p.album_id = a.id
      ${where}
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `,
    params
  );

  return (rows as Array<Record<string, unknown>>).map((row) => ({
    ...row,
    photos: parsePhotos(row.photos)
  }));
}

function parsePhotos(value: unknown) {
  if (!value) return [];
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
}
