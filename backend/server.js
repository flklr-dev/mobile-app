const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Define allowed origins using environment variables
const allowedOrigins = [
  process.env.ORIGIN_1,  // https://mobile-app-plum-one.vercel.app
  'http://localhost:5173', // for local development
  'http://192.168.1.118:5173' // if needed for local network testing
];

app.use(cors({
  origin: function (origin, callback) {
    // Check if the origin is in our allowedOrigins array
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin); // For debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// MongoDB Connection with better error handling
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import routes
const authRoutes = require('./routes/auth');
const recipeRoutes = require("./routes/recipes");
const notificationRoutes = require("./routes/notifications");

// Use routes
app.use('/auth', authRoutes);
app.use("/recipes", recipeRoutes);
app.use("/notifications", notificationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
