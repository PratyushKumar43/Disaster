"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cloud,
  CloudRain,
  Sun,
  Moon,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Calendar,
  Clock,
  Navigation,
  Umbrella,
  Snowflake,
  Zap,
  Info,
  Activity,
  Search,
  Sunrise,
  Sunset
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import dynamic from 'next/dynamic';
import { openMeteoAPI, weatherDescriptions, aqiDescriptions } from "../../lib/openMeteoApi";
import type { WeatherData, AirQualityData } from "../../lib/openMeteoApi";
import WindyForecastEmbed from "./WindyForecastEmbed";
import WeatherReportGenerator from "./WeatherReportGenerator";

// Dynamic imports for performance
const WeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
    </div>
  )
});

// Weather background images from Unsplash
const WEATHER_IMAGES = {
  clear_day: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  clear_night: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  cloudy: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  rainy: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  snowy: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  foggy: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  stormy: 'https://images.unsplash.com/photo-1594736797933-d0282ba8c3d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  hot: 'https://images.unsplash.com/photo-1504370805625-d32c54b16100?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  cold: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  drizzle: 'https://images.unsplash.com/photo-1555424221-6f5c2b61b5e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  mist: 'https://images.unsplash.com/photo-1541919329513-35f7af297129?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
};

// Helper functions
const getWeatherImage = (weatherCode: number, temperature: number, isDay: boolean) => {
  // Temperature-based overrides
  if (temperature > 35) return WEATHER_IMAGES.hot;
  if (temperature < 0) return WEATHER_IMAGES.cold;

  switch (weatherCode) {
    case 0:
      return isDay ? WEATHER_IMAGES.clear_day : WEATHER_IMAGES.clear_night;
    case 1:
    case 2:
    case 3:
      return WEATHER_IMAGES.cloudy;
    case 45:
    case 48:
      return WEATHER_IMAGES.foggy;
    case 51:
    case 53:
    case 55:
      return WEATHER_IMAGES.drizzle;
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return WEATHER_IMAGES.rainy;
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return WEATHER_IMAGES.snowy;
    case 95:
    case 96:
    case 99:
      return WEATHER_IMAGES.thunderstorm;
    default:
      return isDay ? WEATHER_IMAGES.clear_day : WEATHER_IMAGES.clear_night;
  }
};

const getWeatherIcon = (weatherCode: number, isDay: boolean, className = "h-8 w-8") => {
  switch (weatherCode) {
    case 0:
      return isDay ? 
        <Sun className={`${className} text-yellow-500`} /> : 
        <Moon className={`${className} text-blue-200`} />;
    case 1:
    case 2:
    case 3:
      return <Cloud className={`${className} text-gray-500`} />;
    case 45:
    case 48:
      return <Eye className={`${className} text-gray-400`} />;
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return <CloudRain className={`${className} text-blue-500`} />;
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return <Snowflake className={`${className} text-blue-200`} />;
    case 95:
    case 96:
    case 99:
      return <Zap className={`${className} text-purple-500`} />;
    default:
      return isDay ? 
        <Sun className={`${className} text-yellow-500`} /> : 
        <Moon className={`${className} text-blue-200`} />;
  }
};

// Location search component
function LocationSearch({ onLocationSelect, isDark }: {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
  isDark: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await openMeteoAPI.searchLocations(query);
      setResults(data.results || []);
    } catch (error) {
      console.error('Location search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search locations..."
          className={`pl-9 pr-4 py-2 w-64 rounded-lg border text-sm ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
          } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-20 max-h-64 overflow-y-auto ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          {results.map((location, index) => (
            <button
              key={index}
              onClick={() => {
                onLocationSelect(location.latitude, location.longitude, location.name);
                setSearchTerm('');
                setResults([]);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <div className="font-medium">{location.name}</div>
              <div className="text-sm text-gray-500">
                {location.admin1 && `${location.admin1}, `}{location.country}
              </div>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// Current weather hero section
function CurrentWeatherHero({ weather, airQuality, location, isDark }: {
  weather: WeatherData;
  airQuality?: AirQualityData;
  location: { name: string; lat: number; lon: number };
  isDark: boolean;
}) {
  const backgroundImage = getWeatherImage(
    weather.current.weather_code,
    weather.current.temperature_2m,
    !!weather.current.is_day
  );

  return (
    <motion.div
      className="relative h-96 rounded-3xl overflow-hidden"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Gradient overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
      <div className="relative z-10 h-full flex items-center justify-center text-center text-white p-8">
        <div>
          <motion.div
            className="flex items-center justify-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {getWeatherIcon(weather.current.weather_code, !!weather.current.is_day, "h-16 w-16")}
          </motion.div>
          
          <motion.h1
            className="text-6xl font-bold mb-2 drop-shadow-lg"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {Math.round(weather.current.temperature_2m)}°C
          </motion.h1>
          
          <motion.p
            className="text-xl mb-2 drop-shadow-md"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {weatherDescriptions[weather.current.weather_code] || 'Unknown'}
          </motion.p>
          
          <motion.p
            className="text-lg opacity-90 mb-4 drop-shadow-md"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Feels like {Math.round(weather.current.apparent_temperature)}°C
          </motion.p>
          
          <motion.div
            className="flex items-center justify-center space-x-2 drop-shadow-md"
            style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{location.name}</span>
          </motion.div>

          {airQuality && (
            <motion.div
              className="mt-4 inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 drop-shadow-md"
              style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Activity className="h-4 w-4" />
              <span className="text-sm">
                Air Quality: {aqiDescriptions[Math.round(airQuality.current.european_aqi / 20)]?.label || 'Unknown'}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Weather metrics grid
function WeatherMetrics({ weather, airQuality, isDark }: {
  weather: WeatherData;
  airQuality?: AirQualityData;
  isDark: boolean;
}) {
  const metrics = [
    {
      icon: Wind,
      label: 'Wind Speed',
      value: `${Math.round(weather.current.wind_speed_10m)} km/h`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: `${Math.round(weather.current.relative_humidity_2m)}%`,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900'
    },
    {
      icon: Gauge,
      label: 'Pressure',
      value: `${Math.round(weather.current.pressure_msl)} hPa`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      icon: Eye,
      label: 'Visibility',
      value: `${Math.round(weather.current.visibility / 1000)} km`,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900'
    },
    {
      icon: Sun,
      label: 'UV Index',
      value: Math.round(weather.current.uv_index || 0).toString(),
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      icon: Cloud,
      label: 'Cloud Cover',
      value: `${Math.round(weather.current.cloud_cover)}%`,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-900'
    },
    {
      icon: Umbrella,
      label: 'Precipitation',
      value: `${weather.current.precipitation.toFixed(1)} mm`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    }
  ];

  // Add air quality metric if available
  if (airQuality) {
    metrics.push({
      icon: Activity,
      label: 'Air Quality',
      value: aqiDescriptions[Math.round(airQuality.current.european_aqi / 20)]?.label || 'Unknown',
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900'
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          className={`p-4 rounded-xl border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } shadow-lg`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{metric.label}</p>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {metric.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Temperature chart
function TemperatureChart({ weather, isDark }: {
  weather: WeatherData;
  isDark: boolean;
}) {
  const next24Hours = weather.hourly.time.slice(0, 24).map((time, index) => ({
    time: new Date(time).toLocaleTimeString([], { hour: '2-digit' }),
    temperature: Math.round(weather.hourly.temperature_2m[index]),
    feelsLike: Math.round(weather.hourly.apparent_temperature[index])
  }));

  return (
    <motion.div
      className={`p-6 rounded-3xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-2xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        24-Hour Temperature Forecast
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={next24Hours}>
          <defs>
            <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="time" 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              border: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
              borderRadius: '8px',
              color: isDark ? '#ffffff' : '#000000'
            }}
          />
          <Area
            type="monotone"
            dataKey="temperature"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#temperatureGradient)"
          />
          <Area
            type="monotone"
            dataKey="feelsLike"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// 7-day forecast
function WeeklyForecast({ weather, isDark }: {
  weather: WeatherData;
  isDark: boolean;
}) {
  const weeklyData = weather.daily.time.map((date, index) => ({
    date,
    weatherCode: weather.daily.weather_code[index],
    maxTemp: Math.round(weather.daily.temperature_2m_max[index]),
    minTemp: Math.round(weather.daily.temperature_2m_min[index]),
    precipitation: weather.daily.precipitation_sum[index],
    uvIndex: weather.daily.uv_index_max[index]
  }));

  return (
    <motion.div
      className={`p-6 rounded-3xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-2xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        7-Day Forecast
      </h3>
      
      <div className="space-y-4">
        {weeklyData.map((day, index) => (
          <motion.div
            key={index}
            className={`p-4 rounded-xl ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            } hover:shadow-lg transition-all duration-300`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center min-w-16">
                  <p className="text-sm text-gray-500">
                    {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                
                {getWeatherIcon(day.weatherCode, true, "h-8 w-8")}
                
                <div className="flex-1">
                  <p className="text-sm text-gray-500">
                    {weatherDescriptions[day.weatherCode] || 'Unknown'}
                  </p>
                  {day.precipitation > 0 && (
                    <p className="text-xs text-blue-500">
                      {day.precipitation.toFixed(1)}mm rain
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {day.maxTemp}°
                    </span>
                    <span className="text-gray-500">
                      {day.minTemp}°
                    </span>
                  </div>
                  {day.uvIndex > 0 && (
                    <p className="text-xs text-yellow-500">
                      UV {Math.round(day.uvIndex)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Main Modern Weather Dashboard
export default function ModernWeatherDashboard({ isDark }: { isDark: boolean }) {
  const [location, setLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const queryClient = useQueryClient();

  // Weather data query
  const { data: weather, isLoading: weatherLoading, refetch: refetchWeather } = useQuery({
    queryKey: ['weather', location?.lat, location?.lon],
    queryFn: () => location ? openMeteoAPI.getWeather(location.lat, location.lon) : null,
    enabled: !!location,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 15 * 60 * 1000 // Auto-refresh every 15 minutes
  });

  // Air quality data query
  const { data: airQuality } = useQuery({
    queryKey: ['airQuality', location?.lat, location?.lon],
    queryFn: () => location ? openMeteoAPI.getAirQuality(location.lat, location.lon) : null,
    enabled: !!location,
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use reverse geocoding
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const locationName = `${data.city || data.locality || 'Current Location'}${data.countryName ? `, ${data.countryName}` : ''}`;
            
            setLocation({ lat: latitude, lon: longitude, name: locationName });
          } catch (error) {
            setLocation({ lat: latitude, lon: longitude, name: 'Current Location' });
          }
        },
        () => {
          // Default location (New Delhi, India)
          setLocation({ lat: 28.6139, lon: 77.2090, name: 'New Delhi, India' });
        }
      );
    } else {
      setLocation({ lat: 28.6139, lon: 77.2090, name: 'New Delhi, India' });
    }
  }, []);

  const handleLocationSelect = (lat: number, lon: number, name: string) => {
    setLocation({ lat, lon, name });
  };

  const handleRefresh = () => {
    refetchWeather();
    queryClient.invalidateQueries({ queryKey: ['airQuality'] });
  };

  if (!location || weatherLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <motion.div 
              className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Loading weather data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Failed to load weather data
            </p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Weather Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Real-time weather data powered by Open-Meteo API
          </p>
        </motion.div>
        
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <LocationSearch onLocationSelect={handleLocationSelect} isDark={isDark} />
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
        </motion.div>
      </div>

      {/* Current Weather Hero */}
      <CurrentWeatherHero
        weather={weather}
        airQuality={airQuality || undefined}
        location={location}
        isDark={isDark}
      />

      {/* Weather Metrics */}
      <WeatherMetrics weather={weather} airQuality={airQuality || undefined} isDark={isDark} />

      {/* Charts and Forecasts */}
      <div className="grid lg:grid-cols-2 gap-8">
        <TemperatureChart weather={weather} isDark={isDark} />
        <WeeklyForecast weather={weather} isDark={isDark} />
      </div>

      {/* Weather Report Generator */}
      <WeatherReportGenerator location={location} isDark={isDark} />

      {/* Interactive Map */}
      <motion.div
        className={`p-6 rounded-3xl border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } shadow-2xl`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Interactive Weather Map
        </h3>
        <WeatherMap 
          latitude={location.lat} 
          longitude={location.lon} 
          isDark={isDark}
          weather={null}
        />
      </motion.div>

      {/* Detailed Windy Forecast */}
      <WindyForecastEmbed
        latitude={location.lat}
        longitude={location.lon}
        isDark={isDark}
        location={location}
      />
    </div>
  );
}