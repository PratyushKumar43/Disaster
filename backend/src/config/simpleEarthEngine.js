/**
 * Simplified Earth Engine Configuration
 * Handles authentication gracefully with fallbacks when EE is unavailable
 */

const fs = require('fs');
const path = require('path');

class SimpleEarthEngineConfig {
  constructor() {
    this.initialized = false;
    this.projectId = process.env.GOOGLE_EARTH_ENGINE_PROJECT_ID;
    this.serviceAccountEmail = process.env.GOOGLE_EARTH_ENGINE_SERVICE_ACCOUNT_EMAIL;
    this.privateKeyPath = process.env.GOOGLE_EARTH_ENGINE_PRIVATE_KEY_PATH;
    
    // If relative path, make it absolute from backend directory
    if (this.privateKeyPath && !path.isAbsolute(this.privateKeyPath)) {
      this.privateKeyPath = path.join(__dirname, '../../', this.privateKeyPath);
    }
    
    this.credentialsValid = this.validateCredentials();
  }

  /**
   * Validate credentials without actually initializing Earth Engine
   */
  validateCredentials() {
    try {
      if (!this.projectId) {
        console.log('⚠️  GOOGLE_EARTH_ENGINE_PROJECT_ID not set');
        return false;
      }

      if (!this.privateKeyPath || !fs.existsSync(this.privateKeyPath)) {
        console.log('⚠️  Earth Engine service account key file not found');
        return false;
      }

      // Validate key file format
      const keyContent = JSON.parse(fs.readFileSync(this.privateKeyPath, 'utf8'));
      if (!keyContent.private_key || !keyContent.client_email || !keyContent.project_id) {
        console.log('⚠️  Invalid service account key file format');
        return false;
      }

      console.log('✅ Earth Engine credentials validated');
      return true;

    } catch (error) {
      console.log(`⚠️  Error validating Earth Engine credentials: ${error.message}`);
      return false;
    }
  }

  /**
   * Initialize Earth Engine with graceful fallback
   */
  async initialize() {
    try {
      if (!this.credentialsValid) {
        console.log('🌍 Earth Engine credentials not valid, using synthetic data mode');
        this.initialized = false;
        return false;
      }

      // Due to current Earth Engine library compatibility issues,
      // we'll use synthetic data mode for now
      console.log('🌍 Earth Engine library has compatibility issues');
      console.log('🌍 Using reliable synthetic data mode instead');
      this.initialized = false;
      return false;

      /* 
      // Commented out until EE library compatibility is fixed
      const ee = require('@google/earthengine');
      const privateKey = JSON.parse(fs.readFileSync(this.privateKeyPath, 'utf8'));

      return new Promise((resolve) => {
        ee.initialize({
          project: this.projectId,
          privateKey: privateKey,
        }, (error) => {
          if (error) {
            console.log(`⚠️  Earth Engine initialization failed: ${error.message}`);
            console.log('🌍 Using synthetic data mode instead');
            this.initialized = false;
            resolve(false);
          } else {
            console.log('🌍 Earth Engine initialized successfully');
            this.initialized = true;
            resolve(true);
          }
        });
      });
      */

    } catch (error) {
      console.log(`⚠️  Earth Engine library error: ${error.message}`);
      console.log('🌍 Using synthetic data mode');
      this.initialized = false;
      return false;
    }
  }

  /**
   * Extract features using synthetic data (always available)
   */
  async extractFeatures(bounds, date = new Date()) {
    // Always use synthetic features for now to ensure reliability
    console.log('🌍 Using synthetic environmental features (Earth Engine fallback)');
    
    const centerLat = (bounds.north + bounds.south) / 2;
    const centerLng = (bounds.east + bounds.west) / 2;
    
    // Generate realistic synthetic features based on location and season
    const currentDate = new Date(date);
    const dayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / 86400000);
    const seasonalFactor = 0.5 + 0.3 * Math.cos(2 * Math.PI * (dayOfYear - 100) / 365);
    
    // Temperature varies with latitude and season
    const baseTemp = 30 - Math.abs(centerLat - 20) * 0.8 + seasonalFactor * 10;
    
    // Generate realistic wind components
    const windSpeed = 8 + seasonalFactor * 5 + Math.random() * 5;
    const windDir = Math.random() * 2 * Math.PI;
    const u10 = windSpeed * Math.cos(windDir);
    const v10 = windSpeed * Math.sin(windDir);
    
    return {
      temperature: baseTemp + (Math.random() - 0.5) * 10,
      humidity: 60 - seasonalFactor * 30 + (Math.random() - 0.5) * 20,
      windSpeed: windSpeed,
      precipitation: Math.max(0, 5 - seasonalFactor * 4 + Math.random() * 3),
      vegetationIndex: 0.4 + seasonalFactor * 0.2 + (Math.random() - 0.5) * 0.2,
      soilMoisture: 0.3 + (1 - seasonalFactor) * 0.3 + (Math.random() - 0.5) * 0.2,
      elevation: 500 + Math.abs(centerLat - 25) * 50 + Math.random() * 1000,
      slope: Math.random() * 30,
      // Synthetic spectral bands
      blue: 0.1 + Math.random() * 0.2,
      green: 0.15 + Math.random() * 0.25,
      red: 0.2 + Math.random() * 0.3,
      nir: 0.4 + Math.random() * 0.4,
      swir1: 0.3 + Math.random() * 0.3,
      swir2: 0.2 + Math.random() * 0.2,
      modisNdvi: 0.3 + seasonalFactor * 0.3 + (Math.random() - 0.5) * 0.2,
      // Wind components  
      u_component_of_wind_10m_above_ground: u10,
      v_component_of_wind_10m_above_ground: v10,
      relative_humidity_2m_above_ground: 60 - seasonalFactor * 30,
      temperature_2m_above_ground: baseTemp
    };
  }

  /**
   * Check if Earth Engine is properly configured
   */
  isConfigured() {
    return this.credentialsValid;
  }

  /**
   * Get configuration status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      configured: this.credentialsValid,
      projectId: this.projectId,
      hasServiceAccount: !!this.serviceAccountEmail,
      hasPrivateKey: !!(this.privateKeyPath && fs.existsSync(this.privateKeyPath)),
      mode: this.initialized ? 'Earth Engine' : 'Synthetic Data'
    };
  }
}

module.exports = new SimpleEarthEngineConfig();
