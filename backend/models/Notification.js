const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Expire after 30 days
  }
}, {
  timestamps: true  // Add createdAt and updatedAt fields
});

// Add indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });

// Validation to ensure recipient and sender are different
notificationSchema.pre('validate', function(next) {
  if (this.recipient.equals(this.sender)) {
    return next(new Error('Recipient and sender cannot be the same'));
  }
  next();
});

module.exports = mongoose.model("Notification", notificationSchema);