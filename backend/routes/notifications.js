const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticateToken } = require("../middleware/auth");

// Get user's notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate({
        path: 'sender',
        select: 'name profilePicture'
      })
      .populate({
        path: 'recipe',
        select: 'title'
      })
      .sort({ createdAt: -1 });
    
    // Transform the data to ensure proper structure
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      type: notification.type,
      sender: {
        _id: notification.sender._id,
        name: notification.sender.name || 'Unknown User',
        profilePicture: notification.sender.profilePicture
      },
      recipe: {
        _id: notification.recipe._id,
        title: notification.recipe.title
      }
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.patch("/:notificationId/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient: req.user.userId },
      { read: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add this route to your notifications.js
router.delete("/:notificationId", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.user.userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 