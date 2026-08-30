const eventService = require("../services/eventService");

const getOrganizerEvents = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const events = await eventService.getOrganizerEvents(organizerId);
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

const getEventParticipants = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const participants = await eventService.getEventParticipants(eventId, req.user);
    res.status(200).json({
      success: true,
      count: participants.length,
      data: participants
    });
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { registrationId, attended } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required to mark attendance."
      });
    }

    const attendance = await eventService.markAttendance(
      eventId,
      registrationId,
      attended,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully.",
      data: attendance
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizerEvents,
  getEventParticipants,
  markAttendance
};
