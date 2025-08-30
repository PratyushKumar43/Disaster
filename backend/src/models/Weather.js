const mongoose = require('mongoose');

/**
 * Weather Schema for storing weather data and forecasts
 */
const weatherSchema = new mongoose.Schema({
  location: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function(coords) {
            return !coords || (coords.length === 2 && 
                   coords[1] >= -90 && coords[1] <= 90 &&  // latitude
                   coords[0] >= -180 && coords[0] <= 180);  // longitude
          },
          message: 'Coordinates must be [longitude, latitude] within valid ranges'
        }
      }
    },
    // Keep legacy fields for easier access
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
    state: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    }
  },
  current: {
    timestamp: {
      type: Date,
      required: true
    },
    temperature: {
      type: Number,
      required: true,
      comment: 'Temperature in Celsius'
    },
    apparentTemperature: {
      type: Number,
      comment: 'Feels like temperature in Celsius'
    },
    precipitation: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Precipitation in mm'
    },
    rain: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Rain in mm'
    },
    showers: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Showers in mm'
    },
    relativeHumidity: {
      type: Number,
      min: 0,
      max: 100,
      comment: 'Relative humidity in percentage'
    },
    pressure: {
      msl: {
        type: Number,
        comment: 'Mean sea level pressure in hPa'
      },
      surface: {
        type: Number,
        comment: 'Surface pressure in hPa'
      }
    },
    wind: {
      speed: {
        type: Number,
        min: 0,
        comment: 'Wind speed in km/h'
      },
      direction: {
        type: Number,
        min: 0,
        max: 360,
        comment: 'Wind direction in degrees'
      },
      gusts: {
        type: Number,
        min: 0,
        comment: 'Wind gusts in km/h'
      }
    },
    isDay: {
      type: Boolean,
      default: true,
      comment: 'Whether it is day (true) or night (false)'
    },
    weatherCode: {
      type: Number,
      comment: 'WMO weather interpretation code'
    }
  },
  hourlyForecast: [{
    timestamp: {
      type: Date,
      required: true
    },
    temperature: {
      type: Number,
      required: true,
      comment: 'Temperature in Celsius'
    }
  }],
  dailyForecast: [{
    date: {
      type: Date,
      required: true
    },
    weatherCode: {
      type: Number,
      comment: 'WMO weather interpretation code'
    },
    temperature: {
      min: {
        type: Number,
        comment: 'Minimum temperature in Celsius'
      },
      max: {
        type: Number,
        comment: 'Maximum temperature in Celsius'
      }
    },
    precipitation: {
      total: {
        type: Number,
        default: 0,
        min: 0,
        comment: 'Total precipitation in mm'
      },
      probability: {
        type: Number,
        min: 0,
        max: 100,
        comment: 'Probability of precipitation in percentage'
      }
    },
    wind: {
      speed: {
        type: Number,
        min: 0,
        comment: 'Maximum wind speed in km/h'
      },
      direction: {
        type: Number,
        min: 0,
        max: 360,
        comment: 'Dominant wind direction in degrees'
      }
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['heat_wave', 'cold_wave', 'heavy_rain', 'thunderstorm', 'cyclone', 'drought', 'fog', 'high_wind'],
      required: true
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'extreme'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  dataSource: {
    provider: {
      type: String,
      default: 'Open-Meteo',
      trim: true
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now
    },
    generationTime: {
      type: Number,
      comment: 'API generation time in milliseconds'
    },
    timezone: {
      type: String,
      default: 'GMT',
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
weatherSchema.index({ 'location.coordinates': '2dsphere' });
weatherSchema.index({ 'location.name': 1 });
weatherSchema.index({ 'location.state': 1 });
weatherSchema.index({ 'dataSource.lastUpdated': -1 });
weatherSchema.index({ 'current.timestamp': -1 });
weatherSchema.index({ isActive: 1 });

// Compound indexes
weatherSchema.index({ 
  'location.coordinates': '2dsphere', 
  'dataSource.lastUpdated': -1 
});

// Virtual for weather condition description
weatherSchema.virtual('current.weatherCondition').get(function() {
  const code = this.current?.weatherCode;
  if (!code) return 'Unknown';
  
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
});

// Virtual for wind direction description
weatherSchema.virtual('current.windDirectionDescription').get(function() {
  const direction = this.current?.wind?.direction;
  if (direction === undefined || direction === null) return 'Unknown';
  
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  
  const index = Math.round(direction / 22.5) % 16;
  return directions[index];
});

// Virtual for data freshness
weatherSchema.virtual('dataFreshness').get(function() {
  if (!this.dataSource?.lastUpdated) return 'Unknown';
  
  const now = new Date();
  const updated = new Date(this.dataSource.lastUpdated);
  const diffMinutes = Math.floor((now - updated) / (1000 * 60));
  
  if (diffMinutes < 5) return 'Very Fresh';
  if (diffMinutes < 15) return 'Fresh';
  if (diffMinutes < 60) return 'Recent';
  if (diffMinutes < 180) return 'Moderate';
  return 'Outdated';
});

// Virtual for active alerts count
weatherSchema.virtual('activeAlertsCount').get(function() {
  if (!this.alerts) return 0;
  return this.alerts.filter(alert => alert.isActive && new Date(alert.endTime) > new Date()).length;
});

// Static method to find weather by location
weatherSchema.statics.findByLocation = function(latitude, longitude, maxDistance = 50000) {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const tolerance = 0.01; // ~1km tolerance
  
  // Try to find weather data near the location with tolerance
  return this.findOne({
    $or: [
      // Try GeoJSON coordinates with geospatial query
      {
        'location.coordinates': {
          $geoWithin: {
            $centerSphere: [[lon, lat], maxDistance / 6378100] // Earth radius in meters
          }
        }
      },
      // Try legacy latitude/longitude fields
      {
        $and: [
          { 'location.latitude': { $gte: lat - tolerance, $lte: lat + tolerance } },
          { 'location.longitude': { $gte: lon - tolerance, $lte: lon + tolerance } }
        ]
      }
    ],
    isActive: true
  }).sort({ 'dataSource.lastUpdated': -1 });
};

// Static method to find weather by state
weatherSchema.statics.findByState = function(state) {
  return this.find({
    'location.state': new RegExp(state, 'i'),
    isActive: true
  }).sort({ 'dataSource.lastUpdated': -1 });
};

// Method to check if data needs refresh (older than 1 hour)
weatherSchema.methods.needsRefresh = function() {
  if (!this.dataSource?.lastUpdated) return true;
  
  const now = new Date();
  const updated = new Date(this.dataSource.lastUpdated);
  const diffHours = (now - updated) / (1000 * 60 * 60);
  
  return diffHours > 1;
};

// Method to add weather alert
weatherSchema.methods.addAlert = function(alertData) {
  this.alerts.push({
    ...alertData,
    isActive: true
  });
  return this.save();
};

// Method to deactivate expired alerts
weatherSchema.methods.updateAlerts = function() {
  const now = new Date();
  let updated = false;
  
  this.alerts.forEach(alert => {
    if (alert.isActive && new Date(alert.endTime) <= now) {
      alert.isActive = false;
      updated = true;
    }
  });
  
  if (updated) {
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save middleware to update alerts
weatherSchema.pre('save', function(next) {
  this.updateAlerts();
  next();
});

// Pre-save middleware to ensure both GeoJSON and legacy coordinate formats
weatherSchema.pre('save', function(next) {
  if (this.location) {
    // If we have legacy lat/lon fields, convert to GeoJSON format
    if (this.location.latitude !== undefined && this.location.longitude !== undefined) {
      const lat = this.location.latitude;
      const lon = this.location.longitude;
      
      // Set the GeoJSON coordinates
      this.location.coordinates = {
        type: 'Point',
        coordinates: [lon, lat]
      };
    }
    // If we have GeoJSON coordinates, extract legacy fields
    else if (this.location.coordinates && this.location.coordinates.coordinates && Array.isArray(this.location.coordinates.coordinates)) {
      const [lon, lat] = this.location.coordinates.coordinates;
      this.location.latitude = lat;
      this.location.longitude = lon;
    }
  }
  next();
});

const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;
