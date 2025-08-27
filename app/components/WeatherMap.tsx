"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    windyInit: (options: any, callback: (windyAPI: any) => void) => void;
    L: any;
  }
}

interface WeatherMapProps {
  latitude: number;
  longitude: number;
  isDark: boolean;
  weather?: any;
}

export default function WeatherMap({ latitude, longitude, isDark }: WeatherMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const windyAPIRef = useRef<any>(null);
  const windyDivId = "windy"; // Windy API specifically looks for this exact ID

  useEffect(() => {
    // Function to load script dynamically
    const loadScript = (src: string, id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    // Function to load CSS dynamically
    const loadCSS = (href: string, id: string): void => {
      if (document.getElementById(id)) return;

      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    const initializeWindyMap = async () => {
      try {
        // Load Leaflet CSS and JS first
        loadCSS('https://unpkg.com/leaflet@1.4.0/dist/leaflet.css', 'leaflet-css');
        await loadScript('https://unpkg.com/leaflet@1.4.0/dist/leaflet.js', 'leaflet-js');
        
        // Wait a bit for Leaflet to be fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Load Windy API
        await loadScript('https://api.windy.com/assets/map-forecast/libBoot.js', 'windy-api');

        if (!window.windyInit || !mapContainerRef.current) return;

        const windyApiKey = process.env.NEXT_PUBLIC_WINDY_API_KEY;
        
        if (!windyApiKey || windyApiKey === 'your_windy_api_key_here') {
          // Show message about API key requirement
          if (mapContainerRef.current) {
            mapContainerRef.current.innerHTML = `
              <div class="flex items-center justify-center h-full ${
                isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
              }">
                <div class="text-center p-8 max-w-md">
                  <div class="text-4xl mb-4">🔑</div>
                  <h3 class="text-lg font-semibold mb-2">Windy API Key Required</h3>
                  <p class="text-sm opacity-75 mb-4">To display the interactive weather map, please:</p>
                  <ol class="text-xs text-left space-y-2 mb-4">
                    <li>1. Get a free API key from <a href="https://api.windy.com/keys" target="_blank" class="text-blue-500 underline">api.windy.com/keys</a></li>
                    <li>2. Create a .env.local file in your project root</li>
                    <li>3. Add: NEXT_PUBLIC_WINDY_API_KEY=your_api_key</li>
                    <li>4. Restart the development server</li>
                  </ol>
                  <p class="text-xs opacity-50">Map will load automatically once configured</p>
                </div>
              </div>
            `;
          }
          return;
        }

        // Windy API requires a div with id="windy" in the body
        // First, remove any existing windy div to prevent conflicts
        const existingWindyDiv = document.getElementById('windy');
        if (existingWindyDiv) {
          existingWindyDiv.remove();
        }

        // Create the required windy div and add it to our container
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = `<div id="windy" style="width: 100%; height: 100%; border-radius: 1rem; overflow: hidden;"></div>`;
        }

        const options = {
          key: windyApiKey,
          verbose: true,
          lat: latitude,
          lon: longitude,
          zoom: 8
        };

        // According to Windy API source, it expects the div to be directly available
        // Let's check multiple times and ensure proper timing
        let initAttempts = 0;
        const maxAttempts = 10;
        
        const initializeMap = () => {
          const targetDiv = document.getElementById('windy');
          
          if (!targetDiv || !window.windyInit) {
            initAttempts++;
            if (initAttempts < maxAttempts) {
              setTimeout(initializeMap, 200);
            } else {
              console.error('Failed to initialize Windy map: div or windyInit not found');
              console.log('Available divs with "windy" class or id:', document.querySelectorAll('[id*="windy"], [class*="windy"]'));
            }
            return;
          }

          try {
            // Initialize Windy map - the API will handle the div automatically
            window.windyInit(options, (windyAPI: any) => {
              windyAPIRef.current = windyAPI;
              const { map, store } = windyAPI;
              mapInstanceRef.current = map;

              console.log('Windy map initialized successfully');

              // Add location marker
              if (window.L && map) {
                const marker = window.L.marker([latitude, longitude])
                  .addTo(map)
                  .bindPopup(`
                    <div style="color: ${isDark ? '#ffffff' : '#000000'}; background: ${isDark ? '#1f2937' : '#ffffff'}; padding: 8px; border-radius: 6px;">
                      <strong>Current Location</strong><br/>
                      Lat: ${latitude.toFixed(4)}<br/>
                      Lon: ${longitude.toFixed(4)}
                    </div>
                  `)
                  .openPopup();
              }

              // Set default overlay (weather layer)
              store.set('overlay', 'wind');
              
              // Update map theme based on isDark prop
              try {
                if (isDark) {
                  store.set('map', 'dark');
                } else {
                  store.set('map', 'satellite');
                }
              } catch (e) {
                console.warn('Could not set map theme:', e);
              }
            });
          } catch (error) {
            console.error('Error in windyInit:', error);
          }
        };

        // Start initialization with proper timing
        setTimeout(initializeMap, 300);

      } catch (error) {
        console.error('Error initializing Windy map:', error);
        
        // Fallback to simple message if Windy fails to load
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full ${
              isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
            }">
              <div class="text-center p-8">
                <div class="text-4xl mb-4">🗺️</div>
                <h3 class="text-lg font-semibold mb-2">Interactive Weather Map</h3>
                <p class="text-sm opacity-75">Loading weather data...</p>
                <p class="text-xs mt-2 opacity-50">Powered by Windy.com</p>
              </div>
            </div>
          `;
        }
      }
    };

    initializeWindyMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      
      // Clean up the windy div
      const existingWindyDiv = document.getElementById('windy');
      if (existingWindyDiv) {
        existingWindyDiv.remove();
      }
    };
  }, [latitude, longitude, isDark]);

  // Update map center when location changes
  useEffect(() => {
    if (mapInstanceRef.current && windyAPIRef.current) {
      // Update map view
      mapInstanceRef.current.setView([latitude, longitude], 8);
      
      // Clear existing markers and add new one
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });
      
      // Add new marker
      if (window.L) {
        window.L.marker([latitude, longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="color: ${isDark ? '#ffffff' : '#000000'}; background: ${isDark ? '#1f2937' : '#ffffff'}; padding: 8px; border-radius: 6px;">
              <strong>Current Location</strong><br/>
              Lat: ${latitude.toFixed(4)}<br/>
              Lon: ${longitude.toFixed(4)}
            </div>
          `)
          .openPopup();
      }
    }
  }, [latitude, longitude, isDark]);

  return (
    <div className="relative">
      <motion.div
        ref={mapContainerRef}
        className="h-96 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ minHeight: '384px' }}
      >
        {/* Loading placeholder */}
        <div className={`flex items-center justify-center h-full ${
          isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="text-center p-8">
            <motion.div 
              className="text-4xl mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🌍
      </motion.div>
            <h3 className="text-lg font-semibold mb-2">Loading Weather Map</h3>
            <p className="text-sm opacity-75">Powered by Windy.com</p>
          </div>
        </div>
      </motion.div>

      {/* Map controls */}
      <motion.div
        className={`absolute top-4 right-4 p-3 rounded-lg shadow-lg ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } z-[1000]`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-xs space-y-1">
          <p>🌪️ Interactive Weather Map</p>
          <p>🌡️ Real-time Data</p>
          <p>🌧️ Weather Overlays</p>
          <p>📍 Current Location</p>
        </div>
      </motion.div>

      {/* Weather layer controls */}
      <motion.div
        className={`absolute bottom-4 left-4 p-3 rounded-lg shadow-lg ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } z-[1000]`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="font-semibold text-sm mb-2">Weather Layers</h4>
        <div className="space-y-1 text-xs">
          <button 
            onClick={() => windyAPIRef.current?.store.set('overlay', 'wind')}
            className="block w-full text-left hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
          >
            💨 Wind
          </button>
          <button 
            onClick={() => windyAPIRef.current?.store.set('overlay', 'temp')}
            className="block w-full text-left hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
          >
            🌡️ Temperature
          </button>
          <button 
            onClick={() => windyAPIRef.current?.store.set('overlay', 'rain')}
            className="block w-full text-left hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
          >
            🌧️ Rain
          </button>
          <button 
            onClick={() => windyAPIRef.current?.store.set('overlay', 'clouds')}
            className="block w-full text-left hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
          >
            ☁️ Clouds
          </button>
          <button 
            onClick={() => windyAPIRef.current?.store.set('overlay', 'pressure')}
            className="block w-full text-left hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
          >
            🌀 Pressure
          </button>
        </div>
      </motion.div>
    </div>
  );
}