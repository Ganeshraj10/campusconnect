const request = require("supertest");
const { mockClient } = require("aws-sdk-client-mock");
const {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} = require("@aws-sdk/client-s3");

// Mock @aws-sdk/s3-request-presigner
jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: jest.fn().mockImplementation(async (client, command, options) => {
    return `https://${command.input.Bucket}.s3.ap-southeast-2.amazonaws.com/${command.input.Key}?X-Amz-Expires=${options?.expiresIn || 3600}&X-Amz-Signature=mock-presigned-sig`;
  })
}));

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const app = require("../src/app");
const prisma = require("../src/utils/prisma");
const { s3Client, getPresignedPosterUrl } = require("../src/services/s3Service");

jest.setTimeout(30000);

const s3Mock = mockClient(s3Client);


describe("Amazon S3 Event Poster Integration & Unit Tests", () => {
  let organizerToken = "";
  let organizerUser = null;
  const createdEventIds = [];

  beforeAll(async () => {
    // Reset S3 mocks
    s3Mock.reset();
    s3Mock.on(PutObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});
    s3Mock.on(GetObjectCommand).resolves({});

    // Register a test organizer
    const timestamp = Date.now();
    const orgRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "S3 Test Organizer",
        email: `s3_organizer_${timestamp}@test.edu`,
        password: "password123",
        role: "ORGANIZER",
        department: "Computer Science Society",
        phone: "9123456780"
      });

    organizerToken = orgRes.body.data.token;
    organizerUser = orgRes.body.data.user;
  });

  beforeEach(() => {
    s3Mock.reset();
    s3Mock.on(PutObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});
    s3Mock.on(GetObjectCommand).resolves({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    try {
      for (const eventId of createdEventIds) {
        await prisma.registration.deleteMany({ where: { eventId } });
        await prisma.event.deleteMany({ where: { id: eventId } });
      }
      if (organizerUser?.id) {
        await prisma.user.deleteMany({ where: { id: organizerUser.id } });
      }
    } catch (err) {
      console.warn("S3 Test cleanup warning:", err.message);
    } finally {
      await prisma.$disconnect();
    }
  });

  // 1. Event without poster
  test("1. Create event without poster - Should succeed with posterKey and posterUrl as null", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        name: "Event Without Poster",
        description: "Testing event creation with no poster attached",
        category: "Technical",
        date: "2026-11-20",
        venue: "Auditorium Hall B",
        capacity: 100
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.posterKey).toBeNull();
    expect(res.body.data.posterUrl).toBeNull();
    createdEventIds.push(res.body.data.id);
  });

  // 2. Event with valid JPEG
  test("2. Create event with valid JPEG - Should upload to S3 and return presigned posterUrl", async () => {
    const jpegBuffer = Buffer.from("fake-jpeg-binary-image-data-for-testing");

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .field("name", "JPEG Poster Hackathon")
      .field("description", "Testing JPEG poster upload to S3")
      .field("category", "Technical")
      .field("date", "2026-11-25")
      .field("venue", "Tech Lab 3")
      .field("capacity", 50)
      .attach("poster", jpegBuffer, {
        filename: "hackathon-poster.jpeg",
        contentType: "image/jpeg"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.posterKey).toMatch(/^event-posters\/[a-f0-9-]+-hackathon-poster\.jpeg$/);
    expect(res.body.data.posterUrl).toBeDefined();
    expect(res.body.data.posterUrl).toContain("X-Amz-Signature=mock-presigned-sig");
    expect(s3Mock.commandCalls(PutObjectCommand).length).toBe(1);

    const putCall = s3Mock.commandCalls(PutObjectCommand)[0];
    expect(putCall.args[0].input.ContentType).toBe("image/jpeg");

    createdEventIds.push(res.body.data.id);
  });

  // 3. Event with valid PNG
  test("3. Create event with valid PNG - Should upload to S3 and return presigned posterUrl", async () => {
    const pngBuffer = Buffer.from("fake-png-binary-image-data-for-testing");

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .field("name", "PNG Poster Workshop")
      .field("description", "Testing PNG poster upload to S3")
      .field("category", "Workshop")
      .field("date", "2026-11-28")
      .field("venue", "Seminar Hall 1")
      .field("capacity", 60)
      .attach("poster", pngBuffer, {
        filename: "workshop-flyer.png",
        contentType: "image/png"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.posterKey).toMatch(/^event-posters\/[a-f0-9-]+-workshop-flyer\.png$/);
    expect(res.body.data.posterUrl).toBeDefined();
    expect(res.body.data.posterUrl).toContain("X-Amz-Signature=mock-presigned-sig");
    expect(s3Mock.commandCalls(PutObjectCommand).length).toBe(1);

    const putCall = s3Mock.commandCalls(PutObjectCommand)[0];
    expect(putCall.args[0].input.ContentType).toBe("image/png");

    createdEventIds.push(res.body.data.id);
  });

  // 4. Invalid file type
  test("4. Upload invalid file type - Should reject with 400 Bad Request", async () => {
    const textBuffer = Buffer.from("This is a plain text file, not an image");

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .field("name", "Invalid File Type Event")
      .field("category", "Technical")
      .field("date", "2026-12-01")
      .field("venue", "Main Hall")
      .field("capacity", 50)
      .attach("poster", textBuffer, {
        filename: "document.txt",
        contentType: "text/plain"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid file type/i);
    expect(s3Mock.commandCalls(PutObjectCommand).length).toBe(0);
  });

  // 5. File larger than 5 MB
  test("5. Upload file larger than 5 MB - Should reject with 400 Bad Request", async () => {
    // Create 5.2 MB buffer
    const largeBuffer = Buffer.alloc(5.2 * 1024 * 1024);

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .field("name", "Large File Event")
      .field("category", "Technical")
      .field("date", "2026-12-05")
      .field("venue", "Main Hall")
      .field("capacity", 50)
      .attach("poster", largeBuffer, {
        filename: "giant-poster.jpg",
        contentType: "image/jpeg"
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/5 MB/i);
    expect(s3Mock.commandCalls(PutObjectCommand).length).toBe(0);
  });

  // 6. Poster deletion
  test("6. Event deletion - Should delete poster object from S3", async () => {
    const posterBuffer = Buffer.from("poster-to-be-deleted");

    // Create event with poster
    const createRes = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .field("name", "Event To Delete")
      .field("category", "Technical")
      .field("date", "2026-12-10")
      .field("venue", "Lab 2")
      .field("capacity", 30)
      .attach("poster", posterBuffer, {
        filename: "delete-me.jpg",
        contentType: "image/jpeg"
      });

    expect(createRes.statusCode).toBe(201);
    const eventId = createRes.body.data.id;
    const posterKey = createRes.body.data.posterKey;
    expect(posterKey).toBeDefined();

    // Delete the event
    s3Mock.reset();
    s3Mock.on(DeleteObjectCommand).resolves({});

    const deleteRes = await request(app)
      .delete(`/api/events/${eventId}`)
      .set("Authorization", `Bearer ${organizerToken}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.success).toBe(true);
    expect(s3Mock.commandCalls(DeleteObjectCommand).length).toBe(1);

    const deleteCall = s3Mock.commandCalls(DeleteObjectCommand)[0];
    expect(deleteCall.args[0].input.Key).toBe(posterKey);
  });

  // 7. Presigned poster URL generation
  test("7. Presigned URL generation - getPresignedPosterUrl handles S3 keys, URLs, and null", async () => {
    // A. S3 Key
    const s3Url = await getPresignedPosterUrl("event-posters/12345-sample.png");
    expect(s3Url).toBeDefined();
    expect(typeof s3Url).toBe("string");
    expect(s3Url).toContain("X-Amz-Signature=mock-presigned-sig");
    expect(getSignedUrl).toHaveBeenCalled();

    // B. External URL (backward compatibility)
    const externalUrl = "https://images.unsplash.com/photo-1504384308090";
    const resultUrl = await getPresignedPosterUrl(externalUrl);
    expect(resultUrl).toBe(externalUrl);

    // C. Null Key
    const nullResult = await getPresignedPosterUrl(null);
    expect(nullResult).toBeNull();
  });
});
