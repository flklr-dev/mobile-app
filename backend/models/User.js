const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "uploads/default-profile.png" }, // Path to the default profile picture
    likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }], // Array of liked recipe IDs
    aboutMe: { type: String, default: "" }, // Add the aboutMe field with an empty string as default
    mealPlans: [{
        recipeId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Recipe' 
        },
        date: Date,
        category: String,
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    resetCode: String,
    resetCodeExpiry: Date
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
