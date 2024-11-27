const express = require("express");
const multer = require("multer");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth"); // Updated import
const router = express.Router();
const mongoose = require("mongoose");

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
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
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
            time,
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
            time,
        });

        await recipe.save();
        res.status(201).json({ message: "Recipe added successfully", recipe });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add recipe" });
    }
});

router.get("/category/:category", authenticateToken, async (req, res) => {
  const { category } = req.params;
  const userId = req.user.userId;

  try {
      // Get the user's liked recipes
      const user = await User.findById(userId);
      const likedRecipes = user ? user.likedRecipes.map((id) => id.toString()) : [];

      // Fetch all public recipes for the category
      const recipes = await Recipe.find({ category, isPublic: true })
          .populate("user", "name email profilePicture");

      // Separate liked and non-liked recipes
      const nonLikedRecipes = recipes.filter(recipe => !likedRecipes.includes(recipe._id.toString()));
      const likedCategoryRecipes = recipes.filter(recipe => likedRecipes.includes(recipe._id.toString()));

      // Combine non-liked recipes first, then liked recipes
      const prioritizedRecipes = [...nonLikedRecipes, ...likedCategoryRecipes];

      // Add `isLiked` flag to each recipe
      const updatedRecipes = prioritizedRecipes.map(recipe => ({
          ...recipe.toObject(),
          isLiked: likedRecipes.includes(recipe._id.toString()),
      }));

      res.status(200).json(updatedRecipes);
  } catch (error) {
      console.error(error);
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

router.post("/like/:recipeId", authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.recipeId;
    const userId = req.user.userId;

    // Find the user and the recipe
    const user = await User.findById(userId);
    const recipe = await Recipe.findById(recipeId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Ensure likedRecipes is initialized
    if (!user.likedRecipes) {
      user.likedRecipes = [];
    }

    // Initialize likes if not already set
    if (!recipe.likes) {
      recipe.likes = 0;
    }

    // Toggle the like: if the recipe is already liked, remove it, else add it
    const index = user.likedRecipes.indexOf(recipeId);
    if (index === -1) {
      // Add to likedRecipes if not present
      user.likedRecipes.push(recipeId);
      recipe.likes += 1; // Increment the recipe's like count
    } else {
      // Remove from likedRecipes if already liked
      user.likedRecipes.splice(index, 1);
      recipe.likes -= 1; // Decrement the recipe's like count
    }

    // Save both the user and the recipe
    await user.save();
    await recipe.save();

    res.status(200).json({ message: "Like status updated", recipeLikes: recipe.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Failed to update like status" });
  }
});

// Get top 6 most liked recipes
router.get("/trending", async (req, res) => {
  try {
      const recipes = await Recipe.find({ isPublic: true })
          .sort({ likes: -1 }) // Sort by likes
          .limit(6) // Limit to top 6 recipes
          .populate("user", "name email profilePicture");

      res.status(200).json(recipes);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
  }
});

router.get("/:recipeId", async (req, res) => {
  try {
    // Validate the recipe ID
    if (!req.params.recipeId || !mongoose.Types.ObjectId.isValid(req.params.recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const recipe = await Recipe.findById(req.params.recipeId)
      .populate("user", "name profilePicture aboutMe");
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ 
      message: "Failed to fetch recipe",
      error: error.message 
    });
  }
});

// Add this route to get user's recipes
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const recipes = await Recipe.find({ 
      userId: req.params.userId,
      isPublic: true  // Only get public recipes
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name profilePicture'); // Populate user details

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ message: 'Error fetching user recipes' });
  }
});

// Export the router
module.exports = router;
