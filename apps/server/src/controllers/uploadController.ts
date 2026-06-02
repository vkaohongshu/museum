import { Router } from "express";
import multer from "multer";
import { resolveOwnerId } from "../middleware/auth.js";
import { uploadImage } from "../services/storageService.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20
  },
  fileFilter: (_request, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      callback(new Error("Only image uploads are allowed"));
      return;
    }
    callback(null, true);
  }
});

export const uploadController = Router();

uploadController.post("/image", upload.single("image"), async (request, response, next) => {
  try {
    if (!request.file) {
      response.status(400).json({ message: "Missing image file" });
      return;
    }
    response.status(201).json(await uploadImage(request.file, await resolveOwnerId(request), String(request.body.scope ?? "images")));
  } catch (error) {
    next(error);
  }
});

uploadController.post("/", upload.array("images", 20), async (request, response, next) => {
  try {
    const files = (request.files ?? []) as Express.Multer.File[];
    if (files.length === 0) {
      response.status(400).json({ message: "Missing image files" });
      return;
    }
    const userId = await resolveOwnerId(request);
    const scope = String(request.body.scope ?? "images");
    const uploaded = await Promise.all(files.map((file) => uploadImage(file, userId, scope)));
    response.status(201).json({
      files: uploaded,
      urls: uploaded.map((file) => file.url)
    });
  } catch (error) {
    next(error);
  }
});
