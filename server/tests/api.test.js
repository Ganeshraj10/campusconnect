const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/utils/prisma");

jest.setTimeout(30000);

describe("CampusConnect API Integration Tests", () => {

  let studentToken = "";
  let studentUser = null;
  let organizerToken = "";
  let organizerUser = null;
  let testEventId = "";
  let fullTestEventId = "";

  beforeAll(async () => {
    // Re-seed or ensure clean test state
    const timestamp = Date.now();

    // 1. Register a test Student
    const studentRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Student",
        email: `student_${timestamp}@test.edu`,
        password: "password123",
        role: "STUDENT",
        registerNumber: `2026TEST${timestamp.toString().slice(-4)}`,
        department: "Computer Science",
        year: "3rd Year",
        phone: "9998887770"
      });

    expect(studentRes.statusCode).toBe(201);
    expect(studentRes.body.success).toBe(true);
    expect(studentRes.body.data.token).toBeDefined();
    studentToken = studentRes.body.data.token;
    studentUser = studentRes.body.data.user;

    // 2. Register a test Organizer
    const orgRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test Organizer",
        email: `organizer_${timestamp}@test.edu`,
        password: "password123",
        role: "ORGANIZER",
        department: "Robotics Club",
        phone: "9998887771"
      });

    expect(orgRes.statusCode).toBe(201);
    organizerToken = orgRes.body.data.token;
    organizerUser = orgRes.body.data.user;
  });

  afterAll(async () => {
    // Clean up created test data
    try {
      if (testEventId) {
        await prisma.registration.deleteMany({ where: { eventId: testEventId } });
        await prisma.event.deleteMany({ where: { id: testEventId } });
      }
      if (fullTestEventId) {
        await prisma.registration.deleteMany({ where: { eventId: fullTestEventId } });
        await prisma.event.deleteMany({ where: { id: fullTestEventId } });
      }
      if (studentUser?.id) {
        await prisma.notification.deleteMany({ where: { userId: studentUser.id } });
        await prisma.user.deleteMany({ where: { id: studentUser.id } });
      }
      if (organizerUser?.id) {
        await prisma.user.deleteMany({ where: { id: organizerUser.id } });
      }
    } catch (err) {
      console.warn("Cleanup warning:", err.message);
    } finally {
      await prisma.$disconnect();
    }
  });

  describe("Authentication API", () => {
    test("POST /api/auth/login - Should successfully log in registered student", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: studentUser.email,
          password: "password123"
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(studentUser.email);
    });

    test("POST /api/auth/login - Should reject invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: studentUser.email,
          password: "wrongpassword"
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("GET /api/auth/me - Should return current user profile with valid JWT", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(studentUser.id);
    });
  });

  describe("Events API", () => {
    test("POST /api/events - Should allow Organizer to create a new event", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          name: "Jest Automated Hackathon",
          description: "Integration test event description.",
          category: "Technical",
          date: "2026-11-20",
          startTime: "10:00 AM",
          endTime: "04:00 PM",
          venue: "Lab 101",
          teamSize: "1 - 3 Members",
          capacity: 50,
          registrationDeadline: "2026-11-18",
          rules: ["Bring laptop", "Valid college ID"]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Jest Automated Hackathon");
      testEventId = res.body.data.id;
    });

    test("POST /api/events - Should reject student from creating an event (403 Forbidden)", async () => {
      const res = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          name: "Unauthorized Event",
          category: "Workshop",
          date: "2026-11-20",
          venue: "Hall A",
          capacity: 20
        });

      expect(res.statusCode).toBe(403);
    });

    test("GET /api/events - Should retrieve event list publicly", async () => {
      const res = await request(app).get("/api/events");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("GET /api/events/:id - Should retrieve single event details", async () => {
      const res = await request(app).get(`/api/events/${testEventId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testEventId);
    });
  });

  describe("Event Registration & Business Rules API", () => {
    test("POST /api/events/:id/register - Should successfully register student for an event", async () => {
      const res = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          teamName: "Test Team Alpha",
          teamMembers: "Test Student"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.eventId).toBe(testEventId);
      expect(res.body.data.userId).toBe(studentUser.id);
    });

    test("Business Rule 1: Prevent duplicate event registration (400 Bad Request)", async () => {
      const res = await request(app)
        .post(`/api/events/${testEventId}/register`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          teamName: "Test Team Alpha"
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already registered/i);
    });

    test("GET /api/my-events - Should retrieve student's registered events", async () => {
      const res = await request(app)
        .get("/api/my-events")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((r) => r.event.id === testEventId)).toBe(true);
    });

    test("Business Rule 3: Prevent registration when event reaches max capacity", async () => {
      // 1. Create an event with capacity = 1
      const createFullRes = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${organizerToken}`)
        .send({
          name: "Micro Capacity Workshop",
          category: "Workshop",
          date: "2026-11-25",
          venue: "Room 10",
          capacity: 1,
          registrationDeadline: "2026-11-24"
        });

      fullTestEventId = createFullRes.body.data.id;

      // 2. Register first student -> Fills the 1 available seat
      const firstReg = await request(app)
        .post(`/api/events/${fullTestEventId}/register`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(firstReg.statusCode).toBe(201);

      // 3. Create a 2nd student to attempt registering for the now-full event
      const student2Res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Second Student",
          email: `student2_${Date.now()}@test.edu`,
          password: "password123",
          role: "STUDENT"
        });

      const student2Token = student2Res.body.data.token;

      // 4. Attempt second registration -> Should be rejected with 400
      const secondReg = await request(app)
        .post(`/api/events/${fullTestEventId}/register`)
        .set("Authorization", `Bearer ${student2Token}`);

      expect(secondReg.statusCode).toBe(400);
      expect(secondReg.body.message).toMatch(/capacity/i);

      // Clean up student 2
      await prisma.user.delete({ where: { id: student2Res.body.data.user.id } });
    });

    test("DELETE /api/events/:id/register - Should allow student to cancel registration and free up seat", async () => {
      const res = await request(app)
        .delete(`/api/events/${testEventId}/register`)
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/cancelled successfully/i);
    });
  });
});
