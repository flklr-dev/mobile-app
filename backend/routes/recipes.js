const express = require("express");
const multer = require("multer");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();
const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// Configure multer for file upload
const storage = multer.diskStorage({
    // Set the destination where files will be uploaded
    destination: (req, file, cb) => {
        const uploadPath = process.env.NODE_ENV === 'production' 
            ? '/opt/render/project/src/uploads/'
            : 'uploads/';
        cb(null, uploadPath);
    },
    // Define how the filename will be stored
    filename: (req, file, cb) => {
        // Store the file with a timestamp and original file name
        cb(null, `${Date.now()}-${file.originalname}`);
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
router.get("/", authenticateToken, async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate('user', 'name email profilePicture')
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});

// Like/Unlike route
router.post("/like/:id", authenticateToken, async (req, res) => {
  try {
    // Get recipe with populated user field
    const recipe = await Recipe.findById(req.params.id)
      .populate('user', 'name');
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Get current user with required fields
    const currentUser = await User.findById(req.user.userId)
      .select('name');
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isLiked = recipe.likes.includes(req.user.userId);
    
    if (isLiked) {
      // Unlike
      recipe.likes = recipe.likes.filter(id => id.toString() !== req.user.userId);
    } else {
      // Like
      recipe.likes.push(req.user.userId);
      
      // Only create notification if it's not the user's own recipe
      if (recipe.user._id.toString() !== req.user.userId) {
        try {
          const newNotification = new Notification({
            recipient: recipe.user._id,
            sender: currentUser._id,
            recipe: recipe._id,
            type: 'like',
            message: `${currentUser.name} liked your recipe "${recipe.title}"`,
            createdAt: new Date()
          });
          
          console.log('Creating notification:', {
            recipient: recipe.user._id,
            sender: currentUser._id,
            recipeName: recipe.title,
            senderName: currentUser.name
          });

          await newNotification.save();
          console.log('Notification created successfully');
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
          // Continue with the like operation even if notification fails
        }
      }
    }

    await recipe.save();
    res.json({ 
      recipeLikes: recipe.likes.length,
      message: isLiked ? 'Recipe unliked' : 'Recipe liked'
    });

  } catch (error) {
    console.error("Error in like operation:", error);
    res.status(500).json({ message: error.message });
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

// Update this route to get user's recipes
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name profilePicture');

    res.json(recipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ message: 'Error fetching user recipes' });
  }
});

// Add a comment to a recipe
router.post("/:recipeId/comments", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = new Comment({
      text,
      user: req.user.userId,
      recipe: req.params.recipeId
    });
    await comment.save();
    
    // Create notification if the recipe owner is not the same as the commenter
    if (recipe.user.toString() !== req.user.userId) {
      const notification = new Notification({
        recipient: recipe.user,
        sender: user._id,
        recipe: recipe._id,
        type: 'comment',
        message: `${user.name || 'Someone'} commented on your recipe "${recipe.title}"`
      });
      await notification.save();
    }

    // Populate user details before sending response
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name profilePicture');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get comments for a recipe (including replies)
router.get("/:recipeId/comments", authenticateToken, async (req, res) => {
  try {
    const comments = await Comment.find({ 
      recipe: req.params.recipeId,
      isDeleted: false 
    })
    .populate('user', 'name profilePicture')
    .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add reply to a comment
router.post("/:recipeId/comments/:commentId/reply", authenticateToken, async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const userId = req.user.userId;
    const { reply } = req.body;

    console.log('Reply Request:', {
      recipeId,
      commentId,
      userId,
      reply
    });

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(recipeId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid recipe or comment ID" });
    }

    // Find recipe with user populated
    const recipe = await Recipe.findById(recipeId).populate('user');
    if (!recipe) {
      console.log('Recipe not found:', recipeId);
      return res.status(404).json({ message: "Recipe not found" });
    }

    console.log('Recipe owner:', recipe.user._id.toString());
    console.log('Current user:', userId);

    // Check ownership
    if (recipe.user._id.toString() !== userId) {
      return res.status(403).json({ 
        message: "Only recipe owner can reply to comments",
        recipeOwner: recipe.user._id.toString(),
        currentUser: userId
      });
    }

    // Find and update comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      console.log('Comment not found:', commentId);
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update comment
    comment.reply = reply;
    comment.replyDate = new Date();
    await comment.save();

    // Get fully populated comment
    const updatedComment = await Comment.findById(commentId)
      .populate('user', 'name profilePicture')
      .populate('recipe', 'title');

    console.log('Updated comment:', updatedComment);

    // Send success response
    res.status(200).json({
      message: "Reply added successfully",
      comment: updatedComment
    });

  } catch (error) {
    console.error('Reply Error:', error);
    res.status(500).json({ 
      message: "Failed to add reply",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a comment (only recipe owner)
router.delete("/:recipeId/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (recipe.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only recipe owner can delete comments" });
    }

    await Comment.findByIdAndUpdate(req.params.commentId, { isDeleted: true });
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add or update this PUT route for updating recipes
router.put("/:id", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;

    // First check if recipe exists and belongs to user
    const existingRecipe = await Recipe.findOne({ _id: recipeId, user: userId });
    if (!existingRecipe) {
      return res.status(404).json({ message: "Recipe not found or unauthorized" });
    }

    // Prepare update object
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      servingSize: req.body.servingSize,
      ingredients: JSON.parse(req.body.ingredients),
      cookingInstructions: JSON.parse(req.body.cookingInstructions),
      authorNotes: req.body.authorNotes,
      isPublic: req.body.isPublic === 'true',
      time: req.body.time
    };

    // Only update image if new one is uploaded
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, '/');
    }

    // Update the recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      updateData,
      { new: true }
    );

    res.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add this DELETE route to your existing routes
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.userId;

    // Find the recipe and verify ownership
    const recipe = await Recipe.findOne({ _id: recipeId, user: userId });
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found or unauthorized" });
    }

    // Delete the recipe
    await Recipe.findByIdAndDelete(recipeId);
    
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: error.message });
  }
});

// Export the router
module.exports = router;