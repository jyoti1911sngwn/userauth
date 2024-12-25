const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db');  // Ensure db.js is set up properly for MongoDB connection
const app = express();

// Connect to MongoDB
connectToMongo();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/auth', require('./routes/auth'));

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export Firebase Function that wraps the Express app
exports.api = functions.https.onRequest(app);
