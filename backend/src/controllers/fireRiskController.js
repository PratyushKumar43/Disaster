const bhuvanAPIService = require('../services/bhuvanAPIService');
const { logger } = require('../config/database');

/**
 * Fire Risk Controller
 * Handles fire risk prediction and analysis using Bhuvan API
 */

/**
 * Get current fire risk for a location
 */
const getCurrentFireRisk = async (req, res) => {
  try {
    const { latitude, longitude, region } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values'
      });
    }

    logger.info(`Getting fire risk for coordinates: ${lat}, ${lon}`);

    // Get environmental data from Bhuvan
    const [vegetationData, landCoverData] = await Promise.all([
      bhuvanAPIService.getVegetationIndex(lat, lon),
      bhuvanAPIService.getLandCoverData(lat, lon)
    ]);

    // Calculate fire risk based on environmental factors
    const riskAssessment = calculateFireRisk({
      vegetation: vegetationData,
      landCover: landCoverData,
      location: { latitude: lat, longitude: lon, region }
    });

    res.status(200).json({
      success: true,
      data: {
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        confidence: riskAssessment.confidence,
        location: {
          latitude: lat,
          longitude: lon,
          region: region || 'Unknown'
        },
        features: {
          vegetationIndex: vegetationData.ndvi,
          vegetationType: vegetationData.vegetationType,
          landCoverType: landCoverData.dominantType,
          fuelLoad: landCoverData.fuelLoad,
          burnProbability: landCoverData.burnProbability
        },
        environmentalData: {
          vegetation: vegetationData,
          landCover: landCoverData
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error getting current fire risk:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fire risk prediction',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get fire hotspots from Bhuvan API
 */
const getFireHotspots = async (req, res) => {
  try {
    const {
      minLat,
      maxLat,
      minLon,
      maxLon,
      centerLat,
      centerLon,
      radius = 50, // km
      startDate,
      endDate,
      riskThreshold = 0.6
    } = req.query;

    let bounds = {};

    if (centerLat && centerLon) {
      // Convert radius from km to degrees (approximate)
      const radiusDeg = parseFloat(radius) / 111; // 1 degree ≈ 111 km
      const lat = parseFloat(centerLat);
      const lon = parseFloat(centerLon);
      
      bounds = {
        minLat: lat - radiusDeg,
        maxLat: lat + radiusDeg,
        minLon: lon - radiusDeg,
        maxLon: lon + radiusDeg
      };
    } else if (minLat && maxLat && minLon && maxLon) {
      bounds = { minLat, maxLat, minLon, maxLon };
    } else {
      // Default to India bounds
      bounds = {
        minLat: 8.0,
        maxLat: 37.0,
        minLon: 68.0,
        maxLon: 97.0
      };
    }

    logger.info(`Getting fire hotspots for bounds:`, bounds);

    const hotspots = await bhuvanAPIService.getForestFireHotspots({
      ...bounds,
      startDate,
      endDate
    });

    // Filter by risk threshold if provided
    const filteredHotspots = hotspots.filter(hotspot => {
      const riskScore = mapRiskLevelToScore(hotspot.riskLevel);
      return riskScore >= parseFloat(riskThreshold);
    });

    res.status(200).json({
      success: true,
      data: {
        hotspots: filteredHotspots,
        count: filteredHotspots.length,
        bounds,
        filters: {
          riskThreshold,
          dateRange: startDate && endDate ? { startDate, endDate } : null
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error getting fire hotspots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fire hotspots',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate fire spread simulation
 */
const generateFireSpreadSimulation = async (req, res) => {
  try {
    const {
      startLat,
      startLon,
      windSpeed = 10,
      windDirection = 0,
      temperature = 30,
      humidity = 40,
      fuelMoisture = 10,
      simulationHours = 24
    } = req.body;

    if (!startLat || !startLon) {
      return res.status(400).json({
        success: false,
        message: 'Starting latitude and longitude are required'
      });
    }

    logger.info(`Generating fire spread simulation starting at: ${startLat}, ${startLon}`);

    const simulation = await bhuvanAPIService.getFireSpreadSimulation({
      startLat: parseFloat(startLat),
      startLon: parseFloat(startLon),
      windSpeed: parseFloat(windSpeed),
      windDirection: parseFloat(windDirection),
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity),
      fuelMoisture: parseFloat(fuelMoisture),
      simulationHours: parseInt(simulationHours)
    });

    res.status(200).json(simulation);

  } catch (error) {
    logger.error('Error generating fire spread simulation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate fire spread simulation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get fire risk analytics for a region
 */
const getFireRiskAnalytics = async (req, res) => {
  try {
    const { region, days = 7 } = req.query;

    if (!region) {
      return res.status(400).json({
        success: false,
        message: 'Region parameter is required'
      });
    }

    logger.info(`Getting fire risk analytics for region: ${region}, days: ${days}`);

    // Generate mock analytics data - in production, this would query historical data
    const analytics = generateAnalyticsData(region, parseInt(days));

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    logger.error('Error getting fire risk analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fire risk analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to calculate fire risk
 */
function calculateFireRisk({ vegetation, landCover, location }) {
  let riskScore = 0;
  let confidence = 0.85;

  // Vegetation factor (30% weight)
  const vegetationRisk = (1 - vegetation.ndvi) * 0.3; // Lower NDVI = higher risk
  riskScore += vegetationRisk * 3;

  // Land cover factor (25% weight)
  const landCoverRisk = landCover.burnProbability * 0.25;
  riskScore += landCoverRisk * 4;

  // Fuel load factor (25% weight)
  const fuelLoadRisk = Math.min(landCover.fuelLoad / 25, 1) * 0.25;
  riskScore += fuelLoadRisk * 4;

  // Environmental factors (20% weight)
  const environmentalRisk = 0.2; // Base environmental risk
  riskScore += environmentalRisk * 4;

  // Normalize to 0-10 scale
  riskScore = Math.min(Math.max(riskScore, 0), 10);

  // Determine risk level
  let riskLevel = 'LOW';
  if (riskScore >= 8) riskLevel = 'EXTREME';
  else if (riskScore >= 6) riskLevel = 'HIGH';
  else if (riskScore >= 4) riskLevel = 'MODERATE';

  // Adjust confidence based on data quality
  if (vegetation.source === 'Mock Data' || landCover.source === 'Mock Data') {
    confidence *= 0.7;
  }

  return {
    riskScore: Math.round(riskScore * 10) / 10,
    riskLevel,
    confidence: Math.round(confidence * 100) / 100
  };
}

/**
 * Helper function to map risk level to numeric score
 */
function mapRiskLevelToScore(riskLevel) {
  const scoreMap = {
    'LOW': 0.25,
    'MODERATE': 0.5,
    'HIGH': 0.75,
    'EXTREME': 1.0
  };
  return scoreMap[riskLevel] || 0.25;
}

/**
 * Helper function to generate analytics data
 */
function generateAnalyticsData(region, days) {
  const analytics = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    
    analytics.push({
      date: date.toISOString().split('T')[0],
      region,
      avgRiskScore: 3.5 + Math.random() * 3, // 3.5 - 6.5
      maxRiskScore: 5.0 + Math.random() * 4, // 5.0 - 9.0
      minRiskScore: 1.0 + Math.random() * 2, // 1.0 - 3.0
      totalPredictions: Math.floor(Math.random() * 50) + 20, // 20-70
      hotspotCount: Math.floor(Math.random() * 10) + 1, // 1-10
      riskDistribution: {
        LOW: Math.floor(Math.random() * 30) + 20,
        MODERATE: Math.floor(Math.random() * 30) + 25,
        HIGH: Math.floor(Math.random() * 20) + 15,
        EXTREME: Math.floor(Math.random() * 10) + 5
      }
    });
  }

  return analytics;
}

module.exports = {
  getCurrentFireRisk,
  getFireHotspots,
  generateFireSpreadSimulation,
  getFireRiskAnalytics
};
