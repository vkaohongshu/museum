import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pool } from "./services/database.js";

const migrationsDir = resolve(process.cwd(), "../../db/migrations");
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();
let applied = 0;

for (const file of files) {
  const migration = await readFile(resolve(migrationsDir, file), "utf8");
  const statements = migration
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) {
    try {
      await pool.query(statement);
      applied += 1;
    } catch (error) {
      if (isIgnorableMigrationError(error)) continue;
      throw error;
    }
  }
}

await pool.end();
console.log(`Applied ${applied} database statements from ${files.length} migration files.`);

function isIgnorableMigrationError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      ["ER_DUP_FIELDNAME", "ER_TABLE_EXISTS_ERROR", "ER_DUP_KEYNAME"].includes(String((error as { code?: unknown }).code))
  );
}
