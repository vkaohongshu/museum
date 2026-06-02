import { NextFunction, Request, Response } from "express";
import { getDefaultUser, verifyToken } from "../services/authService.js";

export async function attachUser(request: Request, _response: Response, next: NextFunction) {
  const header = request.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  if (!token) {
    next();
    return;
  }

  try {
    const user = await verifyToken(token);
    if (user) request.user = user;
  } catch {
    // Invalid tokens are handled by requireAuth where authentication is mandatory.
  }

  next();
}

export async function requireAuth(request: Request, response: Response, next: NextFunction) {
  if (request.user) {
    next();
    return;
  }
  response.status(401).json({ message: "Authentication required" });
}

export async function requireWriteAuth(request: Request, response: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    next();
    return;
  }
  await requireAuth(request, response, next);
}

export async function resolveOwnerId(request: Request) {
  if (request.user?.id) return request.user.id;
  const user = await getDefaultUser();
  if (!user) throw new Error("Default admin user has not been seeded");
  return user.id;
}
