const prisma = require("../utils/prisma");
const { createNotification } = require("./notificationService");
const { getPresignedPosterUrl } = require("./s3Service");
const logger = require("../utils/logger");

const registerForEvent = async (eventId, userId, regData = {}) => {
  const { teamName, teamMembers } = regData;

  return prisma.$transaction(async (tx) => {
    // 1. Fetch Event
    const event = await tx.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      logger.warn(`Event registration failed: Event ID ${eventId} not found.`);
      const error = new Error("Event not found.");
      error.statusCode = 404;
      throw error;
    }

    // Business Rule 4: Check if event is active
    if (["CANCELLED", "REJECTED", "PENDING"].includes(event.status)) {
      logger.warn(`Event registration rejected: Event "${event.name}" (${eventId}) is currently ${event.status.toLowerCase()}.`);
      const error = new Error(`Cannot register for this event. Event is currently ${event.status.toLowerCase()}.`);
      error.statusCode = 400;
      throw error;
    }

    // Business Rule 3: Check capacity
    if (event.registeredCount >= event.capacity || event.status === "FULL") {
      logger.warn(`Event registration rejected: Event "${event.name}" (${eventId}) is at maximum capacity.`);
      const error = new Error("Registration is closed: This event has reached maximum capacity.");
      error.statusCode = 400;
      throw error;
    }

    // Business Rule 2: Check registration deadline
    if (event.registrationDeadline) {
      const deadline = new Date(event.registrationDeadline);
      const now = new Date();
      // Set deadline end of day
      deadline.setHours(23, 59, 59, 999);
      if (now > deadline) {
        logger.warn(`Event registration rejected: Deadline has passed for event "${event.name}" (${eventId}).`);
        const error = new Error("Registration is closed: The registration deadline has passed.");
        error.statusCode = 400;
        throw error;
      }
    }

    // Business Rule 1: Check duplicate registration
    const existingRegistration = await tx.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (existingRegistration) {
      if (existingRegistration.status === "CONFIRMED") {
        logger.warn(`Event registration rejected: User ID ${userId} is already registered for Event "${event.name}" (${eventId}).`);
        const error = new Error("You are already registered for this event.");
        error.statusCode = 400;
        throw error;
      }

      // If previously cancelled, re-activate it
      const updatedReg = await tx.registration.update({
        where: { id: existingRegistration.id },
        data: {
          status: "CONFIRMED",
          teamName: teamName || existingRegistration.teamName,
          teamMembers: teamMembers || existingRegistration.teamMembers,
          registeredAt: new Date()
        }
      });

      // Update event registered count
      const newCount = event.registeredCount + 1;
      await tx.event.update({
        where: { id: eventId },
        data: {
          registeredCount: newCount,
          status: newCount >= event.capacity ? "FULL" : event.status
        }
      });

      logger.info(`Event registration re-activated: User ID ${userId} for Event "${event.name}" (ID: ${eventId}, Reg ID: ${updatedReg.id})`);
      return updatedReg;
    }

    // Create new registration record
    const registration = await tx.registration.create({
      data: {
        userId,
        eventId,
        teamName: teamName || null,
        teamMembers: teamMembers || null,
        status: "CONFIRMED"
      }
    });

    // Create attendance placeholder
    await tx.attendance.create({
      data: {
        registrationId: registration.id,
        attended: false
      }
    });

    // Increment event registered count & update status if full
    const newCount = event.registeredCount + 1;
    await tx.event.update({
      where: { id: eventId },
      data: {
        registeredCount: newCount,
        status: newCount >= event.capacity ? "FULL" : event.status
      }
    });

    // Send confirmation notification
    await tx.notification.create({
      data: {
        userId,
        eventId,
        title: "Registration Confirmed",
        message: `Your registration for "${event.name}" is confirmed. Pass ID: ${registration.id}`
      }
    });

    logger.info(`Event registration confirmed: User ID ${userId} registered for Event "${event.name}" (ID: ${eventId}, Reg ID: ${registration.id})`);
    return registration;
  });
};

const cancelRegistration = async (eventId, userId) => {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (!registration || registration.status !== "CONFIRMED") {
      logger.warn(`Event cancellation failed: No active registration for User ID ${userId} on Event ID ${eventId}.`);
      const error = new Error("Active registration record not found for this event.");
      error.statusCode = 404;
      throw error;
    }

    // Update registration status to CANCELLED
    const cancelled = await tx.registration.update({
      where: { id: registration.id },
      data: { status: "CANCELLED" }
    });

    // Decrement event registered count & restore status if it was FULL
    const event = await tx.event.findUnique({ where: { id: eventId } });
    if (event) {
      const newCount = Math.max(0, event.registeredCount - 1);
      await tx.event.update({
        where: { id: eventId },
        data: {
          registeredCount: newCount,
          status: event.status === "FULL" ? "UPCOMING" : event.status
        }
      });
    }

    logger.info(`Event registration cancelled: User ID ${userId} cancelled registration for Event ID ${eventId} (Reg ID: ${registration.id})`);
    return {
      success: true,
      message: "Registration cancelled successfully. Your seat has been released."
    };
  });
};


const getMyEvents = async (userId) => {
  const registrations = await prisma.registration.findMany({
    where: { userId, status: "CONFIRMED" },
    include: {
      event: {
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
      },
      attendance: true
    },
    orderBy: { registeredAt: "desc" }
  });

  return Promise.all(
    registrations.map(async (reg) => {
      const posterUrl = await getPresignedPosterUrl(reg.event.posterKey);
      return {
        registrationId: reg.id,
        registeredAt: reg.registeredAt,
        status: reg.status,
        teamName: reg.teamName,
        teamMembers: reg.teamMembers,
        attended: reg.attendance?.attended || false,
        event: {
          ...reg.event,
          posterKey: reg.event.posterKey || null,
          posterUrl: posterUrl || null,
          poster: posterUrl || reg.event.posterKey || null,
          availableSeats: Math.max(0, reg.event.capacity - reg.event.registeredCount)
        }
      };
    })
  );
};


module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyEvents
};
