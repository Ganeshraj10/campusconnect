const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

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
