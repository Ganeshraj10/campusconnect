const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { validateRegistration, validateLogin } = require("../middleware/validateMiddleware");

router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
