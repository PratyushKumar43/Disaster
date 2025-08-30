// Open-Meteo API integration
export interface WeatherData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    uv_index: number;
    visibility: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    rain: number[];
    showers: number[];
    snowfall: number[];
    weather_code: number[];
    pressure_msl: number[];
    surface_pressure: number[];
    cloud_cover: number[];
    visibility: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    uv_index: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    daylight_duration: number[];
    sunshine_duration: number[];
    uv_index_max: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
}

export interface AirQualityData {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    pm10: number;
    pm2_5: number;
    carbon_monoxide: number;
    nitrogen_dioxide: number;
    sulphur_dioxide: number;
    ozone: number;
    aerosol_optical_depth: number;
    dust: number;
    uv_index: number;
    european_aqi: number;
    us_aqi: number;
  };
  hourly: {
    time: string[];
    pm10: number[];
    pm2_5: number[];
    carbon_monoxide: number[];
    nitrogen_dioxide: number[];
    sulphur_dioxide: number[];
    ozone: number[];
    aerosol_optical_depth: number[];
    dust: number[];
    uv_index: number[];
    european_aqi: number[];
    us_aqi: number[];
  };
}

class OpenMeteoAPI {
  private baseUrl = 'https://api.open-meteo.com/v1';
  private airQualityUrl = 'https://air-quality-api.open-meteo.com/v1';

  async getWeather(lat: number, lon: number): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'uv_index',
        'visibility'
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'pressure_msl',
        'surface_pressure',
        'cloud_cover',
        'visibility',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'uv_index',
        'is_day'
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'apparent_temperature_min',
        'sunrise',
        'sunset',
        'daylight_duration',
        'sunshine_duration',
        'uv_index_max',
        'precipitation_sum',
        'rain_sum',
        'showers_sum',
        'snowfall_sum',
        'precipitation_hours',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'wind_direction_10m_dominant'
      ].join(','),
      timezone: 'auto',
      forecast_days: '7'
    });

    const response = await fetch(`${this.baseUrl}/forecast?${params}`);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    return response.json();
  }

  async getAirQuality(lat: number, lon: number): Promise<AirQualityData> {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: [
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
        'aerosol_optical_depth',
        'dust',
        'uv_index',
        'european_aqi',
        'us_aqi'
      ].join(','),
      hourly: [
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
        'aerosol_optical_depth',
        'dust',
        'uv_index',
        'european_aqi',
        'us_aqi'
      ].join(','),
      timezone: 'auto',
      forecast_days: '7'
    });

    const response = await fetch(`${this.airQualityUrl}/air-quality?${params}`);
    if (!response.ok) {
      throw new Error(`Air Quality API error: ${response.statusText}`);
    }
    return response.json();
  }

  // Geocoding for location search
  async searchLocations(query: string) {
    const params = new URLSearchParams({
      name: query,
      count: '10',
      language: 'en',
      format: 'json'
    });

    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }
    return response.json();
  }
}

export const openMeteoAPI = new OpenMeteoAPI();

// Weather code descriptions mapping
export const weatherDescriptions: Record<number, string> = {
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

// Air quality index descriptions
export const aqiDescriptions: Record<number, { label: string; color: string }> = {
  1: { label: 'Good', color: '#22c55e' },
  2: { label: 'Fair', color: '#84cc16' },
  3: { label: 'Moderate', color: '#eab308' },
  4: { label: 'Poor', color: '#f97316' },
  5: { label: 'Very Poor', color: '#ef4444' }
};

