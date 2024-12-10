const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const mongoose = require("mongoose");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Create uploads directory if it doesn't exist
const createUploadsDirectory = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Configure multer for file upload
const storage = multer.diskStorage({
    // Set the destination where files will be uploaded
    destination: (req, file, cb) => {
        const uploadPath = createUploadsDirectory();
        cb(null, uploadPath);
    },
    // Define how the filename will be stored
    filename: (req, file, cb) => {
        // Get the original filename without extension
        const originalNameWithoutExt = path.parse(file.originalname).name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric chars with dash
            .replace(/-+/g, '-')         // Replace multiple dashes with single dash
            .substring(0, 20);           // Limit to 20 characters

        // Create unique filename with timestamp and original name
        const uniqueFilename = `${Date.now()}-${originalNameWithoutExt}${path.extname(file.originalname)}`;
        cb(null, uniqueFilename);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
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

// Like/Unlike a recipe
router.post("/like/:recipeId", authenticateToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const userId = req.user._id || req.user.userId;

    console.log(`Like Request - RecipeID: ${recipeId}, UserID: ${userId}`);
    console.log('Full user object:', req.user);

    // Validate input
    if (!recipeId || !userId) {
      console.error('Invalid input: Missing recipeId or userId');
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    // Additional logging for debugging
    const userExists = await User.findById(userId);
    if (!userExists) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      console.error(`Recipe not found: ${recipeId}`);
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user has already liked the recipe
    const userLikedRecipe = await User.findOne({
      _id: userId,
      likedRecipes: recipeId
    });

    let isLiked = !!userLikedRecipe;
    console.log(`Current like status: ${isLiked}`);

    if (isLiked) {
      // Unlike: Remove from user's liked recipes and decrement likes
      await User.findByIdAndUpdate(userId, {
        $pull: { likedRecipes: recipeId }
      });
      recipe.likes = Math.max(0, recipe.likes - 1);
    } else {
      // Like: Add to user's liked recipes and increment likes
      await User.findByIdAndUpdate(userId, {
        $addToSet: { likedRecipes: recipeId }
      });
      recipe.likes += 1;
    }

    await recipe.save();

    console.log(`Like operation completed. New likes count: ${recipe.likes}`);

    res.json({ 
      message: isLiked ? "Recipe unliked" : "Recipe liked",
      likes: recipe.likes,
      isLiked: !isLiked  
    });
  } catch (error) {
    console.error("Detailed error toggling like:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      userId: req.user?._id || req.user?.userId,
      recipeId: req.params.recipeId
    });
    
    // Log the full error for server-side debugging
    console.error('Full error object:', error);

    res.status(500).json({ 
      message: "Failed to toggle like", 
      error: error.message,
      details: {
        name: error.name,
        stack: error.stack
      }
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { text } = req.body;
    const recipeId = req.params.recipeId;
    const userId = req.user.userId;

    const recipe = await Recipe.findById(recipeId).session(session);
    if (!recipe) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Recipe not found" });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const comment = new Comment({
      text,
      user: userId,
      recipe: recipeId
    });
    await comment.save({ session });
    
    // Create notification if the recipe owner is not the same as the commenter
    if (recipe.user.toString() !== userId) {
      const notification = new Notification({
        recipient: recipe.user,
        sender: userId,
        recipe: recipeId,
        type: 'comment',
        message: `${user.name || 'Someone'} commented on your recipe "${recipe.title}"`
      });
      await notification.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // Populate user details before sending response
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name profilePicture');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
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

// Create a new recipe
router.post("/", authenticateToken, upload.single('image'), async (req, res) => {
  // Log the entire request details for comprehensive debugging
  console.log('FULL RECIPE CREATION REQUEST:', {
    headers: req.headers,
    body: req.body,
    file: req.file,
    user: req.user
  });

  try {
    const userId = req.user.userId;
    const { 
      title, 
      description, 
      category, 
      servingSize, 
      ingredients, 
      cookingInstructions, 
      authorNotes, 
      isPublic, 
      time 
    } = req.body;

    // Comprehensive field validation
    const validationErrors = [];
    if (!title || title.trim() === '') validationErrors.push('Title is required');
    if (!description || description.trim() === '') validationErrors.push('Description is required');
    if (!category) validationErrors.push('Category is required');
    if (!servingSize) validationErrors.push('Serving size is required');

    // Check if there are validation errors
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Safely parse ingredients and instructions
    let parsedIngredients = [];
    let parsedInstructions = [];
    
    try {
      parsedIngredients = JSON.parse(ingredients || '[]');
      parsedInstructions = JSON.parse(cookingInstructions || '[]');
    } catch (parseError) {
      return res.status(400).json({ 
        message: "Invalid ingredients or instructions format", 
        error: parseError.message 
      });
    }

    // Validate parsed arrays
    if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
      return res.status(400).json({ 
        message: "At least one ingredient is required" 
      });
    }

    if (!Array.isArray(parsedInstructions) || parsedInstructions.length === 0) {
      return res.status(400).json({ 
        message: "At least one cooking instruction is required" 
      });
    }

    // Validate image upload if required
    if (!req.file) {
      return res.status(400).json({
        message: "Recipe image is required"
      });
    }

    // Create recipe object
    const newRecipe = new Recipe({
      user: userId,
      title: title.trim(),
      description: description.trim(),
      category,
      servingSize,
      ingredients: parsedIngredients.map(ing => ing.trim()).filter(ing => ing !== ''),
      cookingInstructions: parsedInstructions.map(inst => inst.trim()).filter(inst => inst !== ''),
      authorNotes: (authorNotes || '').trim(),
      isPublic: isPublic === 'true' || isPublic === true,
      time,
      likes: 0,
      image: req.file.filename
    });

    // Validate recipe before saving
    try {
      await newRecipe.validate();
    } catch (validationError) {
      console.error('Recipe Validation Error:', validationError);
      return res.status(400).json({ 
        message: "Recipe validation failed", 
        errors: validationError.errors 
      });
    }

    // Save the recipe
    const savedRecipe = await newRecipe.save();

    // Log successful recipe creation
    console.log('Recipe created successfully:', {
      recipeId: savedRecipe._id,
      title: savedRecipe.title,
      imageFilename: savedRecipe.image
    });

    res.status(201).json({
      message: "Recipe created successfully",
      recipe: savedRecipe
    });

  } catch (error) {
    // Comprehensive error logging
    console.error("Detailed Error creating recipe:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      body: req.body,
      file: req.file,
      user: req.user
    });
    
    // Send a detailed error response
    res.status(500).json({ 
      message: "Failed to create recipe", 
      error: {
        message: error.message,
        name: error.name,
        details: error.stack
      }
    });
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
      updateData.image = `uploads/${req.file.filename}`;
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