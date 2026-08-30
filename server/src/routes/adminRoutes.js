const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/authMiddleware");

// All admin routes require ADMIN role
router.use(authenticate, requireRole("ADMIN"));

router.get("/events/pending", adminController.getPendingEvents);
router.put("/events/:id/approve", adminController.approveEvent);
router.put("/events/:id/reject", adminController.rejectEvent);
router.get("/users", adminController.getAllUsers);

module.exports = router;
