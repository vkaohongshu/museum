import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { pool } from "./services/database.js";

if (!config.admin.email || !config.admin.password) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the default admin user");
}

const passwordHash = await bcrypt.hash(config.admin.password, 12);

await pool.query(
  `
    INSERT INTO users (id, email, password_hash, nickname, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
    ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nickname = VALUES(nickname), updated_at = CURRENT_TIMESTAMP(3)
  `,
  [randomUUID(), config.admin.email, passwordHash, config.admin.nickname]
);

await pool.end();
console.log(`Seeded admin user: ${config.admin.email}`);
