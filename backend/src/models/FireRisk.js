const mongoose = require('mongoose');

const fireRiskSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    index: true
  },
  coordinates: {
    latitude: { 
      type: Number, 
      required: true,
      min: -90,
      max: 90
    },
    longitude: { 
      type: Number, 
      required: true,
      min: -180,
      max: 180
    },
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
    modelVersion: {
      type: String,
      default: '1.0'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    dataQuality: {
      type: String,
      enum: ['POOR', 'FAIR', 'GOOD', 'EXCELLENT'],
      default: 'GOOD'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
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
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
fireRiskSchema.index({ region: 1, date: -1 });
fireRiskSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
fireRiskSchema.index({ riskLevel: 1, date: -1 });
fireRiskSchema.index({ riskScore: -1 });
fireRiskSchema.index({ createdAt: -1 });

// Compound index for location-based queries
fireRiskSchema.index({ 
  'coordinates.latitude': '2dsphere',
  'coordinates.longitude': '2dsphere' 
});

module.exports = mongoose.model('FireRisk', fireRiskSchema);
