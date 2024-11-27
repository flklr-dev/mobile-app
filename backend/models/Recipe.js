const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    servingSize: { type: String, required: true },
    ingredients: [{ type: String, required: true }],
    cookingInstructions: [{ type: String, required: true }],
    authorNotes: { type: String },
    isPublic: { type: Boolean, default: true },
    likes: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    time: { type: String, required: true },
    calories: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);
