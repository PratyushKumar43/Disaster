const Weather = require('../models/Weather');
const WeatherReport = require('../models/WeatherReport');
const { logger } = require('../config/database');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

/**
 * Weather Report Controller - Handles weather report generation
 */

// Chart configuration
const chartJSNodeCanvas = new ChartJSNodeCanvas({
  width: 800,
  height: 400,
  backgroundColour: 'white'
});

// OpenMeteo API configuration
const OPENMETEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Helper function to create temperature chart
 */
const createTemperatureChart = async (hourlyData) => {
  const times = hourlyData.slice(0, 24).map(h => new Date(h.timestamp).getHours() + ':00');
  const temperatures = hourlyData.slice(0, 24).map(h => h.temperature);
  const apparentTemps = hourlyData.slice(0, 24).map(h => h.apparentTemperature);

  const configuration = {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: temperatures,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.4
        },
        {
          label: 'Feels Like (°C)',
          data: apparentTemps,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: '24-Hour Temperature Forecast'
        },
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (Hours)'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
};

/**
 * Helper function to create precipitation chart
 */
const createPrecipitationChart = async (hourlyData) => {
  const times = hourlyData.slice(0, 24).map(h => new Date(h.timestamp).getHours() + ':00');
  const precipitation = hourlyData.slice(0, 24).map(h => h.precipitation);
  const probability = hourlyData.slice(0, 24).map(h => h.precipitationProbability);

  const configuration = {
    type: 'bar',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Precipitation (mm)',
          data: precipitation,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Probability (%)',
          data: probability,
          type: 'line',
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: '24-Hour Precipitation Forecast'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Precipitation (mm)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Probability (%)'
          },
          grid: {
            drawOnChartArea: false,
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (Hours)'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
};

/**
 * Helper function to create UV index and solar radiation chart
 */
const createUVAndSolarChart = async (hourlyData) => {
  const times = hourlyData.slice(0, 24).map(h => new Date(h.timestamp).getHours() + ':00');
  const uvIndex = hourlyData.slice(0, 24).map(h => h.uvIndex);
  const solarRadiation = hourlyData.slice(0, 24).map(h => h.solarRadiation.shortwave / 100); // Scale for visibility

  const configuration = {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'UV Index',
          data: uvIndex,
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Solar Radiation (W/m²/100)',
          data: solarRadiation,
          borderColor: 'rgb(255, 205, 86)',
          backgroundColor: 'rgba(255, 205, 86, 0.2)',
          yAxisID: 'y1',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: '24-Hour UV Index & Solar Radiation'
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'UV Index'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Solar Radiation (W/m²/100)'
          },
          grid: {
            drawOnChartArea: false,
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (Hours)'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
};

/**
 * Helper function to create wind speed and direction chart
 */
const createWindChart = async (hourlyData) => {
  const times = hourlyData.slice(0, 24).map(h => new Date(h.timestamp).getHours() + ':00');
  const windSpeed = hourlyData.slice(0, 24).map(h => h.windSpeed);
  const windGusts = hourlyData.slice(0, 24).map(h => h.windGusts);

  const configuration = {
    type: 'line',
    data: {
      labels: times,
      datasets: [
        {
          label: 'Wind Speed (km/h)',
          data: windSpeed,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4
        },
        {
          label: 'Wind Gusts (km/h)',
          data: windGusts,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderDash: [3, 3],
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: '24-Hour Wind Speed Forecast'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Speed (km/h)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time (Hours)'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
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
        'uv_index_clear_sky',
        'visibility',
        'snowfall',
        'sunshine_duration',
        'wet_bulb_temperature_2m',
        'shortwave_radiation',
        'direct_radiation',
        'diffuse_radiation',
        'direct_normal_irradiance',
        'global_tilted_irradiance',
        'terrestrial_radiation'
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
        'uv_index_clear_sky',
        'is_day',
        'cloud_cover',
        'visibility',
        'weather_code',
        'apparent_temperature',
        'dewpoint_2m',
        'snowfall',
        'sunshine_duration',
        'wet_bulb_temperature_2m',
        'shortwave_radiation',
        'direct_radiation',
        'diffuse_radiation',
        'direct_normal_irradiance',
        'global_tilted_irradiance',
        'terrestrial_radiation',
        'pressure_msl'
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
const transformOpenMeteoData = (data, locationInfo = {}) => {
  const current = data.current || {};
  const hourly = data.hourly || {};
  const daily = data.daily || {};
  
  // Get the current hour index for hourly data
  const currentTime = new Date(current.time);
  const currentHourIndex = hourly.time ? hourly.time.findIndex(time => 
    new Date(time).getTime() === currentTime.getTime()
  ) : 0;

  const weatherData = {
    location: {
      name: locationInfo.name || `Location (${data.latitude}, ${data.longitude})`,
      coordinates: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude]
      },
      latitude: data.latitude,
      longitude: data.longitude,
      state: locationInfo.state || 'Unknown',
      district: locationInfo.district || 'Unknown',
      country: locationInfo.country || 'India'
    },
          current: {
        timestamp: new Date(current.time),
        temperature: current.temperature_2m || 0,
        apparentTemperature: current.apparent_temperature || current.temperature_2m || 0,
        precipitation: current.precipitation || 0,
        rain: current.rain || 0,
        showers: current.showers || 0,
        snowfall: current.snowfall || 0,
        relativeHumidity: current.relative_humidity_2m || 0,
        pressure: {
          msl: current.pressure_msl || 0,
          surface: current.surface_pressure || 0
        },
        wind: {
          speed: current.wind_speed_10m || 0,
          direction: current.wind_direction_10m || 0,
          gusts: current.wind_gusts_10m || 0
        },
        isDay: current.is_day === 1,
        weatherCode: current.weather_code || 0,
        visibility: current.visibility || 0,
        uvIndex: current.uv_index || 0,
        uvIndexClearSky: current.uv_index_clear_sky || 0,
        cloudCover: current.cloud_cover || 0,
        sunshineDuration: current.sunshine_duration || 0,
        wetBulbTemperature: current.wet_bulb_temperature_2m || 0,
        solarRadiation: {
          shortwave: current.shortwave_radiation || 0,
          direct: current.direct_radiation || 0,
          diffuse: current.diffuse_radiation || 0,
          directNormal: current.direct_normal_irradiance || 0,
          globalTilted: current.global_tilted_irradiance || 0,
          terrestrial: current.terrestrial_radiation || 0
        }
      },
    hourlyForecast: [],
    dailyForecast: [],
    alerts: [],
    dataSource: {
      provider: 'Open-Meteo',
      lastUpdated: new Date(),
      generationTime: data.generationtime_ms || 0,
      timezone: data.timezone || 'GMT'
    },
    isActive: true
  };

  // Transform hourly forecast (next 24 hours)
  if (hourly.time && hourly.temperature_2m) {
    for (let i = 0; i < Math.min(24, hourly.time.length); i++) {
      weatherData.hourlyForecast.push({
        timestamp: new Date(hourly.time[i]),
        temperature: hourly.temperature_2m[i] || 0,
        apparentTemperature: hourly.apparent_temperature ? hourly.apparent_temperature[i] || 0 : 0,
        precipitation: hourly.precipitation ? hourly.precipitation[i] || 0 : 0,
        precipitationProbability: hourly.precipitation_probability ? hourly.precipitation_probability[i] || 0 : 0,
        rain: hourly.rain ? hourly.rain[i] || 0 : 0,
        showers: hourly.showers ? hourly.showers[i] || 0 : 0,
        snowfall: hourly.snowfall ? hourly.snowfall[i] || 0 : 0,
        relativeHumidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] || 0 : 0,
        dewpoint: hourly.dewpoint_2m ? hourly.dewpoint_2m[i] || 0 : 0,
        wetBulbTemperature: hourly.wet_bulb_temperature_2m ? hourly.wet_bulb_temperature_2m[i] || 0 : 0,
        windSpeed: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] || 0 : 0,
        windDirection: hourly.wind_direction_10m ? hourly.wind_direction_10m[i] || 0 : 0,
        windGusts: hourly.wind_gusts_10m ? hourly.wind_gusts_10m[i] || 0 : 0,
        pressure: {
          msl: hourly.pressure_msl ? hourly.pressure_msl[i] || 0 : 0,
          surface: hourly.surface_pressure ? hourly.surface_pressure[i] || 0 : 0
        },
        uvIndex: hourly.uv_index ? hourly.uv_index[i] || 0 : 0,
        uvIndexClearSky: hourly.uv_index_clear_sky ? hourly.uv_index_clear_sky[i] || 0 : 0,
        cloudCover: hourly.cloud_cover ? hourly.cloud_cover[i] || 0 : 0,
        visibility: hourly.visibility ? hourly.visibility[i] || 0 : 0,
        weatherCode: hourly.weather_code ? hourly.weather_code[i] || 0 : 0,
        isDay: hourly.is_day ? hourly.is_day[i] === 1 : true,
        sunshineDuration: hourly.sunshine_duration ? hourly.sunshine_duration[i] || 0 : 0,
        solarRadiation: {
          shortwave: hourly.shortwave_radiation ? hourly.shortwave_radiation[i] || 0 : 0,
          direct: hourly.direct_radiation ? hourly.direct_radiation[i] || 0 : 0,
          diffuse: hourly.diffuse_radiation ? hourly.diffuse_radiation[i] || 0 : 0,
          directNormal: hourly.direct_normal_irradiance ? hourly.direct_normal_irradiance[i] || 0 : 0,
          globalTilted: hourly.global_tilted_irradiance ? hourly.global_tilted_irradiance[i] || 0 : 0,
          terrestrial: hourly.terrestrial_radiation ? hourly.terrestrial_radiation[i] || 0 : 0
        }
      });
    }
  }

  // Transform daily forecast
  if (daily.time && daily.temperature_2m_max) {
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      weatherData.dailyForecast.push({
        date: new Date(daily.time[i]),
        weatherCode: daily.weather_code ? daily.weather_code[i] || 0 : 0,
        temperature: {
          max: daily.temperature_2m_max[i] || 0,
          min: daily.temperature_2m_min[i] || 0
        },
        precipitation: {
          total: daily.precipitation_sum ? daily.precipitation_sum[i] || 0 : 0,
          probability: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] || 0 : 0
        },
        wind: {
          speed: daily.wind_speed_10m_max ? daily.wind_speed_10m_max[i] || 0 : 0,
          direction: daily.wind_direction_10m_dominant ? daily.wind_direction_10m_dominant[i] || 0 : 0
        },
        uvIndex: daily.uv_index_max ? daily.uv_index_max[i] || 0 : 0,
        sunrise: daily.sunrise ? daily.sunrise[i] || '' : '',
        sunset: daily.sunset ? daily.sunset[i] || '' : ''
      });
    }
  }

  return weatherData;
};

/**
 * Helper function to safely extract latitude from different coordinate formats
 */
const getLatitudeFromCoordinates = (coordinates) => {
  if (!coordinates) return 0;
  
  // GeoJSON format: [longitude, latitude]
  if (coordinates.coordinates && Array.isArray(coordinates.coordinates)) {
    return coordinates.coordinates[1] || 0;
  }
  
  // Direct format: { latitude, longitude }
  if (typeof coordinates.latitude === 'number') {
    return coordinates.latitude;
  }
  
  return 0;
};

/**
 * Helper function to safely extract longitude from different coordinate formats
 */
const getLongitudeFromCoordinates = (coordinates) => {
  if (!coordinates) return 0;
  
  // GeoJSON format: [longitude, latitude]
  if (coordinates.coordinates && Array.isArray(coordinates.coordinates)) {
    return coordinates.coordinates[0] || 0;
  }
  
  // Direct format: { latitude, longitude }
  if (typeof coordinates.longitude === 'number') {
    return coordinates.longitude;
  }
  
  return 0;
};

/**
 * Helper function to safely escape HTML content
 */
const escapeHtml = (text) => {
  if (typeof text !== 'string') return String(text || '');
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

/**
 * Generate comprehensive weather report
 */
exports.generateWeatherReport = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      format = 'json', 
      type = 'comprehensive',
      language = 'en',
      includeAlerts = true,
      includeForecast = true,
      forecastDays = 7
    } = req.query;

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

    // Get weather data - if not available, fetch from OpenMeteo
    let weather = await Weather.findByLocation(lat, lon);
    
    if (!weather || weather.needsRefresh()) {
      logger.info(`Weather data not found or outdated for ${lat}, ${lon}. Fetching fresh data from OpenMeteo...`);
      
      try {
        // Fetch fresh data from OpenMeteo
        const openMeteoData = await fetchOpenMeteoData(lat, lon);
        const weatherData = transformOpenMeteoData(openMeteoData, {
          name: req.query.location_name || `Location (${lat}, ${lon})`,
          state: req.query.state,
          district: req.query.district
        });

        if (weather) {
          // Update existing record
          Object.assign(weather, weatherData);
          weather = await weather.save();
        } else {
          // Create new record
          weather = new Weather(weatherData);
          weather = await weather.save();
        }
        
        logger.info(`Fresh weather data saved for location: ${weather.location.name}`);
      } catch (fetchError) {
        logger.error('Failed to fetch weather data from OpenMeteo:', fetchError.message);
        return res.status(503).json({
          success: false,
          message: 'Unable to fetch current weather data. Please try again later.',
          code: 'WEATHER_SERVICE_UNAVAILABLE',
          error: process.env.NODE_ENV === 'development' ? fetchError.message : undefined
        });
      }
    }

    // Generate report data
    const reportData = await generateReportData(weather, {
      type,
      includeAlerts,
      includeForecast,
      forecastDays: parseInt(forecastDays),
      language
    });

    // Handle different output formats
    switch (format.toLowerCase()) {
      case 'pdf':
        try {
          return await generatePDFReport(req, res, reportData);
        } catch (pdfError) {
          logger.error('PDF generation error:', pdfError);
          if (!res.headersSent) {
            return res.status(500).json({
              success: false,
              message: 'Failed to generate PDF report',
              code: 'PDF_GENERATION_ERROR',
              error: process.env.NODE_ENV === 'development' ? pdfError.message : undefined
            });
          }
        }
        break;
      case 'excel':
        try {
          return await generateExcelReport(req, res, reportData);
        } catch (excelError) {
          logger.error('Excel generation error:', excelError);
          if (!res.headersSent) {
            return res.status(500).json({
              success: false,
              message: 'Failed to generate Excel report',
              code: 'EXCEL_GENERATION_ERROR',
              error: process.env.NODE_ENV === 'development' ? excelError.message : undefined
            });
          }
        }
        break;
      case 'html':
        try {
          return await generateHTMLReport(req, res, reportData);
        } catch (htmlError) {
          logger.error('HTML generation error:', htmlError);
          if (!res.headersSent) {
            return res.status(500).json({
              success: false,
              message: 'Failed to generate HTML report',
              code: 'HTML_GENERATION_ERROR',
              error: process.env.NODE_ENV === 'development' ? htmlError.message : undefined
            });
          }
        }
        break;
      default:
        return res.status(200).json({
          success: true,
          message: 'Weather report generated successfully',
          data: reportData
        });
    }

  } catch (error) {
    logger.error('Error in generateWeatherReport:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to generate weather report',
      code: 'REPORT_GENERATION_ERROR',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

/**
 * Generate structured report data
 */
const generateReportData = async (weather, options) => {
  const { type, includeAlerts, includeForecast, forecastDays, language } = options;
  
  const reportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      reportType: type,
      language,
      dataFreshness: weather.dataFreshness,
      coordinates: weather.location.coordinates
    },
    location: {
      name: weather.location?.name || 'Unknown Location',
      state: weather.location?.state || 'Unknown State',
      district: weather.location?.district || 'Unknown District',
      country: weather.location?.country || 'Unknown Country',
      coordinates: {
        latitude: getLatitudeFromCoordinates(weather.location?.coordinates),
        longitude: getLongitudeFromCoordinates(weather.location?.coordinates)
      }
    },
    summary: generateWeatherSummary(weather, language),
    current: {
      timestamp: weather.current?.timestamp || new Date().toISOString(),
      temperature: weather.current?.temperature || 0,
      apparentTemperature: weather.current?.apparentTemperature || weather.current?.temperature || 0,
      condition: weather.current?.weatherCondition || 'Unknown',
      humidity: weather.current?.relativeHumidity || 0,
      pressure: {
        msl: weather.current?.pressure?.msl || 0,
        surface: weather.current?.pressure?.surface || 0
      },
      wind: {
        speed: weather.current?.wind?.speed || 0,
        direction: weather.current?.wind?.direction || 0,
        directionDescription: weather.current?.windDirectionDescription || 'Unknown',
        gusts: weather.current?.wind?.gusts || 0
      },
      visibility: weather.current?.visibility || 0,
      uvIndex: weather.current?.uvIndex || 0,
      cloudCover: weather.current?.cloudCover || 0,
      precipitation: weather.current?.precipitation || 0,
      isDay: weather.current?.isDay !== undefined ? weather.current.isDay : true
    }
  };

  // Add forecast data if requested
  if (includeForecast && weather.dailyForecast && weather.dailyForecast.length > 0) {
    reportData.forecast = {
      daily: weather.dailyForecast.slice(0, forecastDays).map(day => ({
        date: day?.date || new Date().toISOString(),
        weatherCode: day?.weatherCode || 0,
        temperature: {
          max: day?.temperature?.max || 0,
          min: day?.temperature?.min || 0
        },
        precipitation: {
          total: day?.precipitation?.total || 0,
          probability: day?.precipitation?.probability || 0
        },
        wind: {
          speed: day?.wind?.speed || 0,
          direction: day?.wind?.direction || 0
        },
        uvIndex: day?.uvIndex || 0,
        sunrise: day?.sunrise || '',
        sunset: day?.sunset || ''
      })),
      hourly: weather.hourlyForecast ? weather.hourlyForecast.slice(0, 24).map(hour => ({
        timestamp: hour?.timestamp || new Date().toISOString(),
        temperature: hour?.temperature || 0,
        precipitation: hour?.precipitation || 0,
        humidity: hour?.relativeHumidity || 0,
        windSpeed: hour?.windSpeed || 0
      })) : []
    };
  }

  // Add alerts if requested
  if (includeAlerts && weather.alerts && weather.alerts.length > 0) {
    reportData.alerts = weather.alerts
      .filter(alert => alert.isActive && new Date(alert.endTime) > new Date())
      .map(alert => ({
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        startTime: alert.startTime,
        endTime: alert.endTime
      }));
  }

  // Add risk assessment
  reportData.riskAssessment = generateRiskAssessment(weather);

  // Add recommendations
  reportData.recommendations = generateRecommendations(weather, language);

  return reportData;
};

/**
 * Generate weather summary text
 */
const generateWeatherSummary = (weather, language) => {
  const temp = Math.round(weather.current?.temperature || 0);
  const condition = weather.current?.weatherCondition || 'Unknown';
  const location = weather.location?.name || 'Unknown Location';
  const maxTemp = Math.round(weather.dailyForecast?.[0]?.temperature?.max || temp);
  
  if (language === 'hi') {
    return `${location} में वर्तमान मौसम ${temp}°C है और ${condition} की स्थिति है। आज का अधिकतम तापमान ${maxTemp}°C तक पहुंच सकता है।`;
  }
  
  return `Current weather in ${location} is ${temp}°C with ${condition} conditions. Today's maximum temperature may reach up to ${maxTemp}°C.`;
};

/**
 * Generate risk assessment
 */
const generateRiskAssessment = (weather) => {
  const risks = [];
  const current = weather?.current || {};
  const temperature = current.temperature || 0;
  const windSpeed = current.wind?.speed || 0;
  const precipitation = current.precipitation || 0;
  
  // Temperature risks
  if (temperature > 40) {
    risks.push({
      type: 'heat_risk',
      level: temperature > 45 ? 'extreme' : 'high',
      description: 'High temperature poses risk of heat stroke and dehydration'
    });
  } else if (temperature < 5) {
    risks.push({
      type: 'cold_risk',
      level: temperature < 0 ? 'extreme' : 'high',
      description: 'Low temperature poses risk of hypothermia and frostbite'
    });
  }
  
  // Wind risks
  if (windSpeed > 50) {
    risks.push({
      type: 'wind_risk',
      level: windSpeed > 80 ? 'extreme' : 'high',
      description: 'Strong winds may cause property damage and transportation disruption'
    });
  }
  
  // Precipitation risks
  if (precipitation > 25) {
    risks.push({
      type: 'precipitation_risk',
      level: precipitation > 50 ? 'extreme' : 'high',
      description: 'Heavy precipitation may cause flooding and transportation issues'
    });
  }
  
  return {
    overallRisk: risks.length > 0 ? 
      risks.some(r => r.level === 'extreme') ? 'extreme' :
      risks.some(r => r.level === 'high') ? 'high' : 'moderate'
      : 'low',
    risks
  };
};

/**
 * Generate recommendations
 */
const generateRecommendations = (weather, language) => {
  const recommendations = [];
  const current = weather?.current || {};
  const temperature = current.temperature || 0;
  const windSpeed = current.wind?.speed || 0;
  const precipitation = current.precipitation || 0;
  
  if (temperature > 35) {
    recommendations.push(language === 'hi' ? 
      'बाहर निकलने से बचें और पर्याप्त पानी पिएं' : 
      'Avoid outdoor activities and stay hydrated'
    );
  }
  
  if (windSpeed > 40) {
    recommendations.push(language === 'hi' ? 
      'तेज़ हवाओं के कारण सावधान रहें' : 
      'Exercise caution due to strong winds'
    );
  }
  
  if (precipitation > 10) {
    recommendations.push(language === 'hi' ? 
      'छाता ले जाएं और सड़क पर सावधानी बरतें' : 
      'Carry an umbrella and exercise road safety'
    );
  }
  
  if (recommendations.length === 0) {
    recommendations.push(language === 'hi' ? 
      'मौसम अनुकूल है, सामान्य गतिविधियां जारी रखें' : 
      'Weather conditions are favorable for normal activities'
    );
  }
  
  return recommendations;
};

/**
 * Generate PDF Report
 */
const generatePDFReport = async (req, res, reportData) => {
  try {
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="weather-report-${Date.now()}.pdf"`);
    
    // Handle errors and end events properly
    doc.on('error', (error) => {
      logger.error('PDF document error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Failed to generate PDF report',
          code: 'PDF_GENERATION_ERROR'
        });
      }
    });
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Weather Report', 50, 50);
    doc.fontSize(12).text(`Generated on: ${new Date(reportData.metadata.generatedAt).toLocaleString()}`, 50, 80);
    
    // Add location info
    doc.fontSize(16).text('Location Information', 50, 120);
    doc.fontSize(12)
      .text(`Location: ${reportData.location?.name || 'Unknown'}`, 50, 140)
      .text(`State: ${reportData.location?.state || 'N/A'}`, 50, 155)
      .text(`Coordinates: ${(reportData.location?.coordinates?.latitude || 0).toFixed(4)}, ${(reportData.location?.coordinates?.longitude || 0).toFixed(4)}`, 50, 170);
    
    // Add current conditions - Enhanced
    doc.fontSize(16).text('Current Weather Conditions', 50, 200);
    const current = reportData.current || {};
    
    // Basic weather information
    doc.fontSize(12)
      .text(`Temperature: ${current.temperature || 0}°C (feels like ${current.apparentTemperature || current.temperature || 0}°C)`, 50, 220)
      .text(`Condition: ${current.condition || 'Unknown'}`, 50, 235)
      .text(`Humidity: ${current.humidity || 0}%`, 50, 250)
      .text(`Wind: ${current.wind?.speed || 0} km/h ${current.wind?.directionDescription || 'Unknown'} (gusts: ${current.wind?.gusts || 0} km/h)`, 50, 265)
      .text(`Pressure: ${current.pressure?.msl || 0} hPa (surface: ${current.pressure?.surface || 0} hPa)`, 50, 280)
      .text(`Visibility: ${current.visibility ? (current.visibility / 1000).toFixed(1) + ' km' : 'N/A'}`, 50, 295);

    // Enhanced weather data
    doc.fontSize(14).text('Atmospheric & Solar Data', 50, 325);
    doc.fontSize(12)
      .text(`UV Index: ${current.uvIndex || 0} (Clear Sky: ${current.uvIndexClearSky || 0})`, 50, 345)
      .text(`Cloud Cover: ${current.cloudCover || 0}%`, 50, 360)
      .text(`Wet Bulb Temperature: ${current.wetBulbTemperature || 0}°C`, 50, 375)
      .text(`Sunshine Duration: ${current.sunshineDuration || 0} minutes`, 50, 390);

    // Solar radiation data
    if (current.solarRadiation) {
      doc.fontSize(14).text('Solar Radiation', 50, 415);
      doc.fontSize(12)
        .text(`Shortwave: ${current.solarRadiation.shortwave || 0} W/m²`, 50, 435)
        .text(`Direct: ${current.solarRadiation.direct || 0} W/m²`, 50, 450)
        .text(`Diffuse: ${current.solarRadiation.diffuse || 0} W/m²`, 50, 465)
        .text(`Direct Normal Irradiance: ${current.solarRadiation.directNormal || 0} W/m²`, 50, 480);
    }
    
    // Add summary
    doc.fontSize(16).text('Weather Summary', 50, 510);
    doc.fontSize(12).text(reportData.summary, 50, 530, { width: 500 });
    
    // Add risk assessment
    let yPos = 570;
    if (reportData.riskAssessment) {
      doc.fontSize(16).text('Risk Assessment', 50, yPos);
      yPos += 20;
      doc.fontSize(12).text(`Overall Risk Level: ${reportData.riskAssessment.overallRisk.toUpperCase()}`, 50, yPos);
      yPos += 20;
      
      reportData.riskAssessment.risks.forEach(risk => {
        doc.text(`• ${risk.description} (${risk.level} risk)`, 50, yPos);
        yPos += 15;
      });
      yPos += 10;
    }
    
    // Add recommendations
    if (reportData.recommendations && reportData.recommendations.length > 0) {
      doc.fontSize(16).text('Recommendations', 50, yPos + 20);
      yPos += 45;
      reportData.recommendations.forEach(rec => {
        doc.fontSize(12).text(`• ${rec}`, 50, yPos);
        yPos += 15;
      });
    }
    
    // Add alerts if present
    if (reportData.alerts && reportData.alerts.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Active Weather Alerts', 50, 50);
      let alertYPos = 75;
      
      reportData.alerts.forEach(alert => {
        doc.fontSize(14).fillColor('red').text(`${alert.severity.toUpperCase()}: ${alert.title}`, 50, alertYPos);
        doc.fontSize(12).fillColor('black').text(alert.description, 50, alertYPos + 20, { width: 500 });
        doc.text(`Valid until: ${new Date(alert.endTime).toLocaleString()}`, 50, alertYPos + 50);
        alertYPos += 80;
      });
    }
    
    // Add weather charts
    if (reportData.forecast && reportData.forecast.hourly && reportData.forecast.hourly.length > 0) {
      doc.addPage();
      doc.fontSize(20).text('Weather Charts & Forecasts', 50, 50);
      
      try {
        // Temperature chart
        const tempChart = await createTemperatureChart(reportData.forecast.hourly);
        doc.image(tempChart, 50, 90, { width: 500 });
        
        // Add new page for more charts
        doc.addPage();
        
        // Precipitation chart
        const precipChart = await createPrecipitationChart(reportData.forecast.hourly);
        doc.image(precipChart, 50, 50, { width: 500 });
        
        // UV and Solar radiation chart
        const uvChart = await createUVAndSolarChart(reportData.forecast.hourly);
        doc.image(uvChart, 50, 470, { width: 500 });
        
        // Add another page for wind chart
        doc.addPage();
        
        // Wind chart
        const windChart = await createWindChart(reportData.forecast.hourly);
        doc.image(windChart, 50, 50, { width: 500 });
        
      } catch (chartError) {
        logger.error('Error generating charts:', chartError);
        doc.fontSize(12).text('Charts could not be generated at this time.', 50, 100);
      }
    }

    // Add detailed forecast table
    if (reportData.forecast && reportData.forecast.daily.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('7-Day Detailed Forecast', 50, 50);
      let forecastYPos = 80;
      
      reportData.forecast.daily.forEach((day, index) => {
        const date = new Date(day.date).toLocaleDateString();
        doc.fontSize(14).text(`Day ${index + 1}: ${date}`, 50, forecastYPos);
        doc.fontSize(11)
          .text(`Temperature: ${day.temperature.max}°C / ${day.temperature.min}°C`, 50, forecastYPos + 20)
          .text(`Precipitation: ${day.precipitation.total}mm (${day.precipitation.probability}% chance)`, 50, forecastYPos + 35)
          .text(`Wind: ${day.wind.speed}km/h`, 50, forecastYPos + 50)
          .text(`UV Index: ${day.uvIndex}`, 50, forecastYPos + 65);
        forecastYPos += 85;
        
        // Add page break if needed
        if (forecastYPos > 700) {
          doc.addPage();
          forecastYPos = 50;
        }
      });
    }
    
    // Finalize the PDF
    doc.end();
    
  } catch (error) {
    logger.error('Error generating PDF report:', error);
    throw error;
  }
};

/**
 * Generate Excel Report
 */
const generateExcelReport = async (req, res, reportData) => {
  try {
    const workbook = new ExcelJS.Workbook();
    
    // Create worksheets
    const summarySheet = workbook.addWorksheet('Weather Summary');
    const currentSheet = workbook.addWorksheet('Current Conditions');
    
    // Summary Sheet
    summarySheet.columns = [
      { header: 'Parameter', key: 'parameter', width: 25 },
      { header: 'Value', key: 'value', width: 40 }
    ];
    
    summarySheet.addRows([
      { parameter: 'Report Generated', value: new Date(reportData.metadata.generatedAt).toLocaleString() },
      { parameter: 'Location', value: reportData.location.name },
      { parameter: 'State', value: reportData.location.state || 'N/A' },
      { parameter: 'Coordinates', value: `${reportData.location.coordinates.latitude.toFixed(4)}, ${reportData.location.coordinates.longitude.toFixed(4)}` },
      { parameter: 'Data Freshness', value: reportData.metadata.dataFreshness },
      { parameter: 'Summary', value: reportData.summary }
    ]);
    
    // Current Conditions Sheet
    currentSheet.columns = [
      { header: 'Parameter', key: 'parameter', width: 25 },
      { header: 'Value', key: 'value', width: 20 },
      { header: 'Unit', key: 'unit', width: 15 }
    ];
    
    const current = reportData.current;
    currentSheet.addRows([
      { parameter: 'Temperature', value: current.temperature, unit: '°C' },
      { parameter: 'Feels Like', value: current.apparentTemperature, unit: '°C' },
      { parameter: 'Condition', value: current.condition, unit: '' },
      { parameter: 'Humidity', value: current.humidity, unit: '%' },
      { parameter: 'Pressure (MSL)', value: current.pressure.msl, unit: 'hPa' },
      { parameter: 'Wind Speed', value: current.wind.speed, unit: 'km/h' },
      { parameter: 'Wind Direction', value: current.wind.directionDescription, unit: '' },
      { parameter: 'Wind Gusts', value: current.wind.gusts, unit: 'km/h' },
      { parameter: 'Visibility', value: current.visibility ? (current.visibility / 1000).toFixed(1) : 'N/A', unit: 'km' },
      { parameter: 'UV Index', value: current.uvIndex || 'N/A', unit: '' },
      { parameter: 'Cloud Cover', value: current.cloudCover, unit: '%' },
      { parameter: 'Precipitation', value: current.precipitation, unit: 'mm' }
    ]);
    
    // Add forecast sheet if data exists
    if (reportData.forecast && reportData.forecast.daily.length > 0) {
      const forecastSheet = workbook.addWorksheet('7-Day Forecast');
      forecastSheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Max Temp (°C)', key: 'maxTemp', width: 15 },
        { header: 'Min Temp (°C)', key: 'minTemp', width: 15 },
        { header: 'Precipitation (mm)', key: 'precipitation', width: 18 },
        { header: 'Rain Probability (%)', key: 'probability', width: 18 },
        { header: 'Wind Speed (km/h)', key: 'windSpeed', width: 18 }
      ];
      
      reportData.forecast.daily.forEach(day => {
        forecastSheet.addRow({
          date: new Date(day.date).toLocaleDateString(),
          maxTemp: day.temperature.max,
          minTemp: day.temperature.min,
          precipitation: day.precipitation.total,
          probability: day.precipitation.probability,
          windSpeed: day.wind.speed
        });
      });
    }
    
    // Add alerts sheet if data exists
    if (reportData.alerts && reportData.alerts.length > 0) {
      const alertsSheet = workbook.addWorksheet('Weather Alerts');
      alertsSheet.columns = [
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Severity', key: 'severity', width: 12 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Description', key: 'description', width: 50 },
        { header: 'Start Time', key: 'startTime', width: 20 },
        { header: 'End Time', key: 'endTime', width: 20 }
      ];
      
      reportData.alerts.forEach(alert => {
        alertsSheet.addRow({
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          startTime: new Date(alert.startTime).toLocaleString(),
          endTime: new Date(alert.endTime).toLocaleString()
        });
      });
    }
    
    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="weather-report-${Date.now()}.xlsx"`);
    
    // Write to response
    await workbook.xlsx.write(res);
    res.end();
    
  } catch (error) {
    logger.error('Error generating Excel report:', error);
    throw error;
  }
};

/**
 * Generate HTML Report
 */
const generateHTMLReport = async (req, res, reportData) => {
  try {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Report - ${reportData.location.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #007bff; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .info-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; }
        .alert { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .alert.high { background: #fff3cd; border-color: #ffeaa7; color: #856404; }
        .alert.extreme { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .forecast-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
        .forecast-card { background: #e9ecef; padding: 10px; text-align: center; border-radius: 5px; }
        .risk-badge { display: inline-block; padding: 5px 10px; border-radius: 15px; color: white; font-size: 12px; }
        .risk-low { background-color: #28a745; }
        .risk-moderate { background-color: #ffc107; color: #212529; }
        .risk-high { background-color: #fd7e14; }
        .risk-extreme { background-color: #dc3545; }
        .recommendations { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; }
        .recommendations ul { margin: 10px 0; padding-left: 20px; }
        @media print { body { background: white; } .container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Weather Report</h1>
            <p><strong>Location:</strong> ${escapeHtml(reportData.location?.name || 'Unknown')}, ${escapeHtml(reportData.location?.state || '')}</p>
            <p><strong>Generated:</strong> ${escapeHtml(new Date(reportData.metadata?.generatedAt || new Date()).toLocaleString())}</p>
            <p><strong>Data Freshness:</strong> ${escapeHtml(reportData.metadata?.dataFreshness || 'Unknown')}</p>
        </div>

        <div class="section">
            <h2>Current Weather Conditions</h2>
            <div class="info-grid">
                <div class="info-card">
                    <h4>Temperature</h4>
                    <p><strong>${escapeHtml(reportData.current?.temperature || 0)}°C</strong></p>
                    <p>Feels like ${escapeHtml(reportData.current?.apparentTemperature || reportData.current?.temperature || 0)}°C</p>
                </div>
                <div class="info-card">
                    <h4>Conditions</h4>
                    <p><strong>${escapeHtml(reportData.current?.condition || 'Unknown')}</strong></p>
                    <p>Humidity: ${escapeHtml(reportData.current?.humidity || 0)}%</p>
                </div>
                <div class="info-card">
                    <h4>Wind</h4>
                    <p><strong>${escapeHtml(reportData.current?.wind?.speed || 0)} km/h</strong></p>
                    <p>Direction: ${escapeHtml(reportData.current?.wind?.directionDescription || 'Unknown')}</p>
                    <p>Gusts: ${escapeHtml(reportData.current?.wind?.gusts || 'N/A')} km/h</p>
                </div>
                <div class="info-card">
                    <h4>Atmospheric</h4>
                    <p>Pressure: ${escapeHtml(reportData.current?.pressure?.msl || 0)} hPa</p>
                    <p>Surface Pressure: ${escapeHtml(reportData.current?.pressure?.surface || 0)} hPa</p>
                    <p>Visibility: ${reportData.current?.visibility ? escapeHtml((reportData.current.visibility / 1000).toFixed(1)) + ' km' : 'N/A'}</p>
                    <p>Cloud Cover: ${escapeHtml(reportData.current?.cloudCover || 0)}%</p>
                </div>
                <div class="info-card">
                    <h4>UV & Solar</h4>
                    <p>UV Index: ${escapeHtml(reportData.current?.uvIndex || 'N/A')}</p>
                    <p>UV Clear Sky: ${escapeHtml(reportData.current?.uvIndexClearSky || 'N/A')}</p>
                    <p>Sunshine: ${escapeHtml(reportData.current?.sunshineDuration || 0)} min</p>
                    <p>Wet Bulb: ${escapeHtml(reportData.current?.wetBulbTemperature || 0)}°C</p>
                </div>
                <div class="info-card">
                    <h4>Solar Radiation</h4>
                    <p>Shortwave: ${escapeHtml(reportData.current?.solarRadiation?.shortwave || 0)} W/m²</p>
                    <p>Direct: ${escapeHtml(reportData.current?.solarRadiation?.direct || 0)} W/m²</p>
                    <p>Diffuse: ${escapeHtml(reportData.current?.solarRadiation?.diffuse || 0)} W/m²</p>
                    <p>DNI: ${escapeHtml(reportData.current?.solarRadiation?.directNormal || 0)} W/m²</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Weather Summary</h2>
            <p>${escapeHtml(reportData.summary || 'No summary available')}</p>
        </div>

        ${reportData.riskAssessment ? `
        <div class="section">
            <h2>Risk Assessment</h2>
            <p>Overall Risk Level: <span class="risk-badge risk-${escapeHtml(reportData.riskAssessment?.overallRisk || 'low')}">${escapeHtml((reportData.riskAssessment?.overallRisk || 'low').toUpperCase())}</span></p>
            ${(reportData.riskAssessment?.risks || []).map(risk => `
                <div class="alert ${escapeHtml(risk?.level || 'low')}">
                    <strong>${escapeHtml((risk?.type || '').replace('_', ' ').toUpperCase())}:</strong> ${escapeHtml(risk?.description || '')}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${reportData.recommendations && reportData.recommendations.length > 0 ? `
        <div class="section">
            <h2>Recommendations</h2>
            <div class="recommendations">
                <ul>
                    ${(reportData.recommendations || []).map(rec => `<li>${escapeHtml(rec || '')}</li>`).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        ${reportData.alerts && reportData.alerts.length > 0 ? `
        <div class="section">
            <h2>Active Weather Alerts</h2>
            ${reportData.alerts.map(alert => `
                <div class="alert ${alert.severity}">
                    <h4>${alert.severity.toUpperCase()}: ${alert.title}</h4>
                    <p>${alert.description}</p>
                    <p><small>Valid until: ${new Date(alert.endTime).toLocaleString()}</small></p>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${reportData.forecast && reportData.forecast.daily.length > 0 ? `
        <div class="section">
            <h2>7-Day Forecast</h2>
            <div class="forecast-grid">
                ${reportData.forecast.daily.map((day, index) => `
                    <div class="forecast-card">
                        <h5>${index === 0 ? 'Today' : new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</h5>
                        <p>${new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                        <p><strong>${day.temperature.max}° / ${day.temperature.min}°</strong></p>
                        <p>${day.precipitation.total}mm rain</p>
                        <p>${day.precipitation.probability}% chance</p>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <div class="section">
            <p><small>Report generated by Disaster Management System • Data provided by Open-Meteo API</small></p>
        </div>
    </div>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
    
  } catch (error) {
    logger.error('Error generating HTML report:', error);
    throw error;
  }
};

/**
 * Save generated weather report to database
 */
exports.saveWeatherReport = async (req, res) => {
  try {
    const { 
      latitude, 
      longitude, 
      reportData, 
      format = 'json',
      title,
      location_name,
      state,
      district,
      language = 'en',
      includeAlerts = true,
      includeForecast = true,
      forecastDays = 7
    } = req.body;

    if (!latitude || !longitude || !reportData) {
      return res.status(400).json({
        success: false,
        message: 'Latitude, longitude, and reportData are required',
        code: 'MISSING_REQUIRED_FIELDS'
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

    // Create new weather report
    const weatherReport = new WeatherReport({
      title: title || `Weather Report - ${location_name || 'Unknown Location'} (${new Date().toLocaleDateString()})`,
      location: {
        name: location_name || `Location (${lat}, ${lon})`,
        coordinates: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        latitude: lat,
        longitude: lon,
        state: state || 'Unknown',
        district: district || 'Unknown',
        country: 'India'
      },
      reportData,
      format,
      language,
      options: {
        includeAlerts,
        includeForecast,
        forecastDays: parseInt(forecastDays)
      },
      dataSource: reportData.metadata?.dataSource || {
        provider: 'Open-Meteo',
        lastUpdated: new Date(),
        timezone: 'Asia/Kolkata'
      }
    });

    await weatherReport.save();
    
    logger.info(`Weather report saved with ID: ${weatherReport._id} for location: ${lat}, ${lon}`);

    res.status(201).json({
      success: true,
      message: 'Weather report saved successfully',
      data: {
        reportId: weatherReport._id,
        title: weatherReport.title,
        location: weatherReport.location,
        generatedAt: weatherReport.generatedAt,
        format: weatherReport.format,
        summary: weatherReport.summary
      }
    });

  } catch (error) {
    logger.error('Error in saveWeatherReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save weather report',
      code: 'SAVE_REPORT_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get list of saved weather reports
 */
exports.getSavedReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      latitude, 
      longitude, 
      state, 
      format,
      days = 30 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = { isActive: true };
    
    // Filter by date range
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));
    query.generatedAt = { $gte: dateThreshold };

    // Filter by location proximity
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      if (!isNaN(lat) && !isNaN(lon)) {
        query['location.coordinates'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            $maxDistance: 50000 // 50km radius
          }
        };
      }
    }

    // Filter by state
    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    // Filter by format
    if (format) {
      query.format = format;
    }

    const reports = await WeatherReport.find(query)
      .select('title location format generatedAt summary accessCount lastAccessed')
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await WeatherReport.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Saved reports retrieved successfully',
      data: reports,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1
      }
    });

  } catch (error) {
    logger.error('Error in getSavedReports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved reports',
      code: 'FETCH_SAVED_REPORTS_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a specific saved weather report
 */
exports.getSavedReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await WeatherReport.findById(id);
    
    if (!report || !report.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Weather report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    // Increment access count
    await report.incrementAccess();

    res.status(200).json({
      success: true,
      message: 'Weather report retrieved successfully',
      data: report
    });

  } catch (error) {
    logger.error('Error in getSavedReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve weather report',
      code: 'FETCH_REPORT_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a saved weather report
 */
exports.deleteSavedReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await WeatherReport.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Weather report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }

    // Soft delete
    report.isActive = false;
    await report.save();
    
    logger.info(`Weather report deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Weather report deleted successfully'
    });

  } catch (error) {
    logger.error('Error in deleteSavedReport:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete weather report',
      code: 'DELETE_REPORT_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get report generation status and metadata
 */
exports.getReportMetadata = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
        code: 'MISSING_COORDINATES'
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const weather = await Weather.findByLocation(lat, lon);
    
    if (!weather) {
      return res.status(404).json({
        success: false,
        message: 'No weather data found for this location',
        code: 'WEATHER_NOT_FOUND'
      });
    }

    // Check for recent saved reports in this location
    const recentReports = await WeatherReport.findByLocation(lat, lon)
      .limit(5)
      .select('title generatedAt format summary');

    const metadata = {
      dataAvailable: true,
      lastUpdated: weather.dataSource.lastUpdated,
      dataFreshness: weather.dataFreshness,
      location: weather.location,
      activeAlerts: weather.activeAlertsCount,
      forecastDays: weather.dailyForecast ? weather.dailyForecast.length : 0,
      supportedFormats: ['json', 'pdf', 'excel', 'html'],
      supportedLanguages: ['en', 'hi'],
      recentReports: recentReports.length
    };

    res.status(200).json({
      success: true,
      message: 'Report metadata retrieved successfully',
      data: metadata
    });

  } catch (error) {
    logger.error('Error in getReportMetadata:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve report metadata',
      code: 'METADATA_FETCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
