const express = require('express');
const router = express.Router();
const {
  getCurrentWeather,
  getWeatherForecast,
  getWeatherAlerts,
  getWeatherStats,
  bulkUpdateWeather,
  cleanupWeatherData
} = require('../controllers/weatherController');

// Authentication middleware removed for now
const CONSTANTS = require('../config/constants');

/**
 * @swagger
 * /api/v1/weather/current:
 *   get:
 *     summary: Get current weather for a location
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude coordinate
 *       - in: query
 *         name: location_name
 *         schema:
 *           type: string
 *         description: Name of the location
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State name
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: District name
 *     responses:
 *       200:
 *         description: Current weather data retrieved successfully
 *       400:
 *         description: Invalid coordinates or missing parameters
 *       500:
 *         description: Server error
 */
router.get('/current', getCurrentWeather);

/**
 * @swagger
 * /api/v1/weather/forecast:
 *   get:
 *     summary: Get weather forecast for a location
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 16
 *           default: 7
 *         description: Number of forecast days
 *     responses:
 *       200:
 *         description: Weather forecast retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/forecast', getWeatherForecast);

/**
 * @swagger
 * /api/v1/weather/alerts:
 *   get:
 *     summary: Get weather alerts for a location or region
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State name to filter alerts
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, moderate, high, extreme]
 *         description: Filter by alert severity
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: true
 *         description: Show only active alerts
 *     responses:
 *       200:
 *         description: Weather alerts retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/alerts', getWeatherAlerts);

/**
 * @swagger
 * /api/v1/weather/stats:
 *   get:
 *     summary: Get weather statistics and dashboard data
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 7
 *         description: Number of days back to include in statistics
 *     responses:
 *       200:
 *         description: Weather statistics retrieved successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/stats', getWeatherStats);

/**
 * @swagger
 * /api/v1/weather/bulk-update:
 *   post:
 *     summary: Bulk update weather data for multiple locations
 *     tags: [Weather]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locations:
 *                 type: array
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   properties:
 *                     latitude:
 *                       type: number
 *                       minimum: -90
 *                       maximum: 90
 *                     longitude:
 *                       type: number
 *                       minimum: -180
 *                       maximum: 180
 *                     name:
 *                       type: string
 *                     state:
 *                       type: string
 *                     district:
 *                       type: string
 *                   required:
 *                     - latitude
 *                     - longitude
 *             required:
 *               - locations
 *     responses:
 *       200:
 *         description: Bulk update completed
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post('/bulk-update', 
  // requirePermission('weather', 'create'),
  // authorize(CONSTANTS.USER_ROLES.ADMIN, CONSTANTS.USER_ROLES.COORDINATOR),
  bulkUpdateWeather
);

/**
 * @swagger
 * /api/v1/weather/cleanup:
 *   delete:
 *     summary: Cleanup old weather data
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: days_old
 *         schema:
 *           type: integer
 *           minimum: 7
 *           default: 30
 *         description: Delete data older than this many days
 *       - in: query
 *         name: dry_run
 *         schema:
 *           type: string
 *           enum: [true, false]
 *           default: false
 *         description: Perform a dry run without actual deletion
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.delete('/cleanup',
  // requirePermission('weather', 'delete'),
  // authorize(CONSTANTS.USER_ROLES.ADMIN),
  cleanupWeatherData
);

// Health check for weather service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Weather service is running',
    timestamp: new Date().toISOString(),
    service: 'weather-api',
    version: '1.0.0'
  });
});

module.exports = router;
