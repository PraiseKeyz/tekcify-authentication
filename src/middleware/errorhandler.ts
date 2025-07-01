import { Request, Response, NextFunction } from "express";
import { log } from "../config/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Log the error
  log.error("Unhandled error:", err);

  // Determine status code
  const status = err.status || err.statusCode || 500;

  // Send a consistent error response
  res.status(status).json({
    status: "error",
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}
