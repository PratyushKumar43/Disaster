const express = require('express');
const router = express.Router();
// Authentication middleware removed

// Test endpoint for database connection
router.get('/db-connection', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.status(200).json({
      success: true,
      message: 'Database connection test',
      data: {
        status: states[connectionState],
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections) : []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection test failed',
      error: error.message
    });
  }
});

// Test endpoint for authentication (removed)
// Authentication functionality has been removed

// Test endpoint for basic functionality
router.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test endpoint for error handling
router.get('/error', (req, res, next) => {
  const error = new Error('This is a test error');
  error.statusCode = 400;
  next(error);
});

module.exports = router;
