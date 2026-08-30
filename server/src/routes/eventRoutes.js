const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const registrationController = require("../controllers/registrationController");
const organizerController = require("../controllers/organizerController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");
const { validateEventCreation } = require("../middleware/validateMiddleware");
const { uploadPoster } = require("../middleware/uploadMiddleware");

// Public browsing
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);

// Event management (Organizers & Admin)
router.post(
  "/",
  authenticate,
  requireRole("ORGANIZER", "ADMIN"),
  uploadPoster,
  validateEventCreation,
  eventController.createEvent
);
router.put(
  "/:id",
  authenticate,
  requireRole("ORGANIZER", "ADMIN"),
  uploadPoster,
  eventController.updateEvent
);

router.delete(
  "/:id",
  authenticate,
  requireRole("ORGANIZER", "ADMIN"),
  eventController.deleteEvent
);

// Student Event Registration on /api/events/:id/register
router.post(
  "/:id/register",
  authenticate,
  requireRole("STUDENT", "ORGANIZER", "ADMIN"),
  registrationController.registerForEvent
);
router.delete(
  "/:id/register",
  authenticate,
  requireRole("STUDENT", "ORGANIZER", "ADMIN"),
  registrationController.cancelRegistration
);

// Organizer participant & attendance tools on /api/events/:id/...
router.get(
  "/:id/participants",
  authenticate,
  requireRole("ORGANIZER", "ADMIN"),
  organizerController.getEventParticipants
);
router.post(
  "/:id/attendance",
  authenticate,
  requireRole("ORGANIZER", "ADMIN"),
  organizerController.markAttendance
);

module.exports = router;
