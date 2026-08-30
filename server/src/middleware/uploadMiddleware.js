const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type: ${file.mimetype}. Allowed types: image/jpeg, image/png, image/webp.`
    );
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB
  },
  fileFilter
});

/**
 * Middleware for single file poster upload supporting multipart/form-data
 */
const uploadPoster = (req, res, next) => {
  // If Content-Type is not multipart/form-data, skip multer parsing
  const contentType = req.headers["content-type"] || "";
  if (!contentType.startsWith("multipart/form-data")) {
    return next();
  }

  upload.single("poster")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds the 5 MB limit."
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      }
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || "Invalid file upload."
      });
    }
    next();
  });
};

module.exports = {
  upload,
  uploadPoster
};
