const registrationService = require("../services/registrationService");

const registerForEvent = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;
    const registration = await registrationService.registerForEvent(
      eventId,
      userId,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Event registration confirmed successfully.",
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;
    const result = await registrationService.cancelRegistration(eventId, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const events = await registrationService.getMyEvents(userId);
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyEvents
};
