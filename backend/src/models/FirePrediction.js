const mongoose = require('mongoose');

const firePredictionSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
    index: true
  },
  predictionDate: {
    type: Date,
    required: true,
    index: true
  },
  horizon: {
    type: Number,
    default: 1, // Days ahead
    min: 1,
    max: 7
  },
  gridData: {
    resolution: {
      type: Number,
      default: 500 // meters
    },
    bounds: {
      north: { type: Number, required: true },
      south: { type: Number, required: true },
      east: { type: Number, required: true },
      west: { type: Number, required: true }
    },
    riskGrid: [[Number]], // 2D array of risk scores
    dimensions: {
      rows: { type: Number, required: true },
      cols: { type: Number, required: true }
    }
  },
  summary: {
    totalCells: Number,
    highRiskCells: Number,
    averageRisk: Number,
    maxRisk: Number,
    minRisk: Number,
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
    dataSource: {
      type: String,
      default: 'Google Earth Engine'
    },
    modelVersion: {
      type: String,
      default: '1.0'
    },
    status: {
      type: String,
      enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PROCESSING'
    },
    errorMessage: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
firePredictionSchema.index({ region: 1, predictionDate: -1 });
firePredictionSchema.index({ 'processingInfo.status': 1 });
firePredictionSchema.index({ createdAt: -1 });

// TTL index to automatically remove old predictions (after 30 days)
firePredictionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('FirePrediction', firePredictionSchema);
