const { loadSecrets } = require("./utils/secrets");
const logger = require("./utils/logger");

const startServer = async () => {
  try {
    // 1. Retrieve sensitive credentials from AWS Secrets Manager (or fallback to .env)
    await loadSecrets();

    // 2. Load Express application and Prisma database client
    const app = require("./app");
    const prisma = require("./utils/prisma");

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      logger.info(
        `CampusConnect Server started and listening on port ${PORT} (Environment: ${process.env.NODE_ENV || "development"})`
      );
      logger.info(`API Endpoints available at http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Stopping CampusConnect server...");
      await prisma.$disconnect();
      server.close(() => {
        logger.info("Server closed successfully.");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Fatal initialization error while starting server:", error);
    process.exit(1);
  }
};

startServer();
