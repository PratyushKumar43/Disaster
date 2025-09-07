const express = require('express');
const router = express.Router();
const aiAnalysisController = require('../controllers/aiAnalysisController');

/**
 * @route   POST /api/v1/ai-analysis/generate-report
 * @desc    Generate AI-powered disaster analysis report
 * @access  Public
 * @body    { state: string, disasterType: string, timeframe?: string }
 */
router.post('/generate-report', aiAnalysisController.generateAnalysisReport);

/**
 * @route   GET /api/v1/ai-analysis/download-pdf/:reportId
 * @desc    Download analysis report as PDF
 * @access  Public
 * @params  reportId - ID of the generated report
 */
router.get('/download-pdf/:reportId', aiAnalysisController.downloadReportPDF);

/**
 * @route   GET /api/v1/ai-analysis/states
 * @desc    Get list of Indian states
 * @access  Public
 */
router.get('/states', aiAnalysisController.getIndianStates);

/**
 * @route   GET /api/v1/ai-analysis/disaster-types
 * @desc    Get list of disaster types
 * @access  Public
 */
router.get('/disaster-types', aiAnalysisController.getDisasterTypes);

/**
 * @route   GET /api/v1/ai-analysis/reports
 * @desc    Get all generated reports (latest 50)
 * @access  Public
 */
router.get('/reports', aiAnalysisController.getRecentReports);

module.exports = router;
