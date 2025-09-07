const FireRisk = require('../models/FireRisk');
const FirePrediction = require('../models/FirePrediction');
const mlModelService = require('../services/mlModelService');

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

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
        });
      }

      // Auto-detect region from coordinates if not provided
      const detectedRegion = region || mlModelService.detectRegionFromCoordinates(lat, lng);

      // Predict fire risk using ML model with real Earth Engine data
      const prediction = await mlModelService.predictFireRiskWithRealFeatures({
        latitude: lat,
        longitude: lng
      });

      // Save to database
      const fireRisk = new FireRisk({
        region: detectedRegion,
        coordinates: {
          latitude: lat,
          longitude: lng
        },
        date: new Date(),
        riskLevel: prediction.riskLevel,
        riskScore: prediction.riskScore,
        features: prediction.features,
        metadata: {
          modelVersion: '1.0',
          confidence: prediction.confidence,
          dataQuality: 'GOOD',
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
            latitude: lat, 
            longitude: lng,
            region: detectedRegion 
          },
          features: prediction.features,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('Get current risk error:', error);
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
        const radius = centerLocation.radius || 1.0; // degrees
        
        mapBounds = {
          north: lat + radius,
          south: lat - radius,
          east: lng + radius,
          west: lng - radius
        };
      } else {
        // Default to a small area around Delhi for demo
        mapBounds = {
          north: 29.0,
          south: 28.0,
          east: 78.0,
          west: 77.0
        };
      }

      // Auto-detect region from bounds center if not provided
      const detectedRegion = region || mlModelService.detectRegionFromCoordinates(
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
          dataSource: 'ML Model Service',
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
      });

    } catch (error) {
      console.error('Generate risk map error:', error);
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
      
      // Location-based query with radius search
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const radius = 0.5; // 0.5 degree radius
        
        query['coordinates.latitude'] = { $gte: lat - radius, $lte: lat + radius };
        query['coordinates.longitude'] = { $gte: lng - radius, $lte: lng + radius };
      }

      const historicalData = await FireRisk.find(query)
        .sort({ date: -1 })
        .limit(100)
        .lean();

      res.json({
        success: true,
        data: historicalData,
        count: historicalData.length,
        metadata: {
          query: query,
          total: historicalData.length
        }
      });

    } catch (error) {
      console.error('Get historical risk error:', error);
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
      const { region, date, riskThreshold = 0.6, centerLocation } = req.query;
      
      const queryDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);

      let query = {
        date: { $gte: startOfDay, $lte: endOfDay },
        riskScore: { $gte: parseFloat(riskThreshold) }
      };

      // Add region filter if provided
      if (region) {
        query.region = region;
      }

      // Add location-based filter if centerLocation provided
      if (centerLocation) {
        try {
          const center = JSON.parse(centerLocation);
          if (center.latitude && center.longitude) {
            const radius = center.radius || 2.0; // default 2 degree radius
            query['coordinates.latitude'] = { 
              $gte: center.latitude - radius, 
              $lte: center.latitude + radius 
            };
            query['coordinates.longitude'] = { 
              $gte: center.longitude - radius, 
              $lte: center.longitude + radius 
            };
          }
        } catch (e) {
          console.warn('Invalid centerLocation parameter:', centerLocation);
        }
      }

      const hotspots = await FireRisk.find(query)
        .sort({ riskScore: -1 })
        .limit(50)
        .lean();

      const hotspotsWithAlerts = hotspots.map(spot => ({
        ...spot,
        alertLevel: spot.riskScore >= 0.8 ? 'CRITICAL' : 'HIGH',
        riskDescription: this.getRiskDescription(spot.riskScore)
      }));

      const summary = {
        totalHotspots: hotspotsWithAlerts.length,
        criticalCount: hotspotsWithAlerts.filter(h => h.alertLevel === 'CRITICAL').length,
        highCount: hotspotsWithAlerts.filter(h => h.alertLevel === 'HIGH').length,
        averageRisk: hotspotsWithAlerts.length > 0 
          ? hotspotsWithAlerts.reduce((sum, h) => sum + h.riskScore, 0) / hotspotsWithAlerts.length 
          : 0
      };

      res.json({
        success: true,
        data: hotspotsWithAlerts,
        summary: summary
      });

    } catch (error) {
      console.error('Get hotspots error:', error);
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
      const { region, period = '7' } = req.query;
      const periodDays = parseInt(period) || 7;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const matchQuery = {
        date: { $gte: startDate }
      };
      if (region) matchQuery.region = region;

      const analytics = await FireRisk.aggregate([
        { $match: matchQuery },
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
        { $sort: { "_id.date": 1 } }
      ]);

      // Process analytics data
      let processedAnalytics = this.processAnalyticsData(analytics);

      // If no data exists, create sample data for demonstration
      if (!processedAnalytics || processedAnalytics.length === 0) {
        processedAnalytics = this.generateSampleAnalytics(periodDays, region || 'Delhi');
      }

      res.json({
        success: true,
        data: processedAnalytics,
        metadata: {
          region: region || 'all',
          period: `${periodDays} days`,
          startDate,
          endDate: new Date(),
          dataSource: analytics && analytics.length > 0 ? 'database' : 'sample'
        }
      });

    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve fire risk analytics',
        error: error.message
      });
    }
  }

  /**
   * Batch prediction for multiple locations
   */
  async batchPredict(req, res) {
    try {
      const { locations } = req.body;
      
      if (!locations || !Array.isArray(locations)) {
        return res.status(400).json({
          success: false,
          message: 'Locations array is required'
        });
      }

      if (locations.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 50 locations allowed per batch'
        });
      }

      const predictions = await mlModelService.batchPredict(locations);

      // Save predictions to database
      const savePromises = predictions.map(async (pred) => {
        if (pred.error) return null; // Skip failed predictions
        
        const fireRisk = new FireRisk({
          region: mlModelService.detectRegionFromCoordinates(pred.latitude, pred.longitude),
          coordinates: {
            latitude: pred.latitude,
            longitude: pred.longitude
          },
          date: new Date(),
          riskLevel: pred.riskLevel,
          riskScore: pred.riskScore,
          features: pred.features,
          metadata: {
            modelVersion: '1.0',
            confidence: pred.confidence,
            dataQuality: 'GOOD',
            lastUpdated: new Date()
          }
        });
        
        return fireRisk.save();
      });

      await Promise.allSettled(savePromises);

      res.json({
        success: true,
        data: predictions,
        metadata: {
          totalRequested: locations.length,
          successful: predictions.filter(p => !p.error).length,
          failed: predictions.filter(p => p.error).length
        }
      });

    } catch (error) {
      console.error('Batch predict error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process batch predictions',
        error: error.message
      });
    }
  }

  /**
   * Process analytics data for frontend consumption
   */
  processAnalyticsData(rawAnalytics) {
    // Handle null or undefined input
    if (!rawAnalytics || !Array.isArray(rawAnalytics) || rawAnalytics.length === 0) {
      return [];
    }
    
    const dailyData = {};
    
    rawAnalytics.forEach(item => {
      // Ensure item and required properties exist
      if (!item || !item._id || !item._id.date || !item._id.riskLevel) {
        return;
      }
      
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
      
      dailyData[date][riskLevel] = item.count || 0;
      dailyData[date].totalPredictions += item.count || 0;
      dailyData[date].avgRiskScore += (item.avgRiskScore || 0) * (item.count || 0);
      dailyData[date].maxRiskScore = Math.max(dailyData[date].maxRiskScore, item.maxRiskScore || 0);
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
   * Generate sample analytics data for demonstration when no data exists
   */
  generateSampleAnalytics(periodDays, region) {
    const sampleData = [];
    const today = new Date();
    
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Generate realistic sample data based on region
      const riskVariation = Math.random() * 0.3 + 0.2; // 0.2 to 0.5 base risk
      const seasonalFactor = Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.2; // Seasonal variation
      const baseRisk = Math.max(0, Math.min(1, riskVariation + seasonalFactor));
      
      // Distribute across risk levels
      const lowCount = Math.floor(Math.random() * 20) + 10;
      const moderateCount = Math.floor(Math.random() * 15) + 5;
      const highCount = Math.floor(Math.random() * 10) + 2;
      const extremeCount = Math.floor(Math.random() * 3);
      
      const totalPredictions = lowCount + moderateCount + highCount + extremeCount;
      const avgRiskScore = (
        (lowCount * 0.2) + 
        (moderateCount * 0.4) + 
        (highCount * 0.7) + 
        (extremeCount * 0.9)
      ) / totalPredictions;
      
      sampleData.push({
        date: dateString,
        LOW: lowCount,
        MODERATE: moderateCount,
        HIGH: highCount,
        EXTREME: extremeCount,
        totalPredictions,
        avgRiskScore: Math.round(avgRiskScore * 1000) / 1000,
        maxRiskScore: extremeCount > 0 ? 0.95 : (highCount > 0 ? 0.8 : 0.6)
      });
    }
    
    return sampleData;
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
}

module.exports = new FireRiskController();
