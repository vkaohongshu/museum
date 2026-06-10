import { Router } from "express";
import { albumPhotosController } from "./controllers/albumPhotosController.js";
import { albumsController } from "./controllers/albumsController.js";
import { authController } from "./controllers/authController.js";
import { backupController } from "./controllers/backupController.js";
import { crudController } from "./controllers/crudController.js";
import { momentsController } from "./controllers/momentsController.js";
import { mediaController } from "./controllers/mediaController.js";
import { publicController } from "./controllers/publicController.js";
import { settingsController } from "./controllers/settingsController.js";
import { syncController } from "./controllers/syncController.js";
import { uploadController } from "./controllers/uploadController.js";
import { requireAuth, requireWriteAuth } from "./middleware/auth.js";

export const routes = Router();

routes.get("/health", (_request, response) => {
  response.json({ ok: true, service: "life-museum-server" });
});

routes.use("/auth", authController);
routes.use("/media", mediaController);
routes.use("/public", publicController);
routes.use("/admin/backup", requireAuth, backupController);
routes.use(requireWriteAuth);
routes.use("/moments", momentsController);
routes.use("/albums/:albumId/photos", albumPhotosController);
routes.use("/settings", settingsController);
routes.use("/articles", crudController("articles"));
routes.use("/albums", albumsController);
routes.use("/album-photos", crudController("albumPhotos"));
routes.use("/categories", crudController("categories"));
routes.use("/tags", crudController("tags"));
routes.use("/memory_capsules", crudController("memoryCapsules"));
routes.use("/memory-capsules", crudController("memoryCapsules"));
routes.use("/inspirations", crudController("inspirations"));
routes.use("/mood-records", crudController("moodRecords"));
routes.use("/locations", crudController("locations"));
routes.use("/settings", crudController("settings"));
routes.use("/upload", requireAuth, uploadController);
routes.use("/uploads", requireAuth, uploadController);
routes.use("/sync", requireAuth, syncController);
