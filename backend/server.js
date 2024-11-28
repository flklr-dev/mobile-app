const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();

// Update CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://192.168.1.118:3000",
    "http://192.168.1.118:5173"
  ],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

  const authRoutes = require('./routes/auth');
  const recipeRoutes = require("./routes/recipes");
  
  app.use('/auth', authRoutes);
  app.use("/recipes", recipeRoutes); // Use recipe routes for search functionality
  
  // Serve static assets (images, etc.)
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  

  

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
