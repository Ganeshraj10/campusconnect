const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middlewares
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
];

const envOrigins = [
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : [])
]
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins]));

// Regex to securely allow CampusConnect Vercel deployments (campusconnect.vercel.app & campusconnect-*.vercel.app)
const campusConnectVercelPattern = /^https:\/\/campusconnect(-[a-z0-9_-]+)*\.vercel\.app$/i;

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Direct requests / curl / mobile apps / server-to-server

  const normalizedOrigin = origin.replace(/\/$/, "");

  // 1. Match exact allowed origins list (from env or defaults)
  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  // 2. Allow local development server ports dynamically (e.g., localhost:5173, 127.0.0.1:5174)
  if (
    /^http:\/\/localhost:[0-9]+$/.test(normalizedOrigin) ||
    /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(normalizedOrigin)
  ) {
    return true;
  }

  // 3. Allow CampusConnect Vercel deployments (e.g. campusconnect-beta-sable.vercel.app, campusconnect-5vmv29j3l-team-2ab7.vercel.app)
  if (campusConnectVercelPattern.test(normalizedOrigin)) {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome
app.get("/", (req, res) => {
  res.json({
    name: "CampusConnect API",
    version: "1.0.0",
    docs: "/api/health",
    endpoints: {
      auth: "/api/auth",
      events: "/api/events",
      myEvents: "/api/my-events",
      organizer: "/api/organizer",
      admin: "/api/admin"
    }
  });
});

// Mount /api routes
app.use("/api", routes);

// 404 & Global Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
