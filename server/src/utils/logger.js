const fs = require("fs");
const path = require("path");

// Resolve the absolute path to server/logs/app.log
const logsDirectory = path.join(__dirname, "../../logs");
const logFilePath = path.join(logsDirectory, "app.log");

/**
 * Ensures that the logs directory exists.
 */
const ensureLogDirectoryExists = () => {
  try {
    if (!fs.existsSync(logsDirectory)) {
      fs.mkdirSync(logsDirectory, { recursive: true });
    }
  } catch (err) {
    console.error("Failed to create log directory:", err.message);
  }
};

/**
 * Formats a log entry line with timestamp and severity level.
 * @param {string} level - INFO, WARN, or ERROR
 * @param {string} message - Human-readable log message
 * @returns {string} Formatted log line
 */
const formatLogEntry = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
};

/**
 * Appends a log line to server/logs/app.log.
 * @param {string} level - INFO, WARN, or ERROR
 * @param {string} message - Message to write
 */
const appendToLogFile = (level, message) => {
  try {
    ensureLogDirectoryExists();
    const logLine = formatLogEntry(level, message);
    fs.appendFileSync(logFilePath, logLine, "utf8");
  } catch (err) {
    console.error("Failed to append to log file:", err.message);
  }
};

const logger = {
  info: (message) => {
    console.log(`[INFO] ${message}`);
    appendToLogFile("INFO", message);
  },

  warn: (message) => {
    console.warn(`[WARN] ${message}`);
    appendToLogFile("WARN", message);
  },

  error: (message, error = null) => {
    let details = message;
    if (error) {
      const errText = error.message || String(error);
      details = `${message} - ${errText}`;
    }
    console.error(`[ERROR] ${details}`);
    appendToLogFile("ERROR", details);
  },

  // Helper method to get the current log file path for debugging/verification
  getLogFilePath: () => logFilePath
};

module.exports = logger;
