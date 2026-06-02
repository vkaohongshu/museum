import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import { attachUser } from "./middleware/auth.js";
import { routes } from "./routes.js";

const app = express();

const allowedOrigins = config.nodeEnv === "production"
  ? [config.webOrigin]
  : [config.webOrigin, "http://localhost:5173", "http://127.0.0.1:5173"];

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("CORS origin is not allowed"));
  },
  credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(attachUser);
app.use("/api", routes);
app.use(routes);

app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const status = error.name === "ValidationError" ? 400 : 500;
  response.status(status).json({ message: error.message });
});

app.listen(config.serverPort, () => {
  console.log(`Life Museum API listening on http://127.0.0.1:${config.serverPort}`);
});
