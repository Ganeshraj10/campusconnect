const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");
const logger = require("./logger");

const region = process.env.AWS_REGION || "ap-southeast-2";
const secretName = process.env.SECRETS_NAME || "campusconnect/config";

/**
 * Loads sensitive configurations (DATABASE_URL, JWT_SECRET) from AWS Secrets Manager.
 * Uses EC2 IAM Role credentials (default AWS SDK credential provider chain).
 * Gracefully falls back to local .env configuration when running locally.
 */
const loadSecrets = async () => {
  // If explicitly disabled (e.g. for offline unit testing), skip AWS request
  if (process.env.DISABLE_SECRETS_MANAGER === "true") {
    logger.info("AWS Secrets Manager disabled. Using local environment (.env) configuration.");
    return;
  }

  try {
    const client = new SecretsManagerClient({ region });
    const command = new GetSecretValueCommand({ SecretId: secretName });

    logger.info(`Connecting to AWS Secrets Manager (${region}) for secret "${secretName}"...`);
    const response = await client.send(command);

    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);

      if (secrets.DATABASE_URL) {
        process.env.DATABASE_URL = secrets.DATABASE_URL;
      }
      if (secrets.JWT_SECRET) {
        process.env.JWT_SECRET = secrets.JWT_SECRET;
      }
      if (secrets.JWT_EXPIRES_IN) {
        process.env.JWT_EXPIRES_IN = secrets.JWT_EXPIRES_IN;
      }

      logger.info("Successfully loaded database and JWT configuration from AWS Secrets Manager.");
    } else {
      logger.warn("Secrets Manager response did not contain string data.");
    }
  } catch (error) {
    const hasLocalFallback = Boolean(process.env.DATABASE_URL && process.env.JWT_SECRET);

    if (hasLocalFallback) {
      logger.info(
        `AWS Secrets Manager unavailable (${error.name || "Access Error"}). Using local .env fallback.`
      );
    } else {
      logger.error(
        `Failed to retrieve secrets from AWS Secrets Manager and no local fallback was found: ${error.message}`
      );
      throw error;
    }
  }
};

module.exports = {
  loadSecrets
};
