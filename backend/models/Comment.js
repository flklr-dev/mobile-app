const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
  reply: { type: String, default: null },
  replyDate: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Add index for better query performance
commentSchema.index({ recipe: 1, createdAt: -1 });
commentSchema.index({ user: 1 });

module.exports = mongoose.model("Comment", commentSchema); 