/**
 * Google Earth Engine Configuration
 * Handles authentication and initialization for Google Earth Engine API
 */

const ee = require('@google/earthengine');
const fs = require('fs');
const path = require('path');

class EarthEngineConfig {
  constructor() {
    this.initialized = false;
    this.projectId = process.env.GOOGLE_EARTH_ENGINE_PROJECT_ID;
    this.serviceAccountEmail = process.env.GOOGLE_EARTH_ENGINE_SERVICE_ACCOUNT_EMAIL;
    this.privateKeyPath = process.env.GOOGLE_EARTH_ENGINE_PRIVATE_KEY_PATH;
    
    // If relative path, make it absolute from backend directory
    if (this.privateKeyPath && !path.isAbsolute(this.privateKeyPath)) {
      this.privateKeyPath = path.join(__dirname, '../../', this.privateKeyPath);
    }
  }

  /**
   * Initialize Google Earth Engine with service account authentication
   */
  async initialize() {
    try {
      if (this.initialized) {
        return true;
      }

      if (!this.projectId) {
        throw new Error('GOOGLE_EARTH_ENGINE_PROJECT_ID is not set in environment variables');
      }

      // Due to current compatibility issues with the @google/earthengine library
      // (apiBaseUrl_.replace is not a function error), we'll temporarily disable
      // real Earth Engine initialization and use synthetic data instead
      console.log('🌍 Earth Engine API is configured but library has compatibility issues');
      console.log('🌍 Using synthetic environmental data for reliable predictions');
      this.initialized = false;
      return false;

      /*
      // Commented out until library compatibility is fixed
      // Check if private key file exists
      if (!this.privateKeyPath || !fs.existsSync(this.privateKeyPath)) {
        console.warn('Google Earth Engine private key file not found. Using alternative authentication...');
        
        // Try to authenticate with environment variables
        await this.authenticateWithEnvVars();
      } else {
        // Authenticate with service account key file
        await this.authenticateWithKeyFile();
      }

      this.initialized = true;
      console.log('Google Earth Engine initialized successfully');
      return true;
      */

    } catch (error) {
      console.error('Failed to initialize Google Earth Engine:', error.message);
      
      // Always fallback to synthetic data mode
      console.log('🌍 Using synthetic environmental data for predictions');
      this.initialized = false;
      return false;
    }
  }

  /**
   * Authenticate using service account key file
   */
  async authenticateWithKeyFile() {
    const privateKey = JSON.parse(fs.readFileSync(this.privateKeyPath, 'utf8'));
    
    return new Promise((resolve, reject) => {
      ee.initialize({
        project: this.projectId,
        privateKey: privateKey,
      }, (error) => {
        if (error) {
          reject(new Error(`Earth Engine authentication failed: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Authenticate using environment variables (alternative method)
   */
  async authenticateWithEnvVars() {
    // This method can be used when private key is stored as environment variable
    const privateKeyJson = process.env.GOOGLE_EARTH_ENGINE_PRIVATE_KEY;
    
    if (!privateKeyJson) {
      throw new Error('No authentication method available. Please set either GOOGLE_EARTH_ENGINE_PRIVATE_KEY_PATH or GOOGLE_EARTH_ENGINE_PRIVATE_KEY');
    }

    const privateKey = JSON.parse(privateKeyJson);
    
    return new Promise((resolve, reject) => {
      ee.initialize({
        project: this.projectId,
        privateKey: privateKey,
      }, (error) => {
        if (error) {
          reject(new Error(`Earth Engine authentication failed: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get Earth Engine collection for satellite data
   */
  getCollection(collectionId, bounds, dateRange) {
    if (!this.initialized) {
      throw new Error('Google Earth Engine is not initialized. Call initialize() first.');
    }

    try {
      const geometry = ee.Geometry.Rectangle([
        bounds.west,
        bounds.south,
        bounds.east,
        bounds.north
      ]);

      let collection = ee.ImageCollection(collectionId)
        .filterBounds(geometry);

      if (dateRange && dateRange.start && dateRange.end) {
        collection = collection.filterDate(dateRange.start, dateRange.end);
      }

      return collection;
    } catch (error) {
      throw new Error(`Failed to get Earth Engine collection: ${error.message}`);
    }
  }

  /**
   * Extract features for fire risk prediction
   */
  async extractFeatures(bounds, date = new Date()) {
    if (!this.initialized) {
      throw new Error('Google Earth Engine is not initialized');
    }

    try {
      const geometry = ee.Geometry.Rectangle([
        bounds.west,
        bounds.south,
        bounds.east,
        bounds.north
      ]);

      // Date range for data collection (7 days before the target date)
      const endDate = new Date(date);
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 7);

      // Landsat 8 data for vegetation and surface temperature
      const landsat = this.getCollection('LANDSAT/LC08/C02/T1_L2', bounds, {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }).median();

      // MODIS data for additional vegetation indices
      const modis = this.getCollection('MODIS/006/MOD13A2', bounds, {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }).median();

      // Weather data (if available)
      const weather = this.getCollection('NOAA/GFS0P25', bounds, {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      }).median();

      // Calculate vegetation indices
      const ndvi = landsat.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI');
      const ndwi = landsat.normalizedDifference(['SR_B3', 'SR_B5']).rename('NDWI');
      
      // Surface temperature (convert from Kelvin to Celsius)
      const temperature = landsat.select('ST_B10').multiply(0.00341802).add(149.0).subtract(273.15).rename('TEMPERATURE');

      // Combine all features
      const features = ee.Image.cat([
        temperature,
        ndvi,
        ndwi,
        landsat.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7']),
        modis.select('NDVI').rename('MODIS_NDVI'),
        weather.select(['temperature_2m_above_ground', 'relative_humidity_2m_above_ground', 'u_component_of_wind_10m_above_ground', 'v_component_of_wind_10m_above_ground'])
      ]);

      // Extract features for the center point
      const centerPoint = geometry.centroid();
      
      return new Promise((resolve, reject) => {
        features.reduceRegion({
          reducer: ee.Reducer.mean(),
          geometry: centerPoint,
          scale: 30,
          maxPixels: 1e9
        }).evaluate((result, error) => {
          if (error) {
            reject(new Error(`Failed to extract features: ${error.message}`));
          } else {
            resolve(this.formatFeatures(result));
          }
        });
      });

    } catch (error) {
      throw new Error(`Feature extraction failed: ${error.message}`);
    }
  }

  /**
   * Format extracted features for ML model
   */
  formatFeatures(rawFeatures) {
    return {
      temperature: rawFeatures.TEMPERATURE || 25.0,
      humidity: rawFeatures.relative_humidity_2m_above_ground || 50.0,
      windSpeed: Math.sqrt(
        Math.pow(rawFeatures.u_component_of_wind_10m_above_ground || 0, 2) + 
        Math.pow(rawFeatures.v_component_of_wind_10m_above_ground || 0, 2)
      ),
      precipitation: 0, // Add precipitation data if available
      vegetationIndex: rawFeatures.NDVI || 0.3,
      soilMoisture: rawFeatures.NDWI || 0.1,
      elevation: 0, // Add elevation data if needed
      slope: 0, // Add slope data if needed
      // Spectral bands
      blue: rawFeatures.SR_B1 || 0,
      green: rawFeatures.SR_B2 || 0,
      red: rawFeatures.SR_B3 || 0,
      nir: rawFeatures.SR_B4 || 0,
      swir1: rawFeatures.SR_B5 || 0,
      swir2: rawFeatures.SR_B6 || 0,
      // Additional indices
      modisNdvi: rawFeatures.MODIS_NDVI || rawFeatures.NDVI || 0.3
    };
  }

  /**
   * Check if Earth Engine is properly configured
   */
  isConfigured() {
    return !!(this.projectId && (this.privateKeyPath || process.env.GOOGLE_EARTH_ENGINE_PRIVATE_KEY));
  }

  /**
   * Get configuration status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      configured: this.isConfigured(),
      projectId: this.projectId,
      hasServiceAccount: !!this.serviceAccountEmail,
      hasPrivateKey: !!(this.privateKeyPath && fs.existsSync(this.privateKeyPath)) || !!process.env.GOOGLE_EARTH_ENGINE_PRIVATE_KEY
    };
  }
}

module.exports = new EarthEngineConfig();
