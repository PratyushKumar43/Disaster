const Weather = require('../models/Weather');
const CONSTANTS = require('../config/constants');
const axios = require('axios');
const { logger } = require('../config/database');

/**
 * Weather Controller - Handles weather-related operations
 */

/**
 * Helper function to get weather condition description from weather code
 */
const getWeatherCondition = (weatherCode) => {
  const weatherDescriptions = {
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
  
  return weatherDescriptions[weatherCode] || 'Unknown';
};

/**
 * Helper function to get wind direction description
 */
const getWindDirection = (degrees) => {
  if (degrees === null || degrees === undefined) return 'Unknown';
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
};

// OpenMeteo API configuration
const OPENMETEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Weather code interpretations for alerts
const ALERT_WEATHER_CODES = {
  HEAVY_RAIN: [63, 65, 81, 82],
  THUNDERSTORM: [95, 96, 99],
  SNOW: [71, 73, 75, 77, 85, 86],
  FOG: [45, 48]
};

/**
 * Fetch weather data from OpenMeteo API
 */
const fetchOpenMeteoData = async (latitude, longitude) => {
  try {
    const params = {
      latitude,
      longitude,
      current: [
        'temperature_2m',
        'precipitation',
        'rain',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'showers',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'weather_code',
        'cloud_cover',
        'uv_index',
        'visibility',
        'snowfall'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation_probability',
        'precipitation',
        'rain',
        'showers',
        'surface_pressure',
        'wind_direction_10m',
        'wind_speed_10m',
        'wind_gusts_10m',
        'uv_index',
        'is_day',
        'cloud_cover',
        'visibility',
        'weather_code',
        'apparent_temperature',
        'dewpoint_2m',
        'snowfall'
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'precipitation_sum',
        'rain_sum',
        'showers_sum',
        'snowfall_sum',
        'precipitation_hours',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'wind_direction_10m_dominant',
        'shortwave_radiation_sum',
        'uv_index_max',
        'sunrise',
        'sunset',
        'daylight_duration',
        'sunshine_duration'
      ].join(','),
      timezone: 'auto',
      past_days: 1,
      forecast_days: 14
    };

    logger.info(`Fetching weather data for coordinates: ${latitude}, ${longitude}`);
    
    const response = await axios.get(OPENMETEO_BASE_URL, { 
      params,
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    logger.error('Error fetching OpenMeteo data:', error.message);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

/**
 * Transform OpenMeteo data to our schema format
 */
const transformOpenMeteoData = (data, locationInfo) => {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  // Transform hourly data (next 48 hours for detailed forecast)
  const hourlyForecast = [];
  if (hourly && hourly.time && hourly.temperature_2m) {
    for (let i = 0; i < Math.min(48, hourly.time.length); i++) {
      hourlyForecast.push({
        timestamp: new Date(hourly.time[i]),
        temperature: hourly.temperature_2m[i],
        apparentTemperature: hourly.apparent_temperature?.[i],
        relativeHumidity: hourly.relative_humidity_2m?.[i],
        precipitationProbability: hourly.precipitation_probability?.[i],
        precipitation: hourly.precipitation?.[i] || 0,
        rain: hourly.rain?.[i] || 0,
        showers: hourly.showers?.[i] || 0,
        snowfall: hourly.snowfall?.[i] || 0,
        pressure: hourly.surface_pressure?.[i],
        windSpeed: hourly.wind_speed_10m?.[i],
        windDirection: hourly.wind_direction_10m?.[i],
        windGusts: hourly.wind_gusts_10m?.[i],
        uvIndex: hourly.uv_index?.[i],
        isDay: Boolean(hourly.is_day?.[i]),
        cloudCover: hourly.cloud_cover?.[i],
        visibility: hourly.visibility?.[i],
        weatherCode: hourly.weather_code?.[i],
        dewpoint: hourly.dewpoint_2m?.[i]
      });
    }
  }

  // Transform daily data
  const dailyForecast = [];
  if (daily && daily.time) {
    for (let i = 0; i < daily.time.length; i++) {
      dailyForecast.push({
        date: new Date(daily.time[i]),
        weatherCode: daily.weather_code?.[i],
        temperature: {
          min: daily.temperature_2m_min?.[i],
          max: daily.temperature_2m_max?.[i]
        },
        apparentTemperature: {
          min: daily.apparent_temperature_min?.[i],
          max: daily.apparent_temperature_max?.[i]
        },
        precipitation: {
          total: daily.precipitation_sum?.[i] || 0,
          rain: daily.rain_sum?.[i] || 0,
          showers: daily.showers_sum?.[i] || 0,
          snow: daily.snowfall_sum?.[i] || 0,
          hours: daily.precipitation_hours?.[i] || 0,
          probability: daily.precipitation_probability_max?.[i] || 0
        },
        wind: {
          speed: daily.wind_speed_10m_max?.[i],
          gusts: daily.wind_gusts_10m_max?.[i],
          direction: daily.wind_direction_10m_dominant?.[i]
        },
        uvIndex: daily.uv_index_max?.[i],
        sunrise: daily.sunrise?.[i],
        sunset: daily.sunset?.[i],
        daylightDuration: daily.daylight_duration?.[i],
        sunshineDuration: daily.sunshine_duration?.[i],
        solarRadiation: daily.shortwave_radiation_sum?.[i]
      });
    }
  }

  // Generate alerts based on weather conditions
  const alerts = generateWeatherAlerts(current, dailyForecast);

  return {
    location: {
      name: locationInfo?.name || `Location ${data.latitude}, ${data.longitude}`,
      latitude: data.latitude,
      longitude: data.longitude,
      state: locationInfo?.state,
      district: locationInfo?.district,
      country: locationInfo?.country || 'India'
    },
    current: {
      timestamp: new Date(current?.time || new Date()),
      temperature: current?.temperature_2m || 0,
      apparentTemperature: current?.apparent_temperature || current?.temperature_2m || 0,
      precipitation: current?.precipitation || 0,
      rain: current?.rain || 0,
      showers: current?.showers || 0,
      snowfall: current?.snowfall || 0,
      relativeHumidity: current?.relative_humidity_2m || 0,
      pressure: {
        msl: current?.pressure_msl || 0,
        surface: current?.surface_pressure || 0
      },
      wind: {
        speed: current?.wind_speed_10m || 0,
        direction: current?.wind_direction_10m || 0,
        gusts: current?.wind_gusts_10m || 0
      },
      isDay: Boolean(current?.is_day),
      weatherCode: current?.weather_code || 0,
      weatherCondition: getWeatherCondition(current?.weather_code),
      windDirectionDescription: getWindDirection(current?.wind_direction_10m),
      cloudCover: current?.cloud_cover || 0,
      uvIndex: current?.uv_index || 0,
      visibility: current?.visibility || 0
    },
    hourlyForecast,
    dailyForecast,
    alerts,
    dataSource: {
      provider: 'Open-Meteo',
      lastUpdated: new Date(),
      generationTime: data.generationtime_ms,
      timezone: data.timezone || 'GMT'
    }
  };
};

/**
 * Generate weather alerts based on conditions
 */
const generateWeatherAlerts = (current, dailyForecast) => {
  const alerts = [];
  const now = new Date();

  // Temperature-based alerts
  if (current.temperature_2m > 40) {
    alerts.push({
      type: 'heat_wave',
      severity: current.temperature_2m > 45 ? 'extreme' : 'high',
      title: 'Heat Wave Warning',
      description: `Extremely high temperature of ${current.temperature_2m}°C. Stay hydrated and avoid outdoor activities.`,
      startTime: now,
      endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    });
  }

  if (current.temperature_2m < 5) {
    alerts.push({
      type: 'cold_wave',
      severity: current.temperature_2m < 0 ? 'extreme' : 'high',
      title: 'Cold Wave Warning',
      description: `Very low temperature of ${current.temperature_2m}°C. Take precautions against cold weather.`,
      startTime: now,
      endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000)
    });
  }

  // Precipitation alerts
  if (current.rain > 50) {
    alerts.push({
      type: 'heavy_rain',
      severity: current.rain > 100 ? 'extreme' : 'high',
      title: 'Heavy Rain Alert',
      description: `Heavy rainfall of ${current.rain}mm detected. Risk of flooding in low-lying areas.`,
      startTime: now,
      endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000)
    });
  }

  // Wind alerts
  if (current.wind_speed_10m > 50) {
    alerts.push({
      type: 'high_wind',
      severity: current.wind_speed_10m > 80 ? 'extreme' : 'high',
      title: 'High Wind Warning',
      description: `Strong winds of ${current.wind_speed_10m} km/h with gusts up to ${current.wind_gusts_10m} km/h.`,
      startTime: now,
      endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000)
    });
  }

  // Weather code-based alerts
  if (ALERT_WEATHER_CODES.THUNDERSTORM.includes(current.weather_code)) {
    alerts.push({
      type: 'thunderstorm',
      severity: current.weather_code === 99 ? 'extreme' : 'moderate',
      title: 'Thunderstorm Alert',
      description: 'Thunderstorm conditions detected. Seek shelter and avoid outdoor activities.',
      startTime: now,
      endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000)
    });
  }

  return alerts;
};

/**
 * Get current weather for a location
 */
exports.getCurrentWeather = async (req, res) => {
  try {
    const { latitude, longitude, location_name, state, district } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
        code: 'MISSING_COORDINATES'
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided',
        code: 'INVALID_COORDINATES'
      });
    }

    // Always fetch fresh data for now to avoid location confusion
    logger.info(`Fetching fresh weather data for ${lat}, ${lon}`);
    
    // Fetch fresh data from OpenMeteo
    const openMeteoData = await fetchOpenMeteoData(lat, lon);
    
    // Transform and save data
    const weatherData = transformOpenMeteoData(openMeteoData, {
      name: location_name,
      state,
      district
    });

    // Check if we have existing data for this location with reasonable tolerance
    let weather = await Weather.findOne({
      'location.coordinates.latitude': { $gte: lat - 0.01, $lte: lat + 0.01 },
      'location.coordinates.longitude': { $gte: lon - 0.01, $lte: lon + 0.01 },
      isActive: true
    }).sort({ 'dataSource.lastUpdated': -1 });

    if (weather) {
      // Update existing record
      Object.assign(weather, weatherData);
      weather = await weather.save();
    } else {
      // Create new record
      weather = new Weather(weatherData);
      weather = await weather.save();
    }
    
    logger.info(`Weather data updated for location: ${weather.location.name} (${lat}, ${lon})`);

    res.status(200).json({
      success: true,
      message: 'Weather data retrieved successfully',
      data: {
        weather,
        dataFreshness: weather.dataFreshness,
        activeAlerts: weather.alerts.filter(alert => 
          alert.isActive && new Date(alert.endTime) > new Date()
        )
      }
    });

  } catch (error) {
    logger.error('Error in getCurrentWeather:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weather data',
      code: 'WEATHER_FETCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get weather forecast for a location
 */
exports.getWeatherForecast = async (req, res) => {
  try {
    const { latitude, longitude, days = 7 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
        code: 'MISSING_COORDINATES'
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const forecastDays = parseInt(days);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates provided',
        code: 'INVALID_COORDINATES'
      });
    }

    if (isNaN(forecastDays) || forecastDays < 1 || forecastDays > 16) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 16',
        code: 'INVALID_DAYS'
      });
    }

    // Find weather data
    let weather = await Weather.findByLocation(lat, lon);
    
    if (!weather || weather.needsRefresh()) {
      // Fetch fresh data if not available or outdated
      const openMeteoData = await fetchOpenMeteoData(lat, lon);
      const weatherData = transformOpenMeteoData(openMeteoData, {});

      if (weather) {
        Object.assign(weather, weatherData);
        weather = await weather.save();
      } else {
        weather = new Weather(weatherData);
        weather = await weather.save();
      }
    }

    // Filter forecast based on requested days
    const dailyForecast = weather.dailyForecast.slice(0, forecastDays);
    const hourlyForecast = weather.hourlyForecast.slice(0, forecastDays * 24);

    res.status(200).json({
      success: true,
      message: 'Weather forecast retrieved successfully',
      data: {
        location: weather.location,
        current: weather.current,
        dailyForecast,
        hourlyForecast,
        alerts: weather.alerts.filter(alert => 
          alert.isActive && new Date(alert.endTime) > new Date()
        ),
        dataSource: weather.dataSource
      }
    });

  } catch (error) {
    logger.error('Error in getWeatherForecast:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weather forecast',
      code: 'FORECAST_FETCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get weather alerts for a location or region
 */
exports.getWeatherAlerts = async (req, res) => {
  try {
    const { latitude, longitude, state, severity, active_only = 'true' } = req.query;

    let query = {};
    
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided',
          code: 'INVALID_COORDINATES'
        });
      }

      // Find weather data near the location
      const weather = await Weather.findByLocation(lat, lon);
      if (!weather) {
        return res.status(404).json({
          success: false,
          message: 'No weather data found for this location',
          code: 'WEATHER_NOT_FOUND'
        });
      }

      let alerts = weather.alerts;
      
      if (active_only === 'true') {
        alerts = alerts.filter(alert => 
          alert.isActive && new Date(alert.endTime) > new Date()
        );
      }

      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity);
      }

      return res.status(200).json({
        success: true,
        message: 'Weather alerts retrieved successfully',
        data: {
          location: weather.location,
          alerts,
          count: alerts.length
        }
      });
    }

    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    const weatherRecords = await Weather.find(query)
      .sort({ 'dataSource.lastUpdated': -1 })
      .limit(50);

    let allAlerts = [];
    weatherRecords.forEach(weather => {
      let alerts = weather.alerts;
      
      if (active_only === 'true') {
        alerts = alerts.filter(alert => 
          alert.isActive && new Date(alert.endTime) > new Date()
        );
      }

      if (severity) {
        alerts = alerts.filter(alert => alert.severity === severity);
      }

      alerts.forEach(alert => {
        allAlerts.push({
          ...alert.toObject(),
          location: weather.location
        });
      });
    });

    // Sort by severity and start time
    const severityOrder = { 'extreme': 4, 'high': 3, 'moderate': 2, 'low': 1 };
    allAlerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.startTime) - new Date(a.startTime);
    });

    res.status(200).json({
      success: true,
      message: 'Weather alerts retrieved successfully',
      data: {
        alerts: allAlerts,
        count: allAlerts.length,
        filters: { state, severity, active_only }
      }
    });

  } catch (error) {
    logger.error('Error in getWeatherAlerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weather alerts',
      code: 'ALERTS_FETCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get weather statistics and dashboard data
 */
exports.getWeatherStats = async (req, res) => {
  try {
    const { state, days = 7 } = req.query;
    const daysBack = parseInt(days);

    if (isNaN(daysBack) || daysBack < 1 || daysBack > 30) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 30',
        code: 'INVALID_DAYS'
      });
    }

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    let query = {
      'dataSource.lastUpdated': { $gte: dateThreshold },
      isActive: true
    };

    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    const weatherRecords = await Weather.find(query);

    // Calculate statistics
    const stats = {
      totalLocations: weatherRecords.length,
      averageTemperature: 0,
      temperatureRange: { min: null, max: null },
      totalAlerts: 0,
      activeAlerts: 0,
      alertsBySeverity: { low: 0, moderate: 0, high: 0, extreme: 0 },
      weatherConditions: {},
      averageHumidity: 0,
      averageWindSpeed: 0,
      topAffectedAreas: [],
      recentUpdates: []
    };

    if (weatherRecords.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No weather data found for the specified criteria',
        data: stats
      });
    }

    let tempSum = 0;
    let humiditySum = 0;
    let windSpeedSum = 0;
    let minTemp = Number.MAX_VALUE;
    let maxTemp = Number.MIN_VALUE;

    weatherRecords.forEach(weather => {
      const temp = weather.current?.temperature;
      const humidity = weather.current?.relativeHumidity;
      const windSpeed = weather.current?.wind?.speed;

      if (temp !== null && temp !== undefined && !isNaN(temp)) {
        tempSum += temp;
        minTemp = Math.min(minTemp, temp);
        maxTemp = Math.max(maxTemp, temp);
      }

      if (humidity !== null && humidity !== undefined && !isNaN(humidity)) {
        humiditySum += humidity;
      }

      if (windSpeed !== null && windSpeed !== undefined && !isNaN(windSpeed)) {
        windSpeedSum += windSpeed;
      }

      // Count weather conditions
      const condition = weather.current?.weatherCondition || 'Unknown';
      stats.weatherConditions[condition] = (stats.weatherConditions[condition] || 0) + 1;

      // Count alerts
      weather.alerts.forEach(alert => {
        stats.totalAlerts++;
        stats.alertsBySeverity[alert.severity]++;
        
        if (alert.isActive && new Date(alert.endTime) > new Date()) {
          stats.activeAlerts++;
        }
      });

      // Track recent updates
      stats.recentUpdates.push({
        location: weather.location?.name || 'Unknown',
        state: weather.location?.state || 'Unknown',
        lastUpdated: weather.dataSource?.lastUpdated || new Date(),
        temperature: weather.current?.temperature || 0,
        condition: weather.current?.weatherCondition || 'Unknown'
      });
    });

    stats.averageTemperature = Math.round((tempSum / weatherRecords.length) * 10) / 10;
    stats.averageHumidity = Math.round((humiditySum / weatherRecords.length) * 10) / 10;
    stats.averageWindSpeed = Math.round((windSpeedSum / weatherRecords.length) * 10) / 10;
    stats.temperatureRange = { min: minTemp, max: maxTemp };

    // Sort recent updates by last updated
    stats.recentUpdates.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    stats.recentUpdates = stats.recentUpdates.slice(0, 10);

    // Find top affected areas (areas with most active alerts)
    const areaAlerts = {};
    weatherRecords.forEach(weather => {
      const area = weather.location?.state || weather.location?.name || 'Unknown Area';
      const activeAlerts = (weather.alerts || []).filter(alert => 
        alert?.isActive && new Date(alert.endTime) > new Date()
      ).length;
      
      if (activeAlerts > 0) {
        areaAlerts[area] = (areaAlerts[area] || 0) + activeAlerts;
      }
    });

    stats.topAffectedAreas = Object.entries(areaAlerts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([area, alertCount]) => ({ area, alertCount }));

    res.status(200).json({
      success: true,
      message: 'Weather statistics retrieved successfully',
      data: stats,
      metadata: {
        query: { state, days: daysBack },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error in getWeatherStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weather statistics',
      code: 'STATS_FETCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Bulk update weather data for multiple locations
 */
exports.bulkUpdateWeather = async (req, res) => {
  try {
    const { locations } = req.body;

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Locations array is required',
        code: 'MISSING_LOCATIONS'
      });
    }

    if (locations.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 locations allowed per bulk update',
        code: 'TOO_MANY_LOCATIONS'
      });
    }

    const results = [];
    const errors = [];

    for (const location of locations) {
      try {
        const { latitude, longitude, name, state, district } = location;
        
        if (!latitude || !longitude) {
          errors.push({ location, error: 'Missing coordinates' });
          continue;
        }

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
          errors.push({ location, error: 'Invalid coordinates' });
          continue;
        }

        // Fetch data from OpenMeteo
        const openMeteoData = await fetchOpenMeteoData(lat, lon);
        const weatherData = transformOpenMeteoData(openMeteoData, { name, state, district });

        // Update or create weather record
        let weather = await Weather.findByLocation(lat, lon);
        
        if (weather) {
          Object.assign(weather, weatherData);
          weather = await weather.save();
        } else {
          weather = new Weather(weatherData);
          weather = await weather.save();
        }

        results.push({
          location: weather.location,
          status: 'updated',
          activeAlerts: weather.activeAlertsCount
        });

        // Add delay between API calls to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        logger.error(`Error updating weather for location ${location.name}:`, error);
        errors.push({ location, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk weather update completed',
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }
    });

  } catch (error) {
    logger.error('Error in bulkUpdateWeather:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk weather update',
      code: 'BULK_UPDATE_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete old weather data (cleanup)
 */
exports.cleanupWeatherData = async (req, res) => {
  try {
    const { days_old = 30, dry_run = 'false' } = req.query;
    const daysOld = parseInt(days_old);

    if (isNaN(daysOld) || daysOld < 7) {
      return res.status(400).json({
        success: false,
        message: 'Days old must be at least 7',
        code: 'INVALID_DAYS'
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const query = {
      'dataSource.lastUpdated': { $lt: cutoffDate },
      isActive: true
    };

    if (dry_run === 'true') {
      const count = await Weather.countDocuments(query);
      return res.status(200).json({
        success: true,
        message: 'Dry run completed',
        data: {
          recordsToDelete: count,
          cutoffDate: cutoffDate.toISOString(),
          dryRun: true
        }
      });
    }

    const result = await Weather.updateMany(query, { 
      isActive: false,
      deletedAt: new Date()
    });

    logger.info(`Cleaned up ${result.modifiedCount} old weather records`);

    res.status(200).json({
      success: true,
      message: 'Weather data cleanup completed',
      data: {
        recordsModified: result.modifiedCount,
        cutoffDate: cutoffDate.toISOString(),
        dryRun: false
      }
    });

  } catch (error) {
    logger.error('Error in cleanupWeatherData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup weather data',
      code: 'CLEANUP_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
