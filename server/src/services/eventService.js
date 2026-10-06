const prisma = require("../utils/prisma");
const { createNotification } = require("./notificationService");
const {
  uploadEventPoster,
  deleteEventPoster,
  getPresignedPosterUrl
} = require("./s3Service");
const logger = require("../utils/logger");

/**
 * Enriches a single event object with presigned poster URL and standardized fields
 */
const formatEventWithPoster = async (event) => {
  if (!event) return null;
  const posterUrl = await getPresignedPosterUrl(event.posterKey);
  return {
    ...event,
    posterKey: event.posterKey || null,
    posterUrl: posterUrl || null,
    poster: posterUrl || event.posterKey || null
  };
};

/**
 * Enriches an array of event objects with presigned poster URLs concurrently
 */
const formatEventsWithPosters = async (events) => {
  if (!Array.isArray(events)) return [];
  return Promise.all(events.map((e) => formatEventWithPoster(e)));
};

/**
 * Helper to normalize rules field from multipart form-data or JSON payload
 */
const parseRules = (rules) => {
  if (!rules) return [];
  if (Array.isArray(rules)) return rules;
  if (typeof rules === "string") {
    try {
      const parsed = JSON.parse(rules);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // If comma or newline separated string
      return rules
        .split(/\r?\n|,/)
        .map((r) => r.trim())
        .filter((r) => r.length > 0);
    }
  }
  return [];
};

const getAllEvents = async ({ category, search, status }) => {
  const where = {};

  // Filter by status (default to non-rejected and non-pending for public feed unless specified)
  if (status) {
    where.status = status.toUpperCase();
  } else {
    where.status = {
      in: ["UPCOMING", "FULL", "CLOSED", "COMPLETED"]
    };
  }

  // Filter by category
  if (category && category !== "All") {
    where.category = {
      equals: category,
      mode: "insensitive"
    };
  }

  // Search by name, description, venue, or category
  if (search && search.trim() !== "") {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { venue: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } }
    ];
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true
        }
      },
      _count: {
        select: {
          registrations: {
            where: { status: "CONFIRMED" }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return formatEventsWithPosters(events);
};

const getEventById = async (id) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true
        }
      },
      _count: {
        select: {
          registrations: {
            where: { status: "CONFIRMED" }
          }
        }
      }
    }
  });

  if (!event) {
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  return formatEventWithPoster(event);
};

/**
 * Normalizes and validates posterKey to guarantee it is only:
 * - A valid S3 object-key string returned by uploadEventPoster()
 * - An external URL string (http:// or https://)
 * - null
 * NEVER an Object, FormData, or invalid value.
 */
const sanitizePosterKey = (key) => {
  if (typeof key !== "string") return null;
  const trimmed = key.trim();
  if (
    !trimmed ||
    trimmed === "[object Object]" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return null;
  }
  return trimmed;
};

/**
 * Checks if a given value is a valid Multer file object
 */
const isMulterFile = (file) => {
  return (
    file &&
    typeof file === "object" &&
    (Buffer.isBuffer(file.buffer) || typeof file.originalname === "string" || file.size > 0)
  );
};

const createEvent = async (eventData, organizerId, file = null) => {
  const {
    name,
    description,
    category,
    date,
    startTime,
    endTime,
    venue,
    teamSize,
    capacity,
    registrationDeadline,
    rules,
    status
  } = eventData;

  // 1. If req.file exists, call uploadEventPoster(file) and save ONLY the returned string into posterKey
  let finalPosterKey = null;
  const targetFile = isMulterFile(file)
    ? file
    : isMulterFile(eventData.file)
    ? eventData.file
    : isMulterFile(eventData.poster)
    ? eventData.poster
    : null;

  if (targetFile) {
    const uploadedKey = await uploadEventPoster(targetFile);
    finalPosterKey = sanitizePosterKey(uploadedKey);
  } else {
    // 2. If no file exists, use existing poster URL string if supplied, otherwise null
    const candidate =
      typeof eventData.posterKey === "string"
        ? eventData.posterKey
        : typeof eventData.poster === "string"
        ? eventData.poster
        : null;
    finalPosterKey = sanitizePosterKey(candidate);
  }

  const parsedRules = parseRules(rules);
  const posterKey = finalPosterKey;

  console.log("DEBUG posterKey:", posterKey);
  console.log("DEBUG posterKey type:", typeof posterKey);
  console.log("DEBUG file:", file ? {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    hasBuffer: !!file.buffer
  } : null);

  const event = await prisma.event.create({
    data: {
      name: String(name || "").trim(),
      description: description ? String(description) : "",
      category: String(category || "").trim(),
      posterKey: posterKey,
      date: String(date || "").trim(),
      startTime: startTime ? String(startTime).trim() : "09:00 AM",
      endTime: endTime ? String(endTime).trim() : "05:00 PM",
      venue: String(venue || "").trim(),
      teamSize: teamSize ? String(teamSize).trim() : "Individual",
      capacity: Number(capacity),
      registeredCount: 0,
      registrationDeadline: registrationDeadline
        ? String(registrationDeadline).trim()
        : String(date || "").trim(),
      status: status ? String(status).toUpperCase() : "UPCOMING",
      rules: parsedRules,
      organizerId
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true
        }
      }
    }
  });

  logger.info(`Event created: "${event.name}" (ID: ${event.id}) by Organizer ID: ${organizerId}`);
  return formatEventWithPoster(event);
};

const updateEvent = async (id, updateData, user, file = null) => {
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    logger.warn(`Event update failed: Event ID ${id} not found.`);
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  // Only the organizer who created the event or an Admin can edit it
  if (user.role !== "ADMIN" && event.organizerId !== user.id) {
    logger.warn(`Event update forbidden: User ${user.id} (${user.role}) is not authorized to edit event ${id}.`);
    const error = new Error("Forbidden: You can only edit events you organized.");
    error.statusCode = 403;
    throw error;
  }

  const data = { ...updateData };
  const targetFile = isMulterFile(file)
    ? file
    : isMulterFile(data.file)
    ? data.file
    : isMulterFile(data.poster)
    ? data.poster
    : null;

  // Handle new poster file upload to S3
  if (targetFile) {
    // Delete old poster from S3 if it exists
    if (event.posterKey) {
      await deleteEventPoster(event.posterKey);
    }
    const uploadedKey = await uploadEventPoster(targetFile);
    data.posterKey = sanitizePosterKey(uploadedKey);
  } else if (
    data.posterKey === null ||
    data.removePoster === true ||
    data.removePoster === "true"
  ) {
    if (event.posterKey) {
      await deleteEventPoster(event.posterKey);
    }
    data.posterKey = null;
  } else if (typeof data.poster === "string" && data.poster.trim() !== "" && !data.posterKey) {
    data.posterKey = sanitizePosterKey(data.poster);
  } else if (typeof data.posterKey === "string") {
    data.posterKey = sanitizePosterKey(data.posterKey);
  } else {
    // Never allow an object or invalid type to be assigned to posterKey
    if (data.posterKey !== undefined && typeof data.posterKey !== "string") {
      delete data.posterKey;
    }
  }

  delete data.removePoster;
  delete data.poster;
  delete data.file;

  if (data.name !== undefined) data.name = String(data.name).trim();
  if (data.description !== undefined) data.description = String(data.description);
  if (data.category !== undefined) data.category = String(data.category).trim();
  if (data.date !== undefined) data.date = String(data.date).trim();
  if (data.startTime !== undefined) data.startTime = String(data.startTime).trim();
  if (data.endTime !== undefined) data.endTime = String(data.endTime).trim();
  if (data.venue !== undefined) data.venue = String(data.venue).trim();
  if (data.teamSize !== undefined) data.teamSize = String(data.teamSize).trim();
  if (data.registrationDeadline !== undefined) data.registrationDeadline = String(data.registrationDeadline).trim();

  if (data.capacity !== undefined) {
    data.capacity = Number(data.capacity);
  }
  if (data.status) {
    data.status = String(data.status).toUpperCase();
  }
  if (data.rules !== undefined) {
    data.rules = parseRules(data.rules);
  }

  const updated = await prisma.event.update({
    where: { id },
    data,
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true
        }
      }
    }
  });

  logger.info(`Event updated: "${updated.name}" (ID: ${id}) by User ID: ${user.id} (Role: ${user.role})`);
  return formatEventWithPoster(updated);
};

const deleteEvent = async (id, user) => {
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    logger.warn(`Event deletion failed: Event ID ${id} not found.`);
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  // Only the creator or Admin can delete
  if (user.role !== "ADMIN" && event.organizerId !== user.id) {
    logger.warn(`Event deletion forbidden: User ${user.id} (${user.role}) is not authorized to delete event ${id}.`);
    const error = new Error("Forbidden: You can only delete events you organized.");
    error.statusCode = 403;
    throw error;
  }

  // Delete event poster from S3 if present
  if (event.posterKey) {
    await deleteEventPoster(event.posterKey);
  }

  await prisma.event.delete({ where: { id } });
  logger.info(`Event deleted: "${event.name}" (ID: ${id}) by User ID: ${user.id} (Role: ${user.role})`);
  return { success: true, message: "Event deleted successfully." };
};

const getOrganizerEvents = async (organizerId) => {
  const events = await prisma.event.findMany({
    where: { organizerId },
    include: {
      _count: {
        select: {
          registrations: {
            where: { status: "CONFIRMED" }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return formatEventsWithPosters(events);
};

const getPendingEvents = async () => {
  const events = await prisma.event.findMany({
    where: { status: "PENDING" },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return formatEventsWithPosters(events);
};

const approveEvent = async (id) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    logger.warn(`Event approval failed: Event ID ${id} not found.`);
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { status: "UPCOMING" }
  });

  await createNotification({
    userId: event.organizerId,
    eventId: event.id,
    title: "Event Approved",
    message: `Your event "${event.name}" has been approved by the Administration.`
  });

  logger.info(`Event approved: "${event.name}" (ID: ${id}) by Admin`);
  return formatEventWithPoster(updated);
};

const rejectEvent = async (id) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    logger.warn(`Event rejection failed: Event ID ${id} not found.`);
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { status: "REJECTED" }
  });

  await createNotification({
    userId: event.organizerId,
    eventId: event.id,
    title: "Event Rejected",
    message: `Your event "${event.name}" was not approved by the Administration.`
  });

  logger.info(`Event rejected: "${event.name}" (ID: ${id}) by Admin`);
  return formatEventWithPoster(updated);
};


const getEventParticipants = async (eventId, user) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "ADMIN" && event.organizerId !== user.id) {
    const error = new Error("Forbidden: You can only view participants for your own events.");
    error.statusCode = 403;
    throw error;
  }

  return prisma.registration.findMany({
    where: { eventId, status: "CONFIRMED" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          registerNumber: true,
          department: true,
          year: true,
          phone: true
        }
      },
      attendance: true
    },
    orderBy: { registeredAt: "asc" }
  });
};

const markAttendance = async (eventId, registrationId, attended, user) => {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) {
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "ADMIN" && event.organizerId !== user.id) {
    const error = new Error("Forbidden: You can only mark attendance for your own events.");
    error.statusCode = 403;
    throw error;
  }

  const attendance = await prisma.attendance.upsert({
    where: { registrationId },
    update: {
      attended: Boolean(attended),
      markedAt: new Date()
    },
    create: {
      registrationId,
      attended: Boolean(attended),
      markedAt: new Date()
    }
  });

  return attendance;
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getEventParticipants,
  markAttendance,
  formatEventWithPoster,
  formatEventsWithPosters,
  sanitizePosterKey,
  isMulterFile
};
