import { randomUUID } from "node:crypto";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import { pool } from "./database.js";
import { entityConfigs, EntityKey, toCamel, toSnake } from "../models/entities.js";

type AnyRecord = Record<string, unknown>;

function normalizeRow(row: AnyRecord) {
  const camel = toCamel(row);
  if (typeof camel.value === "string") {
    try {
      camel.value = JSON.parse(camel.value);
    } catch {
      camel.value = row.value;
    }
  }
  if (typeof camel.metadata === "string") {
    camel.metadata = JSON.parse(camel.metadata);
  }
  return camel;
}

function validateRequired(config: { required: readonly string[] }, data: AnyRecord) {
  const missing = config.required.filter((field) => data[field] === undefined || data[field] === "");
  if (missing.length > 0) {
    const error = new Error(`Missing required fields: ${missing.join(", ")}`);
    error.name = "ValidationError";
    throw error;
  }
}

async function withTransaction<T>(operation: (connection: PoolConnection) => Promise<T>) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function createCrudService(entity: EntityKey) {
  const config = entityConfigs[entity];

  return {
    async list(updatedAfter?: string, userId?: string) {
      const conditions = [];
      const params = [];
      if (updatedAfter) {
        conditions.push("updated_at > ?");
        params.push(updatedAfter);
      }
      if (config.userScoped && userId) {
        conditions.push("(user_id = ? OR user_id IS NULL)");
        params.push(userId);
      }
      const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const [rows] = await pool.query(`SELECT * FROM ${config.table} ${where} ORDER BY created_at DESC`, params);
      return (rows as AnyRecord[]).map(normalizeRow);
    },

    async get(id: string, userId?: string) {
      const userWhere = config.userScoped && userId ? "AND (user_id = ? OR user_id IS NULL)" : "";
      const params = config.userScoped && userId ? [id, userId] : [id];
      const [rows] = await pool.query(`SELECT * FROM ${config.table} WHERE id = ? ${userWhere} LIMIT 1`, params);
      return (rows as AnyRecord[]).map(normalizeRow)[0] ?? null;
    },

    async create(rawData: AnyRecord, userId?: string) {
      const data = toSnake(rawData);
      validateRequired(config, data);
      const id = String(data.id ?? randomUUID());
      const now = new Date().toISOString().slice(0, 23).replace("T", " ");
      const fields = config.writable.filter((field) => data[field] !== undefined);
      const values = fields.map((field) => serialize(data[field]));
      const userColumns = config.userScoped && userId ? ["user_id"] : [];
      const userValues = config.userScoped && userId ? [userId] : [];
      await withTransaction((connection) =>
        connection.query(
          `INSERT INTO ${config.table} (id, ${[...fields, ...userColumns].join(", ")}, created_at, updated_at) VALUES (?, ${[...fields, ...userColumns].map(() => "?").join(", ")}, ?, ?)`,
          [id, ...values, ...userValues, now, now]
        ).then(() => undefined)
      );
      return this.get(id, userId);
    },

    async update(id: string, rawData: AnyRecord, userId?: string) {
      const data = toSnake(rawData);
      const fields = config.writable.filter((field) => data[field] !== undefined);
      if (fields.length === 0) return this.get(id, userId);
      const assignments = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => serialize(data[field]));
      const userWhere = config.userScoped && userId ? "AND (user_id = ? OR user_id IS NULL)" : "";
      const params = config.userScoped && userId ? [...values, id, userId] : [...values, id];
      await withTransaction((connection) =>
        connection.query(`UPDATE ${config.table} SET ${assignments}, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ? ${userWhere}`, params).then(() => undefined)
      );
      return this.get(id, userId);
    },

    async upsert(rawData: AnyRecord, userId?: string) {
      const id = String(rawData.id ?? randomUUID());
      const existing = await this.get(id, userId);
      return existing ? this.update(id, rawData, userId) : this.create({ ...rawData, id }, userId);
    },

    async remove(id: string, userId?: string) {
      const result = await withTransaction(async (connection) => {
        const userWhere = config.userScoped && userId ? "AND (user_id = ? OR user_id IS NULL)" : "";
        const params = config.userScoped && userId ? [id, userId] : [id];
        const [deleteResult] = await connection.query<ResultSetHeader>(`DELETE FROM ${config.table} WHERE id = ? ${userWhere}`, params);
        return deleteResult;
      });
      return result.affectedRows > 0;
    }
  };
}

function serialize(value: unknown) {
  if (value && typeof value === "object") return JSON.stringify(value);
  return value;
}
