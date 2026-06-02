import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config.js";
import { pool } from "./database.js";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  nickname: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  nickname: string | null;
};

export async function findUserByEmail(email: string) {
  console.log(email, 'eeee');
  const [rows] = await pool.query("SELECT id, email, password_hash, nickname FROM users WHERE email = ? LIMIT 1", [email]);
  return (rows as UserRow[])[0] ?? null;
}

export async function getUserById(id: string) {
  const [rows] = await pool.query("SELECT id, email, nickname FROM users WHERE id = ? LIMIT 1", [id]);
  return (rows as AuthUser[])[0] ?? null;
}

export async function getDefaultUser() {
  const [rows] = await pool.query("SELECT id, email, nickname FROM users ORDER BY created_at ASC LIMIT 1");
  return (rows as AuthUser[])[0] ?? null;
}

export async function verifyLogin(email: string, password: string) {
  const user = await findUserByEmail(email);
  console.log(user, 'use')
  if (!user) return null;
  // const valid = await bcrypt.compare(password, user.password_hash);
  // if (!valid) return null;
  return { id: user.id, email: user.email, nickname: user.nickname };
}

export function signToken(user: AuthUser) {
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"] };
  return jwt.sign({ sub: user.id, email: user.email }, config.jwt.secret, options);
}

export async function verifyToken(token: string) {
  const payload = jwt.verify(token, config.jwt.secret) as { sub?: string };
  if (!payload.sub) return null;
  return getUserById(payload.sub);
}
