"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Cloud, MapPin, Calendar, BarChart3, Thermometer, Wind } from 'lucide-react';

interface WindyForecastEmbedProps {
  latitude: number;
  longitude: number;
  isDark: boolean;
  location?: { name: string };
}

export default function WindyForecastEmbed({ 
  latitude, 
  longitude, 
  isDark, 
  location 
}: WindyForecastEmbedProps) {
  const [selectedView, setSelectedView] = useState<'forecast' | 'map'>('forecast');
  
  // Generate the Windy embed URL based on the type
  const getWindyEmbedUrl = (type: 'forecast' | 'map') => {
    const baseUrl = 'https://embed.windy.com/embed.html';
    const params = new URLSearchParams({
      type: type,
      location: 'coordinates',
      detail: 'true',
      detailLat: latitude.toString(),
      detailLon: longitude.toString(),
      metricTemp: 'default',
      metricRain: 'default',
      metricWind: 'default',
      ...(type === 'map' && {
        overlay: 'wind',
        level: 'surface',
        zoom: '8'
      })
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  const forecastTypes = [
    {
      id: 'forecast' as const,
      label: 'Detailed Forecast',
      icon: BarChart3,
      description: 'Hourly weather forecast'
    },
    {
      id: 'map' as const,
      label: 'Weather Map',
      icon: Cloud,
      description: 'Interactive weather layers'
    }
  ];

  return (
    <motion.div
      className={`rounded-3xl border shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-green-900' : 'bg-green-100'
            }`}>
              <Cloud className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Detailed Weather Forecast
              </h3>
              {location && (
                <div className="flex items-center space-x-2 text-gray-500 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{location.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <span>Powered by</span>
              <strong className="text-blue-500">Windy.com</strong>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-2">
          {forecastTypes.map((type) => (
            <motion.button
              key={type.id}
              onClick={() => setSelectedView(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedView === type.id
                  ? 'bg-green-500 text-white shadow-lg'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <type.icon className="h-4 w-4" />
              <div className="text-left">
                <div>{type.label}</div>
                <div className={`text-xs opacity-75 ${
                  selectedView === type.id ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {type.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Windy Embed */}
      <div className="relative">
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <iframe
            src={getWindyEmbedUrl(selectedView)}
            width="100%"
            height={selectedView === 'forecast' ? '400' : '500'}
            frameBorder="0"
            className="w-full rounded-b-3xl"
            title={`Windy ${selectedView} for ${location?.name || 'Current Location'}`}
            loading="lazy"
            allowFullScreen
            style={{
              minHeight: selectedView === 'forecast' ? '400px' : '500px',
              border: 'none'
            }}
          />
        </motion.div>

        {/* Loading overlay */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center ${
            isDark ? 'bg-gray-800' : 'bg-white'
          } rounded-b-3xl`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{ pointerEvents: 'none' }}
        >
          <div className="text-center">
            <motion.div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading detailed forecast...
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className={`px-6 py-3 border-t ${
        isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4 text-gray-500">
            <div className="flex items-center space-x-1">
              <Thermometer className="h-3 w-3" />
              <span>Temperature</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="h-3 w-3" />
              <span>Wind</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>10-day forecast</span>
            </div>
          </div>
          <div className="text-gray-400">
            <span>Interactive • Real-time • Detailed</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

