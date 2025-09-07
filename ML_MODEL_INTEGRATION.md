# Forest Fire Detection ML Model Integration Guide

## Overview

This document provides a comprehensive guide for integrating the Forest Fire Detection ML Model into the existing disaster management backend and frontend system. The model uses Google Earth Engine data and Random Forest algorithms to predict fire risk in the Uttarakhand region.

## Table of Contents

1. [Model Architecture](#model-architecture)
2. [Backend Integration](#backend-integration)
3. [Frontend Integration](#frontend-integration)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Deployment Guide](#deployment-guide)
7. [Testing](#testing)

## Model Architecture

### Core Components

The Forest Fire Detection Model consists of:

- **Data Sources**: Google Earth Engine (Sentinel, MODIS, ERA5)
- **Features**: Temperature, Wind Speed, NDVI, Burn History, Terrain
- **Algorithm**: Random Forest Classifier
- **Output**: Fire risk probability maps (0-1 scale)
- **Spatial Coverage**: Uttarakhand region (77.5°E-81.5°E, 28.7°N-31.3°N)
- **Temporal Resolution**: Daily predictions

### Model Features

#### Dynamic Features (Time-varying)
- **Temperature**: Mean 2m air temperature (°C)
- **Wind Components**: U/V wind at 10m (m/s)
- **Wind Speed**: Calculated wind speed magnitude
- **NDVI**: Vegetation index (0-1 scale)
- **Burn Date**: Recent fire history

#### Static Features (Terrain)
- **Elevation**: Digital Elevation Model (DEM)
- **Slope**: Terrain slope (degrees)
- **Aspect**: Terrain aspect
- **Land Cover**: ESA WorldCover classification

### Model Performance
- **Accuracy**: ~85% on test data
- **Precision**: Optimized for fire risk detection
- **Temporal Coverage**: Multi-day lag features (3-day window)
- **Spatial Resolution**: 500m grid cells

---

## Backend Integration

### File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── fireRiskController.js          # New ML controller
│   │   └── weatherReportController.js     # Enhanced with fire risk
│   ├── models/
│   │   ├── FireRisk.js                    # New fire risk model
│   │   └── FirePrediction.js              # Daily predictions model
│   ├── routes/
│   │   └── fireRisk.js                    # Fire risk API routes
│   ├── services/
│   │   ├── mlModelService.js              # ML model integration
│   │   ├── geeService.js                  # Google Earth Engine service
│   │   └── fireRiskProcessor.js           # Risk calculation service
│   └── utils/
│       ├── geoUtils.js                    # Geographic utilities
│       └── riskCalculator.js              # Risk assessment utilities
├── models/
│   └── anyburn_rf.joblib                  # Trained ML model
└── python/
    ├── fire_model.py                      # Python ML interface
    ├── gee_data_fetcher.py               # Earth Engine data fetcher
    └── risk_predictor.py                 # Prediction service
```

### 1. Database Models

#### FireRisk Model (`src/models/FireRisk.js`)

```javascript
const mongoose = require('mongoose');

const fireRiskSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    enum: ['uttarakhand', 'himachal', 'kerala'] // Expandable regions
  },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    bounds: {
      north: Number,
      south: Number,
      east: Number,
      west: Number
    }
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['LOW', 'MODERATE', 'HIGH', 'EXTREME']
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  features: {
    temperature: Number,     // °C
    windSpeed: Number,      // m/s
    windDirection: Number,  // degrees
    ndvi: Number,           // 0-1
    humidity: Number,       // %
    elevation: Number,      // meters
    slope: Number,          // degrees
    burnHistory: Boolean    // recent fire activity
  },
  metadata: {
    modelVersion: String,
    confidence: Number,
    dataQuality: String,
    lastUpdated: Date
  },
  alerts: [{
    type: {
      type: String,
      enum: ['FIRE_RISK', 'WEATHER_WARNING', 'VEGETATION_STRESS']
    },
    severity: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    },
    message: String,
    isActive: Boolean,
    createdAt: Date
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
fireRiskSchema.index({ region: 1, date: -1 });
fireRiskSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
fireRiskSchema.index({ riskLevel: 1, date: -1 });

module.exports = mongoose.model('FireRisk', fireRiskSchema);
```

#### FirePrediction Model (`src/models/FirePrediction.js`)

```javascript
const mongoose = require('mongoose');

const firePredictionSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true
  },
  predictionDate: {
    type: Date,
    required: true
  },
  horizon: {
    type: Number,
    default: 1 // Days ahead
  },
  gridData: {
    resolution: Number, // meters
    bounds: {
      north: Number,
      south: Number,
      east: Number,
      west: Number
    },
    riskGrid: [[Number]], // 2D array of risk scores
    dimensions: {
      rows: Number,
      cols: Number
    }
  },
  summary: {
    totalCells: Number,
    highRiskCells: Number,
    averageRisk: Number,
    maxRisk: Number,
    hotspots: [{
      latitude: Number,
      longitude: Number,
      riskScore: Number,
      features: mongoose.Schema.Types.Mixed
    }]
  },
  processingInfo: {
    startTime: Date,
    endTime: Date,
    duration: Number, // milliseconds
    dataSource: String,
    modelVersion: String,
    status: {
      type: String,
      enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PROCESSING'
    }
  }
}, {
  timestamps: true
});

firePredictionSchema.index({ region: 1, predictionDate: -1 });
firePredictionSchema.index({ 'processingInfo.status': 1 });

module.exports = mongoose.model('FirePrediction', firePredictionSchema);
```

### 2. ML Model Service (`src/services/mlModelService.js`)

```javascript
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { logger } = require('../config/database');

class MLModelService {
  constructor() {
    this.modelPath = path.join(__dirname, '../../models/anyburn_rf.joblib');
    this.pythonScriptPath = path.join(__dirname, '../../python');
  }

  /**
   * Check if ML model files exist
   */
  async checkModelAvailability() {
    try {
      await fs.access(this.modelPath);
      return true;
    } catch (error) {
      logger.error('ML Model not found:', error);
      return false;
    }
  }

  /**
   * Predict fire risk for given coordinates and features
   * @param {Object} features - Input features for prediction
   * @returns {Promise<Object>} Prediction results
   */
  async predictFireRisk(features) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(this.pythonScriptPath, 'risk_predictor.py'),
        JSON.stringify(features)
      ]);

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve({
              riskScore: result.risk_score,
              riskLevel: this.getRiskLevel(result.risk_score),
              confidence: result.confidence,
              features: result.features
            });
          } catch (parseError) {
            reject(new Error(`Failed to parse prediction result: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Python process failed with code ${code}: ${error}`));
        }
      });
    });
  }

  /**
   * Generate risk map for a region
   * @param {Object} bounds - Geographic bounds
   * @param {Date} date - Prediction date
   * @returns {Promise<Object>} Risk map data
   */
  async generateRiskMap(bounds, date) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(this.pythonScriptPath, 'generate_risk_map.py'),
        JSON.stringify({ bounds, date: date.toISOString() })
      ]);

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse risk map: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Risk map generation failed: ${error}`));
        }
      });
    });
  }

  /**
   * Convert risk score to categorical level
   * @param {number} score - Risk score (0-1)
   * @returns {string} Risk level
   */
  getRiskLevel(score) {
    if (score >= 0.8) return 'EXTREME';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.4) return 'MODERATE';
    return 'LOW';
  }

  /**
   * Batch predict for multiple locations
   * @param {Array} locations - Array of {lat, lon, features}
   * @returns {Promise<Array>} Array of predictions
   */
  async batchPredict(locations) {
    const predictions = [];
    
    for (const location of locations) {
      try {
        const prediction = await this.predictFireRisk(location.features);
        predictions.push({
          ...location,
          ...prediction
        });
      } catch (error) {
        logger.error(`Prediction failed for location ${location.lat}, ${location.lon}:`, error);
        predictions.push({
          ...location,
          riskScore: 0,
          riskLevel: 'LOW',
          confidence: 0,
          error: error.message
        });
      }
    }
    
    return predictions;
  }
}

module.exports = new MLModelService();
```

### 3. Fire Risk Controller (`src/controllers/fireRiskController.js`)

```javascript
const FireRisk = require('../models/FireRisk');
const FirePrediction = require('../models/FirePrediction');
const mlModelService = require('../services/mlModelService');
const geeService = require('../services/geeService');
const { logger } = require('../config/database');
const { validationResult } = require('express-validator');

/**
 * Fire Risk Controller
 * Handles ML-based fire risk predictions and analysis
 */
class FireRiskController {
  
  /**
   * Get current fire risk for a specific location
   */
  async getCurrentRisk(req, res) {
    try {
      const { latitude, longitude, region } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      // Auto-detect region from coordinates if not provided
      const detectedRegion = region || this.detectRegionFromCoordinates(
        parseFloat(latitude), 
        parseFloat(longitude)
      );

      // Get recent features from Google Earth Engine
      const features = await geeService.getLocationFeatures(
        parseFloat(latitude), 
        parseFloat(longitude)
      );

      // Predict fire risk
      const prediction = await mlModelService.predictFireRisk(features);

      // Save to database
      const fireRisk = new FireRisk({
        region: detectedRegion,
        coordinates: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        },
        date: new Date(),
        riskLevel: prediction.riskLevel,
        riskScore: prediction.riskScore,
        features: features,
        metadata: {
          modelVersion: '1.0',
          confidence: prediction.confidence,
          dataQuality: features.dataQuality || 'GOOD',
          lastUpdated: new Date()
        }
      });

      await fireRisk.save();

      res.json({
        success: true,
        data: {
          riskScore: prediction.riskScore,
          riskLevel: prediction.riskLevel,
          confidence: prediction.confidence,
          location: { 
            latitude: parseFloat(latitude), 
            longitude: parseFloat(longitude),
            region: detectedRegion 
          },
          features: features,
          timestamp: new Date()
        }
      });

    } catch (error) {
      logger.error('Get current risk error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get fire risk prediction',
        error: error.message
      });
    }
  }

  /**
   * Generate fire risk map for a region
   */
  async generateRiskMap(req, res) {
    try {
      const { region, date, bounds, centerLocation } = req.body;
      
      const predictionDate = date ? new Date(date) : new Date();
      
      // Determine bounds based on center location or custom bounds
      let mapBounds;
      if (bounds) {
        mapBounds = bounds;
      } else if (centerLocation && centerLocation.latitude && centerLocation.longitude) {
        // Generate bounds around center location (default 2-degree radius)
        const lat = parseFloat(centerLocation.latitude);
        const lng = parseFloat(centerLocation.longitude);
        const radius = centerLocation.radius || 2.0; // degrees
        
        mapBounds = {
          north: lat + radius,
          south: lat - radius,
          east: lng + radius,
          west: lng - radius
        };
      } else {
        // Default to a global view or require bounds
        return res.status(400).json({
          success: false,
          message: 'Either bounds or centerLocation must be provided'
        });
      }

      // Auto-detect region from bounds center if not provided
      const detectedRegion = region || this.detectRegionFromCoordinates(
        (mapBounds.north + mapBounds.south) / 2,
        (mapBounds.east + mapBounds.west) / 2
      );

      // Generate risk map using ML model
      const riskMapData = await mlModelService.generateRiskMap(mapBounds, predictionDate);

      // Save prediction to database
      const prediction = new FirePrediction({
        region: detectedRegion,
        predictionDate,
        gridData: {
          resolution: 500, // 500m resolution
          bounds: mapBounds,
          riskGrid: riskMapData.riskGrid,
          dimensions: riskMapData.dimensions
        },
        summary: riskMapData.summary,
        processingInfo: {
          startTime: new Date(),
          endTime: new Date(),
          duration: riskMapData.processingTime || 0,
          dataSource: 'Google Earth Engine',
          modelVersion: '1.0',
          status: 'COMPLETED'
        }
      });

      await prediction.save();

      res.json({
        success: true,
        data: {
          predictionId: prediction._id,
          riskMap: {
            riskGrid: riskMapData.riskGrid,
            dimensions: riskMapData.dimensions,
            bounds: mapBounds
          },
          summary: riskMapData.summary,
          region: detectedRegion,
          timestamp: new Date()
        }
            resolution: 500
          }
        }
      });

    } catch (error) {
      logger.error('Generate risk map error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate fire risk map',
        error: error.message
      });
    }
  }

  /**
   * Get historical fire risk data
   */
  async getHistoricalRisk(req, res) {
    try {
      const { region, startDate, endDate, latitude, longitude } = req.query;
      
      const query = {};
      if (region) query.region = region;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
      
      // Location-based query
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const radius = 0.01; // ~1km radius
        
        query['coordinates.latitude'] = { $gte: lat - radius, $lte: lat + radius };
        query['coordinates.longitude'] = { $gte: lon - radius, $lte: lon + radius };
      }

      const historicalData = await FireRisk.find(query)
        .sort({ date: -1 })
        .limit(100)
        .lean();

      res.json({
        success: true,
        data: historicalData,
        count: historicalData.length
      });

    } catch (error) {
      logger.error('Get historical risk error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve historical fire risk data',
        error: error.message
      });
    }
  }

  /**
   * Get fire risk hotspots
   */
  async getHotspots(req, res) {
    try {
      const { region = 'uttarakhand', date, riskThreshold = 0.6 } = req.query;
      
      const queryDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);

      const hotspots = await FireRisk.find({
        region,
        date: { $gte: startOfDay, $lte: endOfDay },
        riskScore: { $gte: parseFloat(riskThreshold) }
      })
      .sort({ riskScore: -1 })
      .limit(50)
      .lean();

      const hotspotsWithAlerts = hotspots.map(spot => ({
        ...spot,
        alertLevel: spot.riskScore >= 0.8 ? 'CRITICAL' : 'HIGH',
        coordinates: spot.coordinates,
        riskDescription: this.getRiskDescription(spot.riskScore)
      }));

      res.json({
        success: true,
        data: hotspotsWithAlerts,
        summary: {
          totalHotspots: hotspotsWithAlerts.length,
          criticalCount: hotspotsWithAlerts.filter(h => h.alertLevel === 'CRITICAL').length,
          highCount: hotspotsWithAlerts.filter(h => h.alertLevel === 'HIGH').length,
          averageRisk: hotspotsWithAlerts.reduce((sum, h) => sum + h.riskScore, 0) / hotspotsWithAlerts.length || 0
        }
      });

    } catch (error) {
      logger.error('Get hotspots error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve fire risk hotspots',
        error: error.message
      });
    }
  }

  /**
   * Get fire risk analytics
   */
  async getAnalytics(req, res) {
    try {
      const { region = 'uttarakhand', period = '7d' } = req.query;
      
      const periodDays = parseInt(period.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const pipeline = [
        {
          $match: {
            region: region,
            date: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              riskLevel: "$riskLevel"
            },
            count: { $sum: 1 },
            avgRiskScore: { $avg: "$riskScore" },
            maxRiskScore: { $max: "$riskScore" }
          }
        },
        {
          $sort: { "_id.date": 1 }
        }
      ];

      const analytics = await FireRisk.aggregate(pipeline);

      // Process analytics data
      const processedAnalytics = this.processAnalyticsData(analytics);

      res.json({
        success: true,
        data: processedAnalytics,
        metadata: {
          region,
          period: `${periodDays} days`,
          startDate,
          endDate: new Date()
        }
      });

    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve fire risk analytics',
        error: error.message
      });
    }
  }

  /**
   * Process analytics data for frontend consumption
   */
  processAnalyticsData(rawAnalytics) {
    const dailyData = {};
    
    rawAnalytics.forEach(item => {
      const date = item._id.date;
      const riskLevel = item._id.riskLevel;
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          LOW: 0,
          MODERATE: 0,
          HIGH: 0,
          EXTREME: 0,
          totalPredictions: 0,
          avgRiskScore: 0,
          maxRiskScore: 0
        };
      }
      
      dailyData[date][riskLevel] = item.count;
      dailyData[date].totalPredictions += item.count;
      dailyData[date].avgRiskScore += item.avgRiskScore * item.count;
      dailyData[date].maxRiskScore = Math.max(dailyData[date].maxRiskScore, item.maxRiskScore);
    });

    // Calculate weighted averages
    Object.keys(dailyData).forEach(date => {
      if (dailyData[date].totalPredictions > 0) {
        dailyData[date].avgRiskScore /= dailyData[date].totalPredictions;
      }
    });

    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get risk description based on score
   */
  getRiskDescription(score) {
    if (score >= 0.8) return 'Extreme fire risk - immediate action required';
    if (score >= 0.6) return 'High fire risk - enhanced monitoring recommended';
    if (score >= 0.4) return 'Moderate fire risk - normal precautions advised';
    return 'Low fire risk - routine monitoring sufficient';
  }

  /**
   * Detect region from coordinates
   */
  detectRegionFromCoordinates(latitude, longitude) {
    // Uttarakhand bounds
    if (latitude >= 28.7 && latitude <= 31.3 && longitude >= 77.5 && longitude <= 81.5) {
      return 'uttarakhand';
    }
    // Himachal Pradesh bounds
    if (latitude >= 30.2 && latitude <= 33.2 && longitude >= 75.5 && longitude <= 79.0) {
      return 'himachal_pradesh';
    }
    // Kerala bounds
    if (latitude >= 8.2 && latitude <= 12.8 && longitude >= 74.9 && longitude <= 77.4) {
      return 'kerala';
    }
    // Kashmir bounds
    if (latitude >= 32.2 && latitude <= 36.8 && longitude >= 73.5 && longitude <= 80.3) {
      return 'kashmir';
    }
    // Default fallback - use coordinates as region identifier
    return `custom_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  }
}

module.exports = new FireRiskController();
```

### 4. API Routes (`src/routes/fireRisk.js`)

```javascript
const express = require('express');
const router = express.Router();
const fireRiskController = require('../controllers/fireRiskController');
const { body, query, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Fire Risk
 *   description: ML-based forest fire risk prediction API
 */

/**
 * @swagger
 * /api/fire-risk/current:
 *   get:
 *     summary: Get current fire risk for location
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
 *           default: uttarakhand
 *         description: Region identifier
 *     responses:
 *       200:
 *         description: Fire risk prediction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     riskScore:
 *                       type: number
 *                       description: Risk score (0-1)
 *                     riskLevel:
 *                       type: string
 *                       enum: [LOW, MODERATE, HIGH, EXTREME]
 *                     confidence:
 *                       type: number
 *                     location:
 *                       type: object
 *                     features:
 *                       type: object
 */
router.get('/current', [
  query('latitude').isFloat().withMessage('Valid latitude required'),
  query('longitude').isFloat().withMessage('Valid longitude required'),
  query('region').optional().isString()
], fireRiskController.getCurrentRisk);

/**
 * @swagger
 * /api/fire-risk/map:
 *   post:
 *     summary: Generate fire risk map for region
 *     tags: [Fire Risk]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               region:
 *                 type: string
 *                 default: uttarakhand
 *               date:
 *                 type: string
 *                 format: date
 *               bounds:
 *                 type: object
 *                 properties:
 *                   north:
 *                     type: number
 *                   south:
 *                     type: number
 *                   east:
 *                     type: number
 *                   west:
 *                     type: number
 *     responses:
 *       200:
 *         description: Generated fire risk map
 */
router.post('/map', [
  body('region').optional().isString(),
  body('date').optional().isISO8601(),
  body('bounds').optional().isObject()
], fireRiskController.generateRiskMap);

/**
 * @swagger
 * /api/fire-risk/historical:
 *   get:
 *     summary: Get historical fire risk data
 *     tags: [Fire Risk]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Historical fire risk data
 */
router.get('/historical', fireRiskController.getHistoricalRisk);

/**
 * @swagger
 * /api/fire-risk/hotspots:
 *   get:
 *     summary: Get current fire risk hotspots
 *     tags: [Fire Risk]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           default: uttarakhand
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: riskThreshold
 *         schema:
 *           type: number
 *           default: 0.6
 *     responses:
 *       200:
 *         description: Fire risk hotspots
 */
router.get('/hotspots', fireRiskController.getHotspots);

/**
 * @swagger
 * /api/fire-risk/analytics:
 *   get:
 *     summary: Get fire risk analytics
 *     tags: [Fire Risk]
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *           default: uttarakhand
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           default: 7d
 *         description: Analytics period (e.g., 7d, 30d)
 *     responses:
 *       200:
 *         description: Fire risk analytics data
 */
router.get('/analytics', fireRiskController.getAnalytics);

// Error handling middleware
router.use((error, req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
});

module.exports = router;
```

### 5. Python ML Interface (`python/risk_predictor.py`)

```python
#!/usr/bin/env python3
"""
Fire Risk Predictor
Interfaces with the trained Random Forest model for fire risk prediction
"""

import sys
import json
import numpy as np
import joblib
import os
from datetime import datetime

class FireRiskPredictor:
    def __init__(self, model_path='../models/anyburn_rf.joblib'):
        self.model_path = model_path
        self.model = None
        self.threshold = 0.5
        self.load_model()
    
    def load_model(self):
        """Load the trained Random Forest model"""
        try:
            if os.path.exists(self.model_path):
                model_data = joblib.load(self.model_path)
                self.model = model_data['model']
                self.threshold = model_data.get('thr', 0.5)
                return True
            else:
                print(f"Model file not found: {self.model_path}", file=sys.stderr)
                return False
        except Exception as e:
            print(f"Error loading model: {e}", file=sys.stderr)
            return False
    
    def prepare_features(self, input_features):
        """
        Prepare features for model prediction
        Expected features:
        - temperature (°C)
        - windSpeed (m/s)
        - windU, windV (m/s components)
        - ndvi (0-1)
        - elevation (m)
        - slope (degrees)
        - aspect (degrees)
        - burnHistory (boolean)
        - landCover (categorical)
        """
        
        # Feature engineering similar to training
        features = []
        
        # Dynamic features (with lag if available)
        dynamic_features = [
            input_features.get('temperature', 20.0),
            input_features.get('windU', 0.0),
            input_features.get('windV', 0.0),
            input_features.get('windSpeed', 0.0),
            input_features.get('ndvi', 0.3)
        ]
        
        # Add lag features (simplified - use current values as proxy)
        for lag in range(3):  # 3-day lag
            features.extend(dynamic_features)
        
        # Add differences (simplified)
        features.extend([0.0] * 8)  # Placeholder for difference features
        
        # Burn status
        features.append(1.0 if input_features.get('burnHistory', False) else 0.0)
        
        # Static features
        features.extend([
            input_features.get('landCover', 40),  # Default vegetation
            input_features.get('elevation', 1000),
            input_features.get('slope', 5),
            input_features.get('aspect', 180),
            input_features.get('hillshade', 200)
        ])
        
        return np.array(features).reshape(1, -1).astype(np.float32)
    
    def predict(self, input_features):
        """
        Predict fire risk for given features
        Returns: dict with risk_score, confidence, and features
        """
        if not self.model:
            raise Exception("Model not loaded")
        
        try:
            # Prepare features
            X = self.prepare_features(input_features)
            
            # Get prediction probability
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba(X)[0]
                if len(proba) == 2:
                    risk_score = proba[1]  # Probability of fire risk
                else:
                    risk_score = proba[0]
            else:
                # Fallback to decision function
                decision = self.model.decision_function(X)[0]
                risk_score = max(0, min(1, (decision + 1) / 2))  # Normalize to 0-1
            
            # Calculate confidence (simplified)
            confidence = min(0.95, max(0.6, abs(risk_score - 0.5) * 2))
            
            return {
                'risk_score': float(risk_score),
                'confidence': float(confidence),
                'threshold': float(self.threshold),
                'features': input_features,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            raise Exception(f"Prediction failed: {str(e)}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python risk_predictor.py '<features_json>'", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Parse input features
        features_json = sys.argv[1]
        features = json.loads(features_json)
        
        # Initialize predictor
        predictor = FireRiskPredictor()
        
        # Make prediction
        result = predictor.predict(features)
        
        # Output result
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'risk_score': 0.0,
            'confidence': 0.0
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()
```

---

This documentation provides the complete backend integration structure. Would you like me to continue with the Frontend Integration section next?
