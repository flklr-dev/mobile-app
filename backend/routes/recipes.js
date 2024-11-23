const express = require("express");
const multer = require("multer");
const Recipe = require("../models/Recipe");
const { verifyToken } = require("../middleware/auth"); // Middleware to verify JWT
const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    // Set the destination where files will be uploaded
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this folder exists on the server
    },
    // Define how the filename will be stored
    filename: (req, file, cb) => {
        // Store the file with a timestamp and original file name
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Add a recipe
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "No image file uploaded." });
        }

        const {
            title,
            description,
            category,
            servingSize,
            ingredients,
            cookingInstructions,
            authorNotes,
            isPublic,
        } = req.body;

        // Create the recipe and save it to the database
        const recipe = new Recipe({
            title,
            description,
            image: req.file ? req.file.path : null, // Save the file path in MongoDB
            category,
            servingSize,
            ingredients: JSON.parse(ingredients), // Parse ingredients as an array
            cookingInstructions: JSON.parse(cookingInstructions), // Parse instructions as an array
            authorNotes,
            isPublic: isPublic === "true", // Convert the public flag
            user: req.user.userId, // User ID from JWT token
        });

        await recipe.save();
        res.status(201).json({ message: "Recipe added successfully", recipe });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add recipe" });
    }
});

// Get recipes by category (with a limit of 10 per category)
router.get("/category/:category", async (req, res) => {
    const { category } = req.params;

    try {
        const recipes = await Recipe.find({ category, isPublic: true })
            .limit(10)
            .populate("user", "name email profilePicture"); 
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get all public recipes (for the search)
router.get("/", async (req, res) => {
    try {
        const recipes = await Recipe.find({ isPublic: true }).populate("user", "name email");
        res.status(200).json(recipes);  // Send recipes to frontend
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Export the router
module.exports = router;
