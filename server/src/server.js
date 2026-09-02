const app = require("./app");
const prisma = require("./utils/prisma");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`CampusConnect Server started and listening on port ${PORT} (Environment: ${process.env.NODE_ENV || "development"})`);
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

