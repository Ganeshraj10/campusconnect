const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const path = require("path");

const region = process.env.AWS_REGION || "ap-southeast-2";
const bucketName = process.env.S3_BUCKET_NAME || "REPLACE_WITH_MY_BUCKET_NAME";

// Initialize S3Client using EC2 IAM Role credentials
const s3Client = new S3Client({
  region
});

// Presigned GET URL expiry (1 hour = 3600 seconds)
const PRESIGNED_URL_EXPIRES_IN = 3600;

// Allowed image MIME types and maximum file size (5 MB)
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes

/**
 * Validates the uploaded poster image buffer and metadata
 * @param {Object} file - Multer file object
 */
const validatePosterFile = (file) => {
  if (!file) {
    const error = new Error("No image file provided.");
    error.statusCode = 400;
    throw error;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error = new Error(
      `Invalid file type: ${file.mimetype}. Allowed types: image/jpeg, image/png, image/webp.`
    );
    error.statusCode = 400;
    throw error;
  }

  if (file.size > MAX_FILE_SIZE) {
    const error = new Error("File size exceeds the 5 MB limit.");
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Upload an event poster to S3 bucket under 'event-posters/' prefix
 * @param {Object} file - Multer file object with buffer
 * @returns {Promise<string>} S3 object key (e.g. event-posters/{uuid}-{filename})
 */
const uploadEventPoster = async (file) => {
  validatePosterFile(file);

  const uniqueId = crypto.randomUUID();
  const sanitizedFilename = path
    .basename(file.originalname || "poster.jpg")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  const posterKey = `event-posters/${uniqueId}-${sanitizedFilename}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: posterKey,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  await s3Client.send(command);
  return posterKey;
};

/**
 * Delete an event poster object from S3
 * @param {string|null} posterKey - S3 object key
 */
const deleteEventPoster = async (posterKey) => {
  if (!posterKey) return;

  // Skip deletion if the posterKey is an external URL (e.g. Unsplash demo fallback)
  if (posterKey.startsWith("http://") || posterKey.startsWith("https://")) {
    return;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: posterKey
    });
    await s3Client.send(command);
  } catch (err) {
    console.warn(`Failed to delete S3 poster ${posterKey}:`, err.message);
  }
};

/**
 * Generate a temporary presigned GET URL for a private S3 poster key
 * Returns null if posterKey is null.
 * Returns the raw URL if posterKey is an external URL.
 * @param {string|null} posterKey - S3 object key or external URL
 * @returns {Promise<string|null>} Presigned GET URL or direct URL
 */
const getPresignedPosterUrl = async (posterKey) => {
  if (!posterKey) return null;

  // External URL backward compatibility
  if (posterKey.startsWith("http://") || posterKey.startsWith("https://")) {
    return posterKey;
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: posterKey
    });
    return await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRES_IN
    });
  } catch (err) {
    // In local development or test without live AWS EC2 IAM role, provide development URL
    if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
      return `https://${bucketName}.s3.${region}.amazonaws.com/${posterKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${PRESIGNED_URL_EXPIRES_IN}`;
    }
    console.warn(`Failed to generate presigned URL for ${posterKey}:`, err.message);
    return null;
  }
};


module.exports = {
  s3Client,
  uploadEventPoster,
  deleteEventPoster,
  getPresignedPosterUrl,
  validatePosterFile,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  PRESIGNED_URL_EXPIRES_IN
};
