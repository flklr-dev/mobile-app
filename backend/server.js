const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const multer = require('multer');

const app = express();

// Define allowed origins
const allowedOrigins = [
  'https://mobile-app-plum-one.vercel.app',  // Vercel production URL
  'https://mobile-app-2-s9az.onrender.com', // Backend production URL
  'http://localhost:5173',                   // Local frontend
  'http://localhost:5000',                   // Local backend
  'capacitor://localhost',                   // Mobile app
  'http://localhost:500'                     // Additional mobile app
];

// Updated CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Origin', 
    'Accept', 
    'x-requested-with', 
    'Access-Control-Allow-Origin'
  ]
}));

// Additional headers for CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin'
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
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

// Add this before your routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    query: req.query,
    params: req.params,
    body: req.body
  });
  next();
});

// Add this after your routes
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

console.log('Registered routes:', app._router.stack
  .filter(r => r.route)
  .map(r => `${Object.keys(r.route.methods)} ${r.route.path}`));

console.log('Email Config:', {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS?.substring(0, 4) + '...' // Show only first 4 chars for security
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});