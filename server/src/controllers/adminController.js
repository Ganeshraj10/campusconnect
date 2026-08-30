const eventService = require("../services/eventService");
const prisma = require("../utils/prisma");

const getPendingEvents = async (req, res, next) => {
  try {
    const events = await eventService.getPendingEvents();
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

const approveEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.approveEvent(id);
    res.status(200).json({
      success: true,
      message: "Event approved successfully.",
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const rejectEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.rejectEvent(id);
    res.status(200).json({
      success: true,
      message: "Event rejected.",
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        registerNumber: true,
        department: true,
        year: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            events: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingEvents,
  approveEvent,
  rejectEvent,
  getAllUsers
};
