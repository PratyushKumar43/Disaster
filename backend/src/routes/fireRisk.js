const express = require('express');
const router = express.Router();
const fireRiskController = require('../controllers/fireRiskController');

/**
 * Fire Risk API Routes
 * Provides endpoints for ML-based fire risk predictions and analysis
 */

/**
 * @route GET /api/fire-risk/current
 * @desc Get current fire risk for a specific location
 * @access Public
 * @param {number} latitude - Latitude coordinate (required)
 * @param {number} longitude - Longitude coordinate (required)
 * @param {string} region - Region name (optional, auto-detected if not provided)
 * @example /api/fire-risk/current?latitude=28.6139&longitude=77.2090&region=Delhi
 */
router.get('/current', fireRiskController.getCurrentRisk);

/**
 * @route POST /api/fire-risk/risk-map
 * @desc Generate fire risk map for a region or custom bounds
 * @access Public
 * @body {object} Request body containing region, bounds, or centerLocation
 * @example 
 * {
 *   "centerLocation": { "latitude": 28.6139, "longitude": 77.2090, "radius": 2.0 },
 *   "region": "Delhi",
 *   "date": "2023-12-15"
 * }
 */
router.post('/risk-map', fireRiskController.generateRiskMap);

/**
 * @route GET /api/fire-risk/historical
 * @desc Get historical fire risk data with optional filtering
 * @access Public
 * @param {string} region - Region name (optional)
 * @param {string} startDate - Start date in ISO format (optional)
 * @param {string} endDate - End date in ISO format (optional)
 * @param {number} latitude - Latitude for location-based search (optional)
 * @param {number} longitude - Longitude for location-based search (optional)
 * @example /api/fire-risk/historical?region=Uttarakhand&startDate=2023-12-01&endDate=2023-12-15
 */
router.get('/historical', fireRiskController.getHistoricalRisk);

/**
 * @route GET /api/fire-risk/hotspots
 * @desc Get current fire risk hotspots with high risk levels
 * @access Public
 * @param {string} region - Region name (optional)
 * @param {string} date - Date in ISO format (optional, defaults to today)
 * @param {number} riskThreshold - Minimum risk score threshold (default: 0.6)
 * @param {string} centerLocation - JSON string with center location and radius (optional)
 * @example /api/fire-risk/hotspots?region=Maharashtra&riskThreshold=0.7&centerLocation={"latitude":19.0760,"longitude":72.8777,"radius":1.5}
 */
router.get('/hotspots', fireRiskController.getHotspots);

/**
 * @route GET /api/fire-risk/analytics
 * @desc Get fire risk analytics and trends
 * @access Public
 * @param {string} region - Region name (optional)
 * @param {number} period - Analysis period in days (default: 7)
 * @example /api/fire-risk/analytics?region=Punjab&period=30
 */
router.get('/analytics', fireRiskController.getAnalytics);

/**
 * @route POST /api/fire-risk/batch-predict
 * @desc Batch prediction for multiple locations
 * @access Public
 * @body {object} Request body with locations array
 * @example
 * {
 *   "locations": [
 *     { "latitude": 28.6139, "longitude": 77.2090 },
 *     { "latitude": 19.0760, "longitude": 72.8777 },
 *     { "latitude": 22.5726, "longitude": 88.3639 }
 *   ]
 * }
 */
router.post('/batch-predict', fireRiskController.batchPredict);

// Error handling middleware for this route
router.use((error, req, res, next) => {
  console.error('Fire Risk API Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: Object.values(error.errors).map(e => e.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid parameter format'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = router;
