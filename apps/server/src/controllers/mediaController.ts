import { Router } from "express";
import { getStoredImage } from "../services/storageService.js";

export const mediaController = Router();

mediaController.get("/*", async (request, response, next) => {
  try {
    const key = decodeURIComponent(request.path.replace(/^\/+/, ""));
    if (!key.startsWith("uploads/")) {
      response.status(404).json({ message: "Not found" });
      return;
    }

    const image = await getStoredImage(key);
    response.setHeader("Content-Type", image.contentType ?? "application/octet-stream");
    response.setHeader("Cache-Control", image.cacheControl ?? "public, max-age=31536000, immutable");
    response.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (image.contentLength !== undefined) {
      response.setHeader("Content-Length", String(image.contentLength));
    }

    const body = image.body as { pipe?: (destination: NodeJS.WritableStream) => void; transformToByteArray?: () => Promise<Uint8Array> };
    if (body.pipe) {
      body.pipe(response);
      return;
    }
    if (body.transformToByteArray) {
      response.send(Buffer.from(await body.transformToByteArray()));
      return;
    }
    throw new Error("Stored image body is unavailable");
  } catch (error) {
    next(error);
  }
});
