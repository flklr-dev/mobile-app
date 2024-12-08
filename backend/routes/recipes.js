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
const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const uploadToS3 = (file) => {
  const fileContent = fs.readFileSync(file.path);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${file.filename}`,
    Body: fileContent,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  return s3.upload(params).promise();
};

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
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
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

// Add a recipe
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  console.log('FULL REQUEST DETAILS:');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request User:', JSON.stringify(req.user, null, 2));
  console.log('Incoming request body:', JSON.stringify(req.body, null, 2));
  console.log('Uploaded file:', req.file);

  try {
    // Detailed authentication logging
    if (!req.user) {
      console.error('CRITICAL: No user object in request');
      return res.status(401).json({ 
        message: "Authentication failed", 
        details: "No user object found in request" 
      });
    }

    // Extract user ID with multiple fallback methods
    const userId = 
      req.user._id || 
      req.user.userId || 
      req.user.id || 
      (req.user.sub ? req.user.sub : null);

    if (!userId) {
      console.error('CRITICAL: Cannot extract user ID', req.user);
      return res.status(401).json({ 
        message: "Authentication failed", 
        details: "Unable to extract user ID" 
      });
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
      time
    } = req.body;

    // Detailed field logging
    console.log('Parsed Fields:', {
      userId,
      title, 
      description, 
      category, 
      servingSize, 
      ingredientsType: typeof ingredients,
      ingredientsValue: ingredients,
      cookingInstructionsType: typeof cookingInstructions,
      cookingInstructionsValue: cookingInstructions,
      authorNotes, 
      isPublic, 
      time
    });

    // Validate required fields with more detailed checks
    const requiredFields = [
      { name: 'title', value: title },
      { name: 'description', value: description },
      { name: 'category', value: category },
      { name: 'servingSize', value: servingSize },
      { name: 'time', value: time }
    ];

    const missingFields = requiredFields
      .filter(field => !field.value || field.value.trim() === '')
      .map(field => field.name);

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Parse JSON strings safely with more error details
    let parsedIngredients = [], parsedInstructions = [];
    try {
      // Extremely robust parsing
      parsedIngredients = typeof ingredients === 'string' 
        ? JSON.parse(ingredients) 
        : Array.isArray(ingredients) 
          ? ingredients 
          : [];

      parsedInstructions = typeof cookingInstructions === 'string'
        ? JSON.parse(cookingInstructions)
        : Array.isArray(cookingInstructions)
          ? cookingInstructions
          : [];

      // Additional validation for ingredients and instructions
      if (!Array.isArray(parsedIngredients) || !Array.isArray(parsedInstructions)) {
        throw new Error('Ingredients and instructions must be arrays');
      }

      if (parsedIngredients.length === 0 || parsedInstructions.length === 0) {
        return res.status(400).json({ 
          message: "Recipe must have at least one ingredient and one instruction" 
        });
      }
    } catch (parseError) {
      console.error('CRITICAL JSON Parsing Error:', parseError);
      console.error('Ingredients:', ingredients);
      console.error('Cooking Instructions:', cookingInstructions);
      return res.status(400).json({ 
        message: "Invalid ingredients or instructions format",
        error: parseError.message,
        ingredients,
        cookingInstructions
      });
    }

    // Handle image path
    let imagePath = null;
    if (req.file) {
      try {
        if (process.env.NODE_ENV === 'production') {
          const uploadResult = await uploadToS3(req.file);
          imagePath = uploadResult.Location; // S3 URL
        } else {
          // Ensure path uses forward slashes for consistency
          imagePath = req.file.path.replace(/\\/g, '/').replace(/.*uploads/, 'uploads');
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          message: "Failed to upload image", 
          error: uploadError.message 
        });
      }
    }

    // Create new recipe object with more robust validation
    const recipe = new Recipe({
      user: userId,  // Use extracted user ID
      title: title.trim(),
      description: description.trim(),
      category,
      servingSize,
      ingredients: parsedIngredients,
      cookingInstructions: parsedInstructions,
      authorNotes: authorNotes ? authorNotes.trim() : "",
      isPublic: isPublic === "true" || isPublic === true,
      time,
      image: imagePath,
      likes: []  // Initialize as empty array
    });

    console.log('Recipe object to save:', JSON.stringify(recipe, null, 2));

    // Save the recipe with error handling
    try {
      await recipe.save();
      console.log('Recipe saved successfully:', recipe._id);

      res.status(201).json({ 
        message: "Recipe created successfully",
        recipe: {
          _id: recipe._id,
          title: recipe.title,
          category: recipe.category
        }
      });
    } catch (saveError) {
      console.error('CRITICAL Recipe save error:', saveError);
      
      // Handle specific Mongoose validation errors
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors)
          .map(err => err.message);
        
        return res.status(400).json({ 
          message: "Validation error", 
          errors: validationErrors 
        });
      }

      // Handle duplicate key errors
      if (saveError.code === 11000) {
        return res.status(400).json({ 
          message: "A recipe with this title already exists" 
        });
      }

      // Generic save error
      res.status(500).json({ 
        message: "Error saving recipe",
        error: process.env.NODE_ENV === 'development' ? saveError.message : undefined,
        details: JSON.stringify(saveError)
      });
    }

  } catch (error) {
    console.error('CRITICAL Unexpected error in recipe creation:', error);
    
    res.status(500).json({ 
      message: "Unexpected error creating recipe",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: JSON.stringify(error)
    });
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
    const userId = req.user._id;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const isLiked = recipe.likes.includes(userId);

    if (isLiked) {
      // Unlike
      recipe.likes = recipe.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      recipe.likes.push(userId);
    }

    await recipe.save();

    res.json({ 
      message: isLiked ? "Recipe unliked" : "Recipe liked",
      likes: recipe.likes.length  // Return the updated likes count
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Failed to toggle like" });
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