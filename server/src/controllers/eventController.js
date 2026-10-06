const eventService = require("../services/eventService");

const getEvents = async (req, res, next) => {
  try {
    const { category, search, status } = req.query;
    const events = await eventService.getAllEvents({ category, search, status });
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventService.getEventById(id);
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    console.log("DEBUG req.file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    } : null);

    const event = await eventService.createEvent(req.body, req.user.id, req.file);
    res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event
    });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await eventService.updateEvent(id, req.body, req.user, req.file);
    res.status(200).json({
      success: true,
      message: "Event updated successfully.",
      data: updated
    });
  } catch (error) {
    next(error);
  }
};


const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await eventService.deleteEvent(id, req.user);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
