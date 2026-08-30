const express = require("express");
const router = express.Router();
const organizerController = require("../controllers/organizerController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

// GET /api/organizer/events
router.get(
  "/events",
  authenticate,
  requireRole("ORGANIZER", "ADMIN"),
  organizerController.getOrganizerEvents
);

module.exports = router;
