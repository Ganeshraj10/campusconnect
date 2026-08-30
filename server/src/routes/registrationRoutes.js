const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");
const { authenticate } = require("../middleware/authMiddleware");

// GET /api/my-events
router.get("/my-events", authenticate, registrationController.getMyEvents);

module.exports = router;
