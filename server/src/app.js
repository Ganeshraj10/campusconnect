const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middlewares
const rawCorsOrigin =
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173";
const allowedOrigins = rawCorsOrigin.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, direct browser navigation)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      // Allow local development server ports dynamically
      if (
        /^http:\/\/localhost:[0-9]+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:[0-9]+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from origin: ${origin}`), false);
    },
    credentials: true
  })
);

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
