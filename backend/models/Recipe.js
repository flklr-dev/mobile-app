const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String }, // URL or file path to the recipe's image
    category: { type: String, required: true },
    servingSize: { type: String, required: true },
    ingredients: [{ type: String, required: true }], // Array of ingredients
    cookingInstructions: [{ type: String, required: true }], // Array of instructions
    authorNotes: { type: String }, // Optional field
    isPublic: { type: Boolean, default: true }, // Sharing options
    likes: { type: Number, default: 0 }, // Default likes set to 0
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);
