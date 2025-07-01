import express, { Request, Response, Application } from "express";
import cors from "cors"; // For enabling CORS
import helmet from "helmet"; // For securing HTTP headers
import dotenv from "dotenv";
import routes from "./router/base.router";
import { errorHandler } from "./middleware/errorhandler";
import { appConfig } from "./config/app.config";
import { log } from "./config/logger";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.get("/api/health", (req: Request, res: Response) => {
  const uptime = process.uptime();
  const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    environment: appConfig.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    memoryUsage: process.memoryUsage(),
  });
});

// API endpoints
Object.entries(routes).forEach(([path, router]) => {
  app.use("/api/v1" + path, router);
});

// 404 handler
app.use((req: Request, res: Response) => {
  log.warn("404 Not Found", { url: req.originalUrl });
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

export default app;
