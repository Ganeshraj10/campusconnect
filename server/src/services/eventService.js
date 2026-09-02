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

const createEvent = async (eventData, organizerId, file = null) => {
  let {
    name,
    description,
    category,
    posterKey,
    poster,
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

  // Handle uploaded image file via S3
  if (file) {
    posterKey = await uploadEventPoster(file);
  } else {
    posterKey = posterKey || poster || null;
  }

  const parsedRules = parseRules(rules);

  const event = await prisma.event.create({
    data: {
      name,
      description: description || "",
      category,
      posterKey: posterKey || null,
      date,
      startTime: startTime || "09:00 AM",
      endTime: endTime || "05:00 PM",
      venue,
      teamSize: teamSize || "Individual",
      capacity: Number(capacity),
      registeredCount: 0,
      registrationDeadline: registrationDeadline || date,
      status: status ? status.toUpperCase() : "UPCOMING",
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

  // Handle new poster file upload to S3
  if (file) {
    // Delete old poster from S3 if it exists
    if (event.posterKey) {
      await deleteEventPoster(event.posterKey);
    }
    data.posterKey = await uploadEventPoster(file);
  } else if (
    data.posterKey === null ||
    data.removePoster === true ||
    data.removePoster === "true"
  ) {
    if (event.posterKey) {
      await deleteEventPoster(event.posterKey);
    }
    data.posterKey = null;
  } else if (data.poster && !data.posterKey) {
    data.posterKey = data.poster;
  }

  delete data.removePoster;
  delete data.poster;

  if (data.capacity !== undefined) {
    data.capacity = Number(data.capacity);
  }
  if (data.status) {
    data.status = data.status.toUpperCase();
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
  formatEventsWithPosters
};
