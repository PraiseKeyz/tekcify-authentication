import app from "./app";
import { appConfig } from "./config/app.config";
import { connectDb } from "./config/db";
import { log } from "./config/logger";

log.info("Starting server initialization...");

const startServer = async (): Promise<void> => {
  try {
    await connectDb();
    log.info("Database connection established successfully.");

    const server = app.listen(appConfig.port, () => {
      log.info(
        `Server running on ${appConfig.appUrl} (port ${appConfig.port}) [${appConfig.nodeEnv}]`,
      );
    });

    // gracefully shutdown
    process.on("SIGTERM", () => {
      log.info("SIGTERM signal received: closing server");
      server.close(() => {
        log.info("Server closed");
      });
    });

    // unhandled promise rejection
    process.on("unhandledRejection", (reason: any) => {
      log.error("Unhandled Rejection:", reason);
      server.close(() => {
        process.exit(1);
      });
    });

    // uncaught exception
    process.on("uncaughtException", (err: Error) => {
      log.error("Uncaught Exception:", err);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    log.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
