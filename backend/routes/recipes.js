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

router.post('/like/:recipeId', authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isLiked = user.likedRecipes.includes(recipe._id);

    if (isLiked) {
      // Unlike the recipe
      await User.findByIdAndUpdate(user._id, {
        $pull: { likedRecipes: recipe._id }
      });
      recipe.likes = Math.max(0, recipe.likes - 1);
    } else {
      // Like the recipe
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { likedRecipes: recipe._id }
      });
      recipe.likes = (recipe.likes || 0) + 1;
    }

    await recipe.save();

    res.json({
      recipeLikes: recipe.likes,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Error in like route:', error);
    res.status(500).json({ 
      message: 'Error processing like/unlike',
      error: error.message 
    });
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
      $or: [
        { user: req.params.userId },
        { userId: req.params.userId }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'name profilePicture');

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ message: 'Error fetching user recipes' });
  }
});

// Export the router
module.exports = router;
