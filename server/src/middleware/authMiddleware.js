const { verifyToken } = require("../utils/jwt");
const prisma = require("../utils/prisma");
const logger = require("../utils/logger");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided."
      });
    }


    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        registerNumber: true,
        year: true,
        phone: true
      }
    });

    if (!user) {
      logger.warn(`Authentication failed: User ID ${decoded.id} from token no longer exists.`);
      return res.status(401).json({
        success: false,
        message: "User session expired or user no longer exists."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.warn(`Authentication failed: Invalid or expired token on ${req.method} ${req.originalUrl} (${error.message})`);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
      error: error.message
    });
  }
};

// Optional authentication (for public browsing where logged in status gives extra context)
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true }
      });
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token in optional mode
  }
  next();
};

// Role authorization guard
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn(`Authorization denied: Unauthenticated request to ${req.method} ${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Authorization forbidden: User ${req.user.email} (${req.user.role}) attempted action requiring role ${allowedRoles.join(" or ")} on ${req.method} ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        message: `Forbidden. Action requires role: ${allowedRoles.join(" or ")}.`
      });
    }

    next();
  };
};


module.exports = {
  authenticate,
  optionalAuthenticate,
  requireRole
};
