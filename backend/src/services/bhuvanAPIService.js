const axios = require('axios');
const { logger } = require('../config/database');

class BhuvanAPIService {
  constructor() {
    this.baseURL = process.env.BHUVAN_API_BASE_URL || 'https://bhuvan-app1.nrsc.gov.in/bhuvan/';
    this.wmsURL = process.env.BHUVAN_WMS_URL || 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms';
    this.accessToken = process.env.BHUVAN_ACCESS_TOKEN;
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Disaster-Management-System/1.0'
      }
    });

    if (!this.accessToken) {
      logger.warn('Bhuvan API access token not configured. Some features may not work.');
    }
  }

  /**
   * Get forest fire hotspots from Bhuvan API
   */
  async getForestFireHotspots(params = {}) {
    try {
      const {
        minLat = 8.0,
        maxLat = 37.0,
        minLon = 68.0,
        maxLon = 97.0,
        startDate,
        endDate
      } = params;

      const requestParams = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typename: process.env.BHUVAN_FOREST_FIRE_LAYER || 'forest_fire_alerts',
        outputformat: 'application/json',
        bbox: `${minLon},${minLat},${maxLon},${maxLat}`,
        srsname: 'EPSG:4326'
      };

      if (this.accessToken) {
        requestParams.access_token = this.accessToken;
      }

      if (startDate && endDate) {
        requestParams.cql_filter = `detection_date BETWEEN '${startDate}' AND '${endDate}'`;
      }

      const response = await this.axiosInstance.get(this.wmsURL, {
        params: requestParams
      });

      return this.processFireHotspots(response.data);
    } catch (error) {
      logger.error('Error fetching Bhuvan fire hotspots:', error.message);
      return this.getMockFireHotspots(params);
    }
  }

  /**
   * Get vegetation indices from Bhuvan
   */
  async getVegetationIndex(latitude, longitude, radius = 0.01) {
    try {
      const bbox = `${longitude - radius},${latitude - radius},${longitude + radius},${latitude + radius}`;
      
      const params = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typename: process.env.BHUVAN_VEGETATION_LAYER || 'modis_ndvi',
        outputformat: 'application/json',
        bbox: bbox,
        srsname: 'EPSG:4326'
      };

      if (this.accessToken) {
        params.access_token = this.accessToken;
      }

      const response = await this.axiosInstance.get(this.wmsURL, {
        params
      });

      return this.processVegetationData(response.data, latitude, longitude);
    } catch (error) {
      logger.error('Error fetching vegetation index:', error.message);
      return this.getMockVegetationIndex();
    }
  }

  /**
   * Get land use/land cover data from Bhuvan
   */
  async getLandCoverData(latitude, longitude, radius = 0.01) {
    try {
      const bbox = `${longitude - radius},${latitude - radius},${longitude + radius},${latitude + radius}`;
      
      const params = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typename: process.env.BHUVAN_LAND_COVER_LAYER || 'lulc_2018',
        outputformat: 'application/json',
        bbox: bbox,
        srsname: 'EPSG:4326'
      };

      if (this.accessToken) {
        params.access_token = this.accessToken;
      }

      const response = await this.axiosInstance.get(this.wmsURL, {
        params
      });

      return this.processLandCoverData(response.data);
    } catch (error) {
      logger.error('Error fetching land cover data:', error.message);
      return this.getMockLandCoverData();
    }
  }

  /**
   * Get fire spread simulation data
   */
  async getFireSpreadSimulation(params = {}) {
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
      } = params;

      // Get vegetation and land cover data for the area
      const [vegetationData, landCoverData] = await Promise.all([
        this.getVegetationIndex(startLat, startLon, 0.05),
        this.getLandCoverData(startLat, startLon, 0.05)
      ]);

      // Simulate fire spread using environmental data
      const fireSpread = this.simulateFireSpread({
        startLat,
        startLon,
        windSpeed,
        windDirection,
        temperature,
        humidity,
        fuelMoisture,
        vegetationData,
        landCoverData,
        simulationHours
      });

      return {
        success: true,
        data: {
          initialLocation: { latitude: startLat, longitude: startLon },
          simulationParameters: {
            windSpeed,
            windDirection,
            temperature,
            humidity,
            fuelMoisture,
            simulationHours
          },
          fireSpread,
          environmentalData: {
            vegetation: vegetationData,
            landCover: landCoverData
          },
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error generating fire spread simulation:', error.message);
      throw error;
    }
  }

  /**
   * Process fire hotspots data from Bhuvan response
   */
  processFireHotspots(data) {
    try {
      if (!data || !data.features) {
        return [];
      }

      return data.features.map(feature => ({
        id: feature.id || `hotspot_${Math.random().toString(36).substr(2, 9)}`,
        coordinates: {
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0]
        },
        properties: {
          confidence: feature.properties.confidence || Math.random() * 100,
          brightness: feature.properties.brightness || Math.random() * 400 + 300,
          detectionDate: feature.properties.detection_date || new Date().toISOString(),
          satellite: feature.properties.satellite || 'MODIS',
          fireRadiativePower: feature.properties.frp || Math.random() * 100
        },
        riskLevel: this.calculateRiskLevel(feature.properties.confidence || 75),
        source: 'Bhuvan-ISRO'
      }));
    } catch (error) {
      logger.error('Error processing fire hotspots:', error.message);
      return [];
    }
  }

  /**
   * Process vegetation data from Bhuvan response
   */
  processVegetationData(data, targetLat, targetLon) {
    try {
      if (!data || !data.features || data.features.length === 0) {
        return this.getMockVegetationIndex();
      }

      // Find the closest feature to target coordinates
      let closestFeature = data.features[0];
      let minDistance = this.calculateDistance(
        targetLat, 
        targetLon, 
        closestFeature.geometry.coordinates[1], 
        closestFeature.geometry.coordinates[0]
      );

      data.features.forEach(feature => {
        const distance = this.calculateDistance(
          targetLat, 
          targetLon, 
          feature.geometry.coordinates[1], 
          feature.geometry.coordinates[0]
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestFeature = feature;
        }
      });

      return {
        ndvi: closestFeature.properties.ndvi || Math.random() * 0.8 + 0.1,
        evi: closestFeature.properties.evi || Math.random() * 0.6 + 0.2,
        vegetationType: this.classifyVegetationType(closestFeature.properties.ndvi || 0.5),
        distance: minDistance,
        source: 'Bhuvan-MODIS'
      };
    } catch (error) {
      logger.error('Error processing vegetation data:', error.message);
      return this.getMockVegetationIndex();
    }
  }

  /**
   * Process land cover data from Bhuvan response
   */
  processLandCoverData(data) {
    try {
      if (!data || !data.features || data.features.length === 0) {
        return this.getMockLandCoverData();
      }

      const landCoverTypes = {};
      data.features.forEach(feature => {
        const landCover = feature.properties.lulc_class || 'Unknown';
        landCoverTypes[landCover] = (landCoverTypes[landCover] || 0) + 1;
      });

      const dominantLandCover = Object.keys(landCoverTypes).reduce((a, b) => 
        landCoverTypes[a] > landCoverTypes[b] ? a : b
      );

      return {
        dominantType: dominantLandCover,
        distribution: landCoverTypes,
        fuelLoad: this.estimateFuelLoad(dominantLandCover),
        burnProbability: this.estimateBurnProbability(dominantLandCover),
        source: 'Bhuvan-LULC'
      };
    } catch (error) {
      logger.error('Error processing land cover data:', error.message);
      return this.getMockLandCoverData();
    }
  }

  /**
   * Simulate fire spread based on environmental conditions
   */
  simulateFireSpread(params) {
    const { startLat, startLon, windSpeed, windDirection, temperature, humidity, simulationHours } = params;
    
    const spreadRate = this.calculateSpreadRate(windSpeed, temperature, humidity);
    const firePerimeter = [];
    const hourlyProgression = [];

    for (let hour = 0; hour <= simulationHours; hour++) {
      const radius = spreadRate * hour; // km
      const perimeter = this.generateFirePerimeter(startLat, startLon, radius, windDirection, windSpeed);
      
      firePerimeter.push({
        hour,
        radius,
        perimeter,
        area: Math.PI * radius * radius,
        intensity: this.calculateFireIntensity(hour, windSpeed, temperature)
      });

      if (hour % 4 === 0 || hour === simulationHours) {
        hourlyProgression.push({
          hour,
          center: { latitude: startLat, longitude: startLon },
          radius,
          area: Math.PI * radius * radius,
          perimeter: perimeter.length
        });
      }
    }

    return {
      spreadRate,
      firePerimeter,
      hourlyProgression,
      totalArea: Math.PI * (spreadRate * simulationHours) * (spreadRate * simulationHours),
      peakIntensity: Math.max(...firePerimeter.map(f => f.intensity))
    };
  }

  /**
   * Helper methods
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  calculateRiskLevel(confidence) {
    if (confidence >= 80) return 'EXTREME';
    if (confidence >= 65) return 'HIGH';
    if (confidence >= 40) return 'MODERATE';
    return 'LOW';
  }

  classifyVegetationType(ndvi) {
    if (ndvi > 0.6) return 'Dense Forest';
    if (ndvi > 0.4) return 'Moderate Forest';
    if (ndvi > 0.2) return 'Grassland';
    return 'Sparse Vegetation';
  }

  estimateFuelLoad(landCoverType) {
    const fuelLoads = {
      'Dense Forest': 25,
      'Open Forest': 15,
      'Scrubland': 8,
      'Grassland': 3,
      'Agricultural': 5,
      'Built-up': 0
    };
    return fuelLoads[landCoverType] || 10;
  }

  estimateBurnProbability(landCoverType) {
    const burnProbs = {
      'Dense Forest': 0.8,
      'Open Forest': 0.9,
      'Scrubland': 0.7,
      'Grassland': 0.6,
      'Agricultural': 0.3,
      'Built-up': 0.1
    };
    return burnProbs[landCoverType] || 0.5;
  }

  calculateSpreadRate(windSpeed, temperature, humidity) {
    // Simplified fire spread rate calculation (km/hour)
    const baseRate = 0.5; // km/hour
    const windFactor = Math.min(windSpeed / 20, 2); // Wind effect
    const tempFactor = Math.max(temperature - 20, 0) / 20; // Temperature effect
    const humidityFactor = Math.max(100 - humidity, 0) / 100; // Humidity effect
    
    return baseRate * (1 + windFactor + tempFactor + humidityFactor);
  }

  calculateFireIntensity(hour, windSpeed, temperature) {
    const baseIntensity = 1000; // kW/m
    const timeFactor = Math.min(hour / 12, 1); // Peak at 12 hours
    const windFactor = windSpeed / 10;
    const tempFactor = temperature / 30;
    
    return baseIntensity * timeFactor * windFactor * tempFactor;
  }

  generateFirePerimeter(centerLat, centerLon, radius, windDirection, windSpeed) {
    const points = [];
    const numPoints = 36;
    const windEffect = Math.min(windSpeed / 20, 0.5); // Max 50% elongation
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 360 / numPoints) * Math.PI / 180;
      
      // Adjust radius based on wind direction
      const relativeAngle = angle - (windDirection * Math.PI / 180);
      const adjustedRadius = radius * (1 + windEffect * Math.cos(relativeAngle));
      
      const lat = centerLat + (adjustedRadius / 111) * Math.cos(angle);
      const lon = centerLon + (adjustedRadius / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
      
      points.push({ latitude: lat, longitude: lon });
    }
    
    return points;
  }

  /**
   * Mock data methods for fallback
   */
  getMockFireHotspots(params) {
    const { minLat = 20, maxLat = 30, minLon = 75, maxLon = 85 } = params;
    const hotspots = [];
    
    for (let i = 0; i < 10; i++) {
      hotspots.push({
        id: `mock_hotspot_${i}`,
        coordinates: {
          latitude: minLat + Math.random() * (maxLat - minLat),
          longitude: minLon + Math.random() * (maxLon - minLon)
        },
        properties: {
          confidence: 60 + Math.random() * 40,
          brightness: 300 + Math.random() * 200,
          detectionDate: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          satellite: 'MODIS',
          fireRadiativePower: Math.random() * 100
        },
        riskLevel: ['LOW', 'MODERATE', 'HIGH', 'EXTREME'][Math.floor(Math.random() * 4)],
        source: 'Mock Data'
      });
    }
    
    return hotspots;
  }

  getMockVegetationIndex() {
    return {
      ndvi: 0.3 + Math.random() * 0.5,
      evi: 0.2 + Math.random() * 0.4,
      vegetationType: ['Dense Forest', 'Moderate Forest', 'Grassland', 'Sparse Vegetation'][Math.floor(Math.random() * 4)],
      distance: 0,
      source: 'Mock Data'
    };
  }

  getMockLandCoverData() {
    const landCoverTypes = ['Dense Forest', 'Open Forest', 'Scrubland', 'Grassland'];
    const dominantType = landCoverTypes[Math.floor(Math.random() * landCoverTypes.length)];
    
    return {
      dominantType,
      distribution: { [dominantType]: 75, 'Other': 25 },
      fuelLoad: this.estimateFuelLoad(dominantType),
      burnProbability: this.estimateBurnProbability(dominantType),
      source: 'Mock Data'
    };
  }

  /**
   * Get satellite imagery for a region
   */
  async getSatelliteImagery(params = {}) {
    try {
      const {
        minLat,
        maxLat,
        minLon,
        maxLon,
        layers = ['satellite'],
        format = 'image/png',
        width = 512,
        height = 512
      } = params;

      // Construct WMS request for satellite imagery
      const wmsParams = {
        SERVICE: 'WMS',
        VERSION: '1.1.1',
        REQUEST: 'GetMap',
        LAYERS: layers.join(','),
        STYLES: '',
        SRS: 'EPSG:4326',
        BBOX: `${minLon},${minLat},${maxLon},${maxLat}`,
        WIDTH: width.toString(),
        HEIGHT: height.toString(),
        FORMAT: format
      };

      const response = await axios.get(process.env.BHUVAN_WMS_URL, {
        params: wmsParams,
        headers: {
          'Authorization': `Bearer ${process.env.BHUVAN_API_TOKEN}`,
          'User-Agent': 'DisasterApp/1.0'
        },
        responseType: 'arraybuffer',
        timeout: 15000
      });

      return {
        imageData: response.data,
        format,
        bounds: { minLat, maxLat, minLon, maxLon },
        dimensions: { width, height },
        source: 'Bhuvan WMS'
      };
    } catch (error) {
      logger.error('Error fetching satellite imagery:', error.message);
      return this.getMockSatelliteImagery(params);
    }
  }

  /**
   * Get disaster alerts from Bhuvan
   */
  async getDisasterAlerts(params = {}) {
    try {
      const {
        minLat = 8.0,
        maxLat = 37.0,
        minLon = 68.0,
        maxLon = 97.0,
        alertTypes = ['fire', 'flood', 'cyclone'],
        severity = 'all'
      } = params;

      // Query disaster alerts API
      const alertParams = {
        bbox: `${minLon},${minLat},${maxLon},${maxLat}`,
        types: alertTypes.join(','),
        severity,
        format: 'json'
      };

      const response = await axios.get(`${process.env.BHUVAN_API_BASE_URL}alerts`, {
        params: alertParams,
        headers: {
          'Authorization': `Bearer ${process.env.BHUVAN_API_TOKEN}`,
          'User-Agent': 'DisasterApp/1.0'
        },
        timeout: 10000
      });

      return this.processDisasterAlerts(response.data);
    } catch (error) {
      logger.error('Error fetching disaster alerts:', error.message);
      return this.getMockDisasterAlerts(params);
    }
  }

  /**
   * Process disaster alerts response
   */
  processDisasterAlerts(data) {
    const alerts = [];
    
    if (data && data.features) {
      data.features.forEach(feature => {
        if (feature.geometry && feature.properties) {
          alerts.push({
            id: feature.properties.id || Date.now().toString(),
            type: feature.properties.type || 'unknown',
            severity: feature.properties.severity || 'medium',
            coordinates: {
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0]
            },
            title: feature.properties.title || 'Disaster Alert',
            description: feature.properties.description || 'No description available',
            issuedAt: feature.properties.issued_at || new Date().toISOString(),
            expiresAt: feature.properties.expires_at,
            source: 'Bhuvan API'
          });
        }
      });
    }

    return alerts;
  }

  /**
   * Generate mock satellite imagery data
   */
  getMockSatelliteImagery(params) {
    return {
      imageData: null, // Would contain actual image buffer
      format: 'image/png',
      bounds: {
        minLat: params.minLat || 28.0,
        maxLat: params.maxLat || 29.0,
        minLon: params.minLon || 77.0,
        maxLon: params.maxLon || 78.0
      },
      dimensions: {
        width: params.width || 512,
        height: params.height || 512
      },
      source: 'Mock Data',
      note: 'Satellite imagery not available - using mock data'
    };
  }

  /**
   * Generate mock disaster alerts
   */
  getMockDisasterAlerts(params) {
    const alertTypes = ['fire', 'flood', 'cyclone', 'earthquake'];
    const severities = ['low', 'medium', 'high', 'critical'];
    
    const alerts = [];
    const numAlerts = Math.floor(Math.random() * 5) + 1; // 1-5 alerts
    
    for (let i = 0; i < numAlerts; i++) {
      alerts.push({
        id: `mock_alert_${Date.now()}_${i}`,
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        coordinates: {
          latitude: (params.minLat || 8) + Math.random() * ((params.maxLat || 37) - (params.minLat || 8)),
          longitude: (params.minLon || 68) + Math.random() * ((params.maxLon || 97) - (params.minLon || 68))
        },
        title: 'Mock Disaster Alert',
        description: 'This is a mock disaster alert for testing purposes',
        issuedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(),
        source: 'Mock Data'
      });
    }
    
    return alerts;
  }
}

module.exports = new BhuvanAPIService();
