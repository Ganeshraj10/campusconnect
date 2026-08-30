const prisma = require("../utils/prisma");
const { createNotification } = require("./notificationService");

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

  return prisma.event.findMany({
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

  return event;
};

const createEvent = async (eventData, organizerId) => {
  const {
    name,
    description,
    category,
    posterKey,
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
      rules: Array.isArray(rules) ? rules : [],
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

  return event;
};

const updateEvent = async (id, updateData, user) => {
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  // Only the organizer who created the event or an Admin can edit it
  if (user.role !== "ADMIN" && event.organizerId !== user.id) {
    const error = new Error("Forbidden: You can only edit events you organized.");
    error.statusCode = 403;
    throw error;
  }

  const data = { ...updateData };
  if (data.capacity !== undefined) {
    data.capacity = Number(data.capacity);
  }
  if (data.status) {
    data.status = data.status.toUpperCase();
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

  return updated;
};

const deleteEvent = async (id, user) => {
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    const error = new Error("Event not found.");
    error.statusCode = 404;
    throw error;
  }

  // Only the creator or Admin can delete
  if (user.role !== "ADMIN" && event.organizerId !== user.id) {
    const error = new Error("Forbidden: You can only delete events you organized.");
    error.statusCode = 403;
    throw error;
  }

  await prisma.event.delete({ where: { id } });
  return { success: true, message: "Event deleted successfully." };
};

const getOrganizerEvents = async (organizerId) => {
  return prisma.event.findMany({
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
};

const getPendingEvents = async () => {
  return prisma.event.findMany({
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
};

const approveEvent = async (id) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
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

  return updated;
};

const rejectEvent = async (id) => {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
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

  return updated;
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
  markAttendance
};
