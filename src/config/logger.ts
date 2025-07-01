import { createLogger, format, transports, Logger } from "winston";
import path from "path";

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const logger: Logger = createLogger({
  levels,
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  defaultMeta: { service: "Tekcify Inc." },
  transports: [
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    new transports.File({ filename: path.join("logs", "combined.log") }),
  ],
});

// If not in production, log to the console as well
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

// Stream for morgan HTTP request logging
(logger as any).stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Helper functions for each log level
export const log = {
  error: (msg: string, meta?: any) => logger.error(msg, meta),
  warn: (msg: string, meta?: any) => logger.warn(msg, meta),
  info: (msg: string, meta?: any) => logger.info(msg, meta),
  http: (msg: string, meta?: any) => logger.http(msg, meta),
  verbose: (msg: string, meta?: any) => logger.verbose(msg, meta),
  debug: (msg: string, meta?: any) => logger.debug(msg, meta),
  silly: (msg: string, meta?: any) => logger.silly(msg, meta),
};

export default logger;
