import { Router } from "express";
import { resolveOwnerId } from "../middleware/auth.js";
import { pool } from "../services/database.js";

export const backupController = Router();

const tables = [
  "articles",
  "moments",
  "albums",
  "album_photos",
  "categories",
  "tags",
  "memory_capsules",
  "inspirations",
  "mood_records",
  "locations",
  "settings"
];

backupController.get("/json", async (request, response, next) => {
  try {
    const userId = await resolveOwnerId(request);
    const backup = await collectBackup(userId);
    response.setHeader("Content-Disposition", `attachment; filename="life-museum-backup-${today()}.json"`);
    response.json({ exportedAt: new Date().toISOString(), ...backup });
  } catch (error) {
    next(error);
  }
});

backupController.get("/markdown", async (request, response, next) => {
  try {
    const userId = await resolveOwnerId(request);
    const backup = await collectBackup(userId);
    response.setHeader("Content-Type", "text/markdown; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="life-museum-backup-${today()}.md"`);
    response.send(toMarkdown(backup));
  } catch (error) {
    next(error);
  }
});

backupController.get("/images-manifest", async (request, response, next) => {
  try {
    const userId = await resolveOwnerId(request);
    const backup = await collectBackup(userId);
    const images = [
      ...backup.articles.filter((item) => item.cover_url).map((item) => imageEntry("articles", item.cover_url, item.title, item.created_at)),
      ...backup.moments.filter((item) => item.image_url).map((item) => imageEntry("moments", item.image_url, item.content, item.created_at)),
      ...backup.album_photos.filter((item) => item.image_url).map((item) => imageEntry("albums", item.image_url, item.description, item.created_at)),
      ...backup.locations.filter((item) => item.cover_image).map((item) => imageEntry("locations", item.cover_image, item.name, item.created_at))
    ];
    response.setHeader("Content-Disposition", `attachment; filename="life-museum-images-${today()}.json"`);
    response.json({ exportedAt: new Date().toISOString(), images });
  } catch (error) {
    next(error);
  }
});

async function collectBackup(userId: string) {
  const entries = await Promise.all(tables.map(async (table) => {
    const [rows] = await pool.query(`SELECT * FROM ${table} WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC`, [userId]);
    return [table, rows] as const;
  }));
  return Object.fromEntries(entries) as Record<string, Array<Record<string, string | null>>>;
}

function toMarkdown(backup: Record<string, Array<Record<string, string | null>>>) {
  const lines = [`# Life Museum Backup`, ``, `Exported at: ${new Date().toISOString()}`, ``];

  lines.push("## Articles", "");
  backup.articles.forEach((article) => {
    lines.push(`### ${article.title ?? "Untitled"}`, "", article.content ?? "", "");
  });

  lines.push("## Moments", "");
  backup.moments.forEach((moment) => {
    lines.push(`- ${moment.created_at ?? ""}: ${moment.content ?? ""}`);
  });

  lines.push("", "## Memory Capsules", "");
  backup.memory_capsules.forEach((capsule) => {
    lines.push(`### ${capsule.title ?? "Untitled"}`, "", `Date: ${capsule.date ?? ""}`, "", capsule.content ?? "", "");
  });

  return lines.join("\n");
}

function imageEntry(module: string, imageUrl: string | null, description: string | null, createdAt: string | null) {
  return {
    module,
    image_url: imageUrl,
    description,
    created_at: createdAt
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
