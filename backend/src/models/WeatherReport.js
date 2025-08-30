const mongoose = require('mongoose');

const weatherReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  location: {
    name: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function(coordinates) {
            return coordinates.length === 2 && 
                   coordinates[1] >= -90 && coordinates[1] <= 90 && 
                   coordinates[0] >= -180 && coordinates[0] <= 180;
          },
          message: 'Invalid coordinates provided'
        }
      }
    },
    latitude: Number,
    longitude: Number,
    state: String,
    district: String,
    country: String
  },
  
  reportData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  format: {
    type: String,
    enum: ['json', 'pdf', 'excel', 'html'],
    default: 'json'
  },
  
  type: {
    type: String,
    default: 'comprehensive'
  },
  
  language: {
    type: String,
    enum: ['en', 'hi'],
    default: 'en'
  },
  
  options: {
    includeAlerts: {
      type: Boolean,
      default: true
    },
    includeForecast: {
      type: Boolean,
      default: true
    },
    forecastDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 14
    }
  },
  
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  dataSource: {
    provider: String,
    lastUpdated: Date,
    generationTime: Number,
    timezone: String
  },
  
  summary: {
    totalAlerts: {
      type: Number,
      default: 0
    },
    activeAlerts: {
      type: Number,
      default: 0
    },
    currentTemperature: Number,
    weatherCondition: String,
    forecastDays: Number
  },
  
  fileInfo: {
    filename: String,
    filepath: String,
    size: Number,
    mimeType: String
  },
  
  tags: [String],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  accessCount: {
    type: Number,
    default: 0
  },
  
  lastAccessed: Date,
  
  expiresAt: {
    type: Date,
    default: function() {
      // Reports expire after 30 days by default
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true,
  collection: 'weather_reports'
});

// Indexes for efficient queries
weatherReportSchema.index({ 'location.coordinates': '2dsphere' });
weatherReportSchema.index({ generatedAt: -1 });
weatherReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
weatherReportSchema.index({ 'location.state': 1 });
weatherReportSchema.index({ format: 1 });
weatherReportSchema.index({ isActive: 1 });

// Virtual for report age
weatherReportSchema.virtual('age').get(function() {
  return Date.now() - this.generatedAt.getTime();
});

// Virtual for location path
weatherReportSchema.virtual('locationPath').get(function() {
  const parts = [];
  if (this.location?.name) parts.push(this.location.name);
  if (this.location?.district) parts.push(this.location.district);
  if (this.location?.state) parts.push(this.location.state);
  if (this.location?.country) parts.push(this.location.country);
  return parts.join(', ');
});

// Virtual for coordinates
weatherReportSchema.virtual('coordinates').get(function() {
  if (this.location?.coordinates?.coordinates) {
    return {
      latitude: this.location.coordinates.coordinates[1],
      longitude: this.location.coordinates.coordinates[0]
    };
  }
  return null;
});

// Pre-save middleware
weatherReportSchema.pre('save', function(next) {
  // Update summary data from reportData if available
  if (this.reportData) {
    if (this.reportData.alerts) {
      this.summary.totalAlerts = this.reportData.alerts.length;
      this.summary.activeAlerts = this.reportData.alerts.filter(alert => alert.isActive).length;
    }
    
    if (this.reportData.current) {
      this.summary.currentTemperature = this.reportData.current.temperature;
      this.summary.weatherCondition = this.reportData.current.condition;
    }
    
    if (this.reportData.forecast?.daily) {
      this.summary.forecastDays = this.reportData.forecast.daily.length;
    }
  }
  
  // Auto-generate title if not provided
  if (!this.title) {
    const locationName = this.location?.name || 'Unknown Location';
    const date = new Date().toLocaleDateString();
    this.title = `Weather Report - ${locationName} (${date})`;
  }
  
  next();
});

// Static methods
weatherReportSchema.statics.findByLocation = function(latitude, longitude, radiusKm = 50) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    },
    isActive: true
  }).sort({ generatedAt: -1 });
};

weatherReportSchema.statics.findRecent = function(days = 7, limit = 20) {
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);
  
  return this.find({
    generatedAt: { $gte: dateThreshold },
    isActive: true
  })
  .sort({ generatedAt: -1 })
  .limit(limit);
};

weatherReportSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lte: new Date() } },
      { isActive: false, updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    ]
  });
};

// Instance methods
weatherReportSchema.methods.incrementAccess = function() {
  this.accessCount++;
  this.lastAccessed = new Date();
  return this.save();
};

weatherReportSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt <= new Date();
};

weatherReportSchema.methods.isRecent = function(hours = 24) {
  const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.generatedAt >= threshold;
};

// Ensure virtual fields are serialized
weatherReportSchema.set('toJSON', { virtuals: true });
weatherReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('WeatherReport', weatherReportSchema);
