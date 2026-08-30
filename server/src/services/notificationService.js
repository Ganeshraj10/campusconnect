const prisma = require("../utils/prisma");

const createNotification = async ({ userId, eventId = null, title, message }) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        eventId,
        title,
        message
      }
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
    return null;
  }
};

const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
};

const markAsRead = async (notificationId, userId) => {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true }
  });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead
};
