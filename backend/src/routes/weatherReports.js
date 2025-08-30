const express = require('express');
const router = express.Router();
const weatherReportController = require('../controllers/weatherReportController');

/**
 * Weather Report Routes
 * Base path: /api/weather/reports
 */

/**
 * @route GET /api/weather/reports/generate
 * @desc Generate weather report in specified format
 * @query {number} latitude - Latitude coordinate
 * @query {number} longitude - Longitude coordinate
 * @query {string} [format=json] - Output format (json, pdf, excel, html)
 * @query {string} [type=comprehensive] - Report type
 * @query {string} [language=en] - Language (en, hi)
 * @query {boolean} [includeAlerts=true] - Include weather alerts
 * @query {boolean} [includeForecast=true] - Include forecast data
 * @query {number} [forecastDays=7] - Number of forecast days
 * @access Public
 */
router.get('/generate', weatherReportController.generateWeatherReport);

/**
 * @route GET /api/weather/reports/metadata
 * @desc Get report generation metadata for a location
 * @query {number} latitude - Latitude coordinate
 * @query {number} longitude - Longitude coordinate
 * @access Public
 */
router.get('/metadata', weatherReportController.getReportMetadata);

/**
 * @route POST /api/weather/reports/save
 * @desc Save generated weather report to database
 * @body {number} latitude - Latitude coordinate
 * @body {number} longitude - Longitude coordinate
 * @body {string} [format=json] - Report format
 * @body {object} reportData - Generated report data
 * @body {string} [title] - Report title
 * @access Public
 */
router.post('/save', weatherReportController.saveWeatherReport);

/**
 * @route GET /api/weather/reports/saved
 * @desc Get list of saved weather reports
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @query {number} [latitude] - Filter by latitude
 * @query {number} [longitude] - Filter by longitude
 * @access Public
 */
router.get('/saved', weatherReportController.getSavedReports);

/**
 * @route GET /api/weather/reports/saved/:id
 * @desc Get a specific saved weather report
 * @param {string} id - Report ID
 * @access Public
 */
router.get('/saved/:id', weatherReportController.getSavedReport);

/**
 * @route DELETE /api/weather/reports/saved/:id
 * @desc Delete a saved weather report
 * @param {string} id - Report ID
 * @access Public
 */
router.delete('/saved/:id', weatherReportController.deleteSavedReport);

module.exports = router;
