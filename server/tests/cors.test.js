const request = require("supertest");
const app = require("../src/app");

describe("Express CORS Configuration Tests", () => {
  const currentVercelOrigin = "https://campusconnect-beta-sable.vercel.app";
  const previousVercelOrigin = "https://campusconnect-5vmv29j3l-team-2ab7.vercel.app";
  const rootVercelOrigin = "https://campusconnect.vercel.app";
  const localhostOrigin = "http://localhost:5173";
  const altLocalhostOrigin = "http://localhost:5174";
  const randomVercelOrigin = "https://random-project.vercel.app";
  const attackerVercelOrigin = "https://campusconnectattacker.vercel.app";
  const disallowedOrigin = "https://unauthorized-attacker-site.com";

  test("1. Should allow requests from current Vercel frontend (campusconnect-beta-sable.vercel.app)", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", currentVercelOrigin);

    expect(res.headers["access-control-allow-origin"]).toBe(currentVercelOrigin);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.statusCode).toBe(200);
  });

  test("2. Should allow requests from previous Vercel frontend (campusconnect-5vmv29j3l-team-2ab7.vercel.app)", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", previousVercelOrigin);

    expect(res.headers["access-control-allow-origin"]).toBe(previousVercelOrigin);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.statusCode).toBe(200);
  });

  test("3. Should allow requests from main Vercel domain (campusconnect.vercel.app)", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", rootVercelOrigin);

    expect(res.headers["access-control-allow-origin"]).toBe(rootVercelOrigin);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.statusCode).toBe(200);
  });

  test("4. Should successfully handle preflight OPTIONS requests from Vercel frontend", async () => {
    const res = await request(app)
      .options("/api/auth/login")
      .set("Origin", currentVercelOrigin)
      .set("Access-Control-Request-Method", "POST")
      .set("Access-Control-Request-Headers", "Content-Type, Authorization");

    expect(res.statusCode).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(currentVercelOrigin);
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
    expect(res.headers["access-control-allow-methods"]).toMatch(/POST/);
    expect(res.headers["access-control-allow-headers"]).toMatch(/Content-Type/i);
  });

  test("5. Should allow local development origins (localhost:5173, localhost:5174)", async () => {
    const res1 = await request(app)
      .get("/api/health")
      .set("Origin", localhostOrigin);

    expect(res1.headers["access-control-allow-origin"]).toBe(localhostOrigin);
    expect(res1.statusCode).toBe(200);

    const res2 = await request(app)
      .get("/api/health")
      .set("Origin", altLocalhostOrigin);

    expect(res2.headers["access-control-allow-origin"]).toBe(altLocalhostOrigin);
    expect(res2.statusCode).toBe(200);
  });

  test("6. Should reject unrelated Vercel domains (e.g. random-project.vercel.app)", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", randomVercelOrigin);

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("7. Should reject spoofed non-hyphenated Vercel domains (e.g. campusconnectattacker.vercel.app)", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", attackerVercelOrigin);

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("8. Should reject external malicious origins without wildcard", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", disallowedOrigin);

    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
