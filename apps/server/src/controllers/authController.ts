import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { signToken, verifyLogin } from "../services/authService.js";

export const authController = Router();

authController.post("/login", async (request, response, next) => {
  try {
    const email = String(request.body.email ?? "");
    const password = String(request.body.password ?? "");
    const user = await verifyLogin(email, password);
    
    if (!user) {
      response.status(401).json({ message: "Invalid email or password" });
      return;
    }
    response.json({ token: signToken(user), user });
  } catch (error) {
    next(error);
  }
});

authController.get("/me", requireAuth, (request, response) => {
  response.json({ user: request.user });
});

authController.post("/logout", requireAuth, (_request, response) => {
  response.status(204).send();
});
