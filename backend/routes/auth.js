const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Notification = require("../models/Notification");

const router = express.Router();

// Configure storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Save files with unique names
  },
});


const upload = multer({ storage: storage });

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, aboutMe } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      profilePicture: "uploads/default-profile.png", // Set default profile picture
      aboutMe: aboutMe || "", // Ensure aboutMe is set to an empty string if not provided
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "30m" });
    res.json({ 
      token,
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log("No Authorization header provided");
    return res.status(401).json({ message: "Access denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token after 'Bearer'
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    res.status(400).json({ message: "Invalid token" });
  }
};


// Updated Get user details route
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, "name profilePicture aboutMe likedRecipes").populate("likedRecipes");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Include likedRecipes in the response
    res.json({
      name: user.name,
      profilePicture: user.profilePicture,
      aboutMe: user.aboutMe,
      likedRecipes: user.likedRecipes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update profile route
router.put("/update", authenticateToken, upload.single("profilePicture"), async (req, res) => {
  try {
    const { name, aboutMe } = req.body;

    const user = await User.findById(req.user.userId); // Find the user by userId from the database
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update name and aboutMe if provided
    user.name = name || user.name;
    user.aboutMe = aboutMe || user.aboutMe;

    // Handle profile picture upload if present
    if (req.file) {
      user.profilePicture = req.file.path; // Save the path to the uploaded file
    }

    await user.save(); // Save the updated user data to the database
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/liked-recipes', authenticateToken, async (req, res) => {
  try {
    // First, find the user and ensure they exist
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Then, fetch the liked recipes with populated user data
    const likedRecipes = await Recipe.find(
      { _id: { $in: user.likedRecipes } }
    ).populate('user', 'name profilePicture');

    res.json(likedRecipes);

  } catch (error) {
    console.error('Server error in /liked-recipes:', error);
    res.status(500).json({ 
      message: 'Error fetching liked recipes',
      error: error.message 
    });
  }
});

// Add this route to your existing auth.js file
router.post('/add-meal-plan', authenticateToken, async (req, res) => {
  try {
    const { mealPlans } = req.body;
    
    // Update user document with new meal plans
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId, // Changed from req.user.id to req.user.userId to match your auth middleware
      { 
        $push: { 
          mealPlans: { 
            $each: mealPlans.map(plan => ({
              recipeId: plan.recipeId,
              date: new Date(plan.date),
              category: plan.category,
              createdAt: new Date()
            }))
          } 
        } 
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Meal plan added successfully' });
  } catch (error) {
    console.error('Error adding meal plan:', error);
    res.status(500).json({ message: 'Failed to add meal plan', error: error.message });
  }
});

// Add this route to fetch meal plans for a specific date
router.get('/meal-plans/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .populate({
        path: 'mealPlans.recipeId',
        select: 'title image calories'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter meal plans for the specified date
    const dailyMealPlans = user.mealPlans.filter(plan => 
      plan.date.toISOString().split('T')[0] === date
    );

    res.status(200).json(dailyMealPlans);
  } catch (error) {
    console.error('Error fetching meal plans:', error);
    res.status(500).json({ message: 'Failed to fetch meal plans', error: error.message });
  }
});

// Add this new route for deleting a meal plan
router.delete('/meal-plans/:date/:mealId', authenticateToken, async (req, res) => {
  try {
    const { date, mealId } = req.params;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find and remove the specific meal plan
    const mealPlanIndex = user.mealPlans.findIndex(
      plan => 
        plan._id.toString() === mealId && 
        plan.date.toISOString().split('T')[0] === date
    );

    if (mealPlanIndex === -1) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    // Remove the meal plan
    user.mealPlans.splice(mealPlanIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    res.status(500).json({ message: 'Failed to delete meal plan', error: error.message });
  }
});

// Add this route to get user data
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('likedRecipes')
      .select('-password'); // Exclude password from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Update the user route to properly fetch user data and calculate totals
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name profilePicture bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all recipes by this user
    const recipes = await Recipe.find({ userId: req.params.userId });
    
    // Calculate totals
    const totalRecipes = recipes.length;
    const totalLikes = recipes.reduce((sum, recipe) => sum + (recipe.likes || 0), 0);

    res.json({
      ...user.toObject(),
      totalRecipes,
      totalLikes
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Add this new route for getting other user's profiles
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name profilePicture aboutMe');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

router.put('/update-profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      aboutMe: req.body.aboutMe,
    };

    if (req.file) {
      updates.profilePicture = req.file.path.replace(/\\/g, '/');
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Get user notifications
router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.userId })
      .populate('sender', 'name profilePicture')
      .populate('recipe', 'title')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put("/notifications/:notificationId/read", authenticateToken, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.notificationId, { read: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all notifications as read
router.put("/notifications/mark-all-read", authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
