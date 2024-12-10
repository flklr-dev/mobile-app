const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticateToken } = require("../middleware/auth");

// Get user notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    console.log(`Fetching notifications for user: ${req.user.userId}`);

    // Find notifications for the current user, sorted by most recent first
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate('sender', 'name profilePicture')
      .populate('recipe', 'title image')
      .sort({ createdAt: -1 })
      .limit(50);  // Limit to last 50 notifications

    console.log(`Found ${notifications.length} notifications`);
    console.log('Sample notification:', notifications[0]);

    // Mark notifications as read (optional, can be done separately)
    const updateResult = await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { $set: { read: true } }
    );

    console.log('Notifications marked as read:', updateResult);

    res.json(notifications);
  } catch (error) {
    console.error('Detailed error fetching notifications:', error);
    res.status(500).json({ 
      message: "Failed to fetch notifications", 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Mark all notifications as read
router.post("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ 
      message: "Failed to mark notifications as read", 
      error: error.message 
    });
  }
});

module.exports = router;