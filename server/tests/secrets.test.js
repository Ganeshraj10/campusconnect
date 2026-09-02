const { mockClient } = require("aws-sdk-client-mock");
const {
  SecretsManagerClient,
  GetSecretValueCommand
} = require("@aws-sdk/client-secrets-manager");
const { loadSecrets } = require("../src/utils/secrets");

const secretsMock = mockClient(SecretsManagerClient);

describe("AWS Secrets Manager Integration & Fallback Tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    secretsMock.reset();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("1. Should successfully retrieve and load DATABASE_URL and JWT_SECRET from Secrets Manager", async () => {
    const mockSecretPayload = {
      DATABASE_URL: "postgresql://secretsadmin:secretpass@mock-db.aws.com:5432/campusconnect",
      JWT_SECRET: "mock_secrets_manager_jwt_secret_key",
      JWT_EXPIRES_IN: "14d"
    };

    secretsMock.on(GetSecretValueCommand).resolves({
      SecretString: JSON.stringify(mockSecretPayload)
    });

    await loadSecrets();

    expect(process.env.DATABASE_URL).toBe(mockSecretPayload.DATABASE_URL);
    expect(process.env.JWT_SECRET).toBe(mockSecretPayload.JWT_SECRET);
    expect(process.env.JWT_EXPIRES_IN).toBe("14d");
  });

  test("2. Should fall back to local .env configuration when Secrets Manager call fails", async () => {
    process.env.DATABASE_URL = "postgresql://localuser:localpass@localhost:5432/campusconnect";
    process.env.JWT_SECRET = "local_jwt_secret";

    secretsMock.on(GetSecretValueCommand).rejects(new Error("ResourceNotFoundException"));

    // Should not throw error because local fallback is available
    await expect(loadSecrets()).resolves.not.toThrow();

    expect(process.env.DATABASE_URL).toBe("postgresql://localuser:localpass@localhost:5432/campusconnect");
    expect(process.env.JWT_SECRET).toBe("local_jwt_secret");
  });

  test("3. Should throw error when Secrets Manager fails and no local fallback exists", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;

    secretsMock.on(GetSecretValueCommand).rejects(new Error("AccessDeniedException"));

    await expect(loadSecrets()).rejects.toThrow("AccessDeniedException");
  });

  test("4. Should skip Secrets Manager if DISABLE_SECRETS_MANAGER is set to true", async () => {
    process.env.DISABLE_SECRETS_MANAGER = "true";
    process.env.DATABASE_URL = "postgresql://localuser:localpass@localhost:5432/campusconnect";

    await loadSecrets();

    expect(secretsMock.calls().length).toBe(0);
    expect(process.env.DATABASE_URL).toBe("postgresql://localuser:localpass@localhost:5432/campusconnect");
  });
});
