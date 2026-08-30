const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const eventRoutes = require("./eventRoutes");
const registrationRoutes = require("./registrationRoutes");
const organizerRoutes = require("./organizerRoutes");
const adminRoutes = require("./adminRoutes");

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "CampusConnect API is running smoothly.",
    timestamp: new Date().toISOString()
  });
});

// Mount modular subroutes
router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/", registrationRoutes); // Mounts /api/my-events
router.use("/organizer", organizerRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
