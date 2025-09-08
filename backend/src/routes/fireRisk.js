const express = require('express');
const router = express.Router();
const fireRiskController = require('../controllers/fireRiskController');

/**
 * @swagger
 * /api/v1/fire-risk/current:
 *   get:
 *     summary: Get current fire risk for a location
 *     tags: [Fire Risk]
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
 *         name: region
 *         schema:
 *           type: string
 *         description: Region name (optional)
 *     responses:
 *       200:
 *         description: Fire risk assessment
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/current', fireRiskController.getCurrentFireRisk);

/**
 * @swagger
 * /api/v1/fire-risk/hotspots:
 *   get:
 *     summary: Get fire hotspots from Bhuvan API
 *     tags: [Fire Risk]
 *     parameters:
 *       - in: query
 *         name: centerLat
 *         schema:
 *           type: number
 *         description: Center latitude for radius-based search
 *       - in: query
 *         name: centerLon
 *         schema:
 *           type: number
 *         description: Center longitude for radius-based search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 50
 *         description: Search radius in kilometers
 *       - in: query
 *         name: minLat
 *         schema:
 *           type: number
 *         description: Minimum latitude for bounding box search
 *       - in: query
 *         name: maxLat
 *         schema:
 *           type: number
 *         description: Maximum latitude for bounding box search
 *       - in: query
 *         name: minLon
 *         schema:
 *           type: number
 *         description: Minimum longitude for bounding box search
 *       - in: query
 *         name: maxLon
 *         schema:
 *           type: number
 *         description: Maximum longitude for bounding box search
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for fire detection (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for fire detection (YYYY-MM-DD)
 *       - in: query
 *         name: riskThreshold
 *         schema:
 *           type: number
 *           default: 0.6
 *         description: Minimum risk threshold (0-1)
 *     responses:
 *       200:
 *         description: Fire hotspots data
 *       500:
 *         description: Server error
 */
router.get('/hotspots', fireRiskController.getFireHotspots);

/**
 * @swagger
 * /api/v1/fire-risk/spread-simulation:
 *   post:
 *     summary: Generate fire spread simulation
 *     tags: [Fire Risk]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startLat
 *               - startLon
 *             properties:
 *               startLat:
 *                 type: number
 *                 description: Starting latitude
 *               startLon:
 *                 type: number
 *                 description: Starting longitude
 *               windSpeed:
 *                 type: number
 *                 default: 10
 *                 description: Wind speed in km/h
 *               windDirection:
 *                 type: number
 *                 default: 0
 *                 description: Wind direction in degrees (0-360)
 *               temperature:
 *                 type: number
 *                 default: 30
 *                 description: Temperature in Celsius
 *               humidity:
 *                 type: number
 *                 default: 40
 *                 description: Relative humidity percentage
 *               fuelMoisture:
 *                 type: number
 *                 default: 10
 *                 description: Fuel moisture percentage
 *               simulationHours:
 *                 type: integer
 *                 default: 24
 *                 description: Simulation duration in hours
 *     responses:
 *       200:
 *         description: Fire spread simulation data
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.post('/spread-simulation', fireRiskController.generateFireSpreadSimulation);

/**
 * @swagger
 * /api/v1/fire-risk/analytics:
 *   get:
 *     summary: Get fire risk analytics for a region
 *     tags: [Fire Risk]
 *     parameters:
 *       - in: query
 *         name: region
 *         required: true
 *         schema:
 *           type: string
 *         description: Region name
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Number of days for analytics
 *     responses:
 *       200:
 *         description: Fire risk analytics data
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error
 */
router.get('/analytics', fireRiskController.getFireRiskAnalytics);

module.exports = router;
