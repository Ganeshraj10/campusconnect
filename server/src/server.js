const app = require("./app");
const prisma = require("./utils/prisma");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 CampusConnect Server running on port ${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nStopping CampusConnect server...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
