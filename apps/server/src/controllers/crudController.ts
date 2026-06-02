import { Router } from "express";
import { createCrudService } from "../services/crudService.js";
import { EntityKey } from "../models/entities.js";
import { resolveOwnerId } from "../middleware/auth.js";

export function crudController(entity: EntityKey) {
  const router = Router();
  const service = createCrudService(entity);

  router.get("/", async (request, response, next) => {
    try {
      response.json(await service.list(String(request.query.updatedAfter ?? ""), await resolveOwnerId(request)));
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (request, response, next) => {
    try {
      const item = await service.get(request.params.id, await resolveOwnerId(request));
      if (!item) response.status(404).json({ message: "Not found" });
      else response.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (request, response, next) => {
    try {
      response.status(201).json(await service.create(request.body, await resolveOwnerId(request)));
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (request, response, next) => {
    try {
      response.json(await service.update(request.params.id, request.body, await resolveOwnerId(request)));
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (request, response, next) => {
    try {
      const removed = await service.remove(request.params.id, await resolveOwnerId(request));
      response.status(removed ? 204 : 404).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
