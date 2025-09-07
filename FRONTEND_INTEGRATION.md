# Frontend Integration Documentation

## Frontend Architecture for Fire Risk ML Model

### Component Structure

```
Frontend/app/
├── fire-risk/
│   ├── page.tsx                    # Main fire risk dashboard
│   ├── map/
│   │   └── page.tsx               # Interactive fire risk map
│   ├── analytics/
│   │   └── page.tsx               # Fire risk analytics dashboard
│   └── hotspots/
│       └── page.tsx               # Real-time hotspots view
├── components/
│   ├── fire-risk/
│   │   ├── RiskMap.tsx            # Interactive risk map component
│   │   ├── RiskChart.tsx          # Risk visualization charts
│   │   ├── HotspotsList.tsx       # Hotspots table/list
│   │   ├── RiskGauge.tsx          # Risk level indicator
│   │   ├── AlertSystem.tsx        # Fire risk alerts
│   │   └── FeatureDisplay.tsx     # Environmental features display
│   └── ui/
│       ├── map-legend.tsx         # Map legend component
│       └── risk-badge.tsx         # Risk level badges
└── lib/
    ├── fire-risk-api.ts           # Fire risk API client
    ├── map-utils.ts               # Map utility functions
    └── risk-calculations.ts       # Frontend risk calculations
```

### 1. Fire Risk API Client (`lib/fire-risk-api.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

export interface FireRiskLocation {
  latitude: number;
  longitude: number;
  region?: string;
}

export interface FireRiskFeatures {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  ndvi: number;
  humidity: number;
  elevation: number;
  slope: number;
  burnHistory: boolean;
}

export interface FireRiskPrediction {
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  confidence: number;
  location: FireRiskLocation;
  features: FireRiskFeatures;
  timestamp: string;
}

export interface RiskMapData {
  predictionId: string;
  riskMap: {
    riskGrid: number[][];
    dimensions: { rows: number; cols: number };
    bounds: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  };
  summary: {
    totalCells: number;
    highRiskCells: number;
    averageRisk: number;
    maxRisk: number;
    hotspots: Array<{
      latitude: number;
      longitude: number;
      riskScore: number;
      features: FireRiskFeatures;
    }>;
  };
}

export interface FireRiskHotspot {
  _id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  riskScore: number;
  riskLevel: string;
  alertLevel: 'CRITICAL' | 'HIGH';
  riskDescription: string;
  features: FireRiskFeatures;
  date: string;
}

export interface FireRiskAnalytics {
  date: string;
  LOW: number;
  MODERATE: number;
  HIGH: number;
  EXTREME: number;
  totalPredictions: number;
  avgRiskScore: number;
  maxRiskScore: number;
}

class FireRiskAPI {
  private axiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/fire-risk`,
    timeout: 30000,
  });

  /**
   * Get current fire risk for a specific location
   */
  async getCurrentRisk(location: FireRiskLocation): Promise<FireRiskPrediction> {
    try {
      const response = await this.axiosInstance.get('/current', {
        params: location
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching current fire risk:', error);
      throw new Error('Failed to fetch fire risk data');
    }
  }

  /**
   * Generate fire risk map for a region
   */
  async generateRiskMap(params: {
    region?: string;
    date?: string;
    centerLocation?: {
      latitude: number;
      longitude: number;
      radius?: number;
    };
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  }): Promise<RiskMapData> {
    try {
      const response = await this.axiosInstance.post('/map', params);
      return response.data.data;
    } catch (error) {
      console.error('Error generating risk map:', error);
      throw new Error('Failed to generate fire risk map');
    }
  }

  /**
   * Get fire risk hotspots
   */
  async getHotspots(params: {
    region?: string;
    date?: string;
    riskThreshold?: number;
    centerLocation?: {
      latitude: number;
      longitude: number;
      radius?: number;
    };
  } = {}): Promise<{
    hotspots: FireRiskHotspot[];
    summary: {
      totalHotspots: number;
      criticalCount: number;
      highCount: number;
      averageRisk: number;
    };
  }> {
    try {
      const response = await this.axiosInstance.get('/hotspots', {
        params: params
      });
      return {
        hotspots: response.data.data,
        summary: response.data.summary
      };
    } catch (error) {
      console.error('Error fetching hotspots:', error);
      throw new Error('Failed to fetch fire risk hotspots');
    }
  }

  /**
   * Get historical fire risk data
   */
  async getHistoricalRisk(params: {
    region?: string;
    startDate?: string;
    endDate?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<FireRiskPrediction[]> {
    try {
      const response = await this.axiosInstance.get('/historical', {
        params: params
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error('Failed to fetch historical fire risk data');
    }
  }

  /**
   * Get fire risk analytics
   */
  async getAnalytics(params: {
    region?: string;
    period?: string;
  } = {}): Promise<FireRiskAnalytics[]> {
    try {
      const response = await this.axiosInstance.get('/analytics', {
        params: params
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch fire risk analytics');
    }
  }

  /**
   * Get multiple location predictions (batch)
   */
  async getBatchPredictions(locations: FireRiskLocation[]): Promise<FireRiskPrediction[]> {
    try {
      const predictions = await Promise.all(
        locations.map(location => this.getCurrentRisk(location))
      );
      return predictions;
    } catch (error) {
      console.error('Error fetching batch predictions:', error);
      throw new Error('Failed to fetch batch predictions');
    }
  }
}

export const fireRiskAPI = new FireRiskAPI();
export default fireRiskAPI;
```

### 2. Risk Gauge Component (`components/fire-risk/RiskGauge.tsx`)

```tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flame, Thermometer, Wind } from 'lucide-react';

interface RiskGaugeProps {
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  confidence?: number;
  features?: {
    temperature?: number;
    windSpeed?: number;
    ndvi?: number;
    humidity?: number;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

const getRiskColor = (level: string): string => {
  switch (level) {
    case 'EXTREME': return 'bg-red-600';
    case 'HIGH': return 'bg-orange-600';
    case 'MODERATE': return 'bg-yellow-500';
    case 'LOW': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
};

const getRiskIcon = (level: string) => {
  switch (level) {
    case 'EXTREME': return <Flame className="w-6 h-6 text-red-600" />;
    case 'HIGH': return <AlertTriangle className="w-6 h-6 text-orange-600" />;
    case 'MODERATE': return <Thermometer className="w-6 h-6 text-yellow-600" />;
    case 'LOW': return <Wind className="w-6 h-6 text-green-600" />;
    default: return <AlertTriangle className="w-6 h-6 text-gray-400" />;
  }
};

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  riskScore,
  riskLevel,
  confidence,
  features,
  location
}) => {
  // Convert risk score to gauge angle (0-180 degrees)
  const gaugeAngle = riskScore * 180;
  
  // Generate SVG path for the gauge arc
  const radius = 80;
  const strokeWidth = 12;
  const center = 100;
  
  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRiskIcon(riskLevel)}
            Fire Risk Assessment
          </div>
          <Badge className={getRiskColor(riskLevel)}>
            {riskLevel}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Risk Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg width="200" height="120" viewBox="0 0 200 120">
              {/* Background arc */}
              <path
                d={createArcPath(0, 180)}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              
              {/* Risk level segments */}
              <path
                d={createArcPath(0, 36)} // LOW: 0-0.2
                fill="none"
                stroke="#10b981"
                strokeWidth={strokeWidth - 2}
                strokeLinecap="round"
                opacity={0.3}
              />
              <path
                d={createArcPath(36, 72)} // MODERATE: 0.2-0.4
                fill="none"
                stroke="#fbbf24"
                strokeWidth={strokeWidth - 2}
                strokeLinecap="round"
                opacity={0.3}
              />
              <path
                d={createArcPath(72, 108)} // HIGH: 0.4-0.6
                fill="none"
                stroke="#ea580c"
                strokeWidth={strokeWidth - 2}
                strokeLinecap="round"
                opacity={0.3}
              />
              <path
                d={createArcPath(108, 144)} // VERY HIGH: 0.6-0.8
                fill="none"
                stroke="#dc2626"
                strokeWidth={strokeWidth - 2}
                strokeLinecap="round"
                opacity={0.3}
              />
              <path
                d={createArcPath(144, 180)} // EXTREME: 0.8-1.0
                fill="none"
                stroke="#991b1b"
                strokeWidth={strokeWidth - 2}
                strokeLinecap="round"
                opacity={0.3}
              />
              
              {/* Current risk arc */}
              <path
                d={createArcPath(0, gaugeAngle)}
                fill="none"
                stroke={
                  riskLevel === 'EXTREME' ? '#dc2626' :
                  riskLevel === 'HIGH' ? '#ea580c' :
                  riskLevel === 'MODERATE' ? '#fbbf24' : '#10b981'
                }
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              
              {/* Needle */}
              <g transform={`rotate(${gaugeAngle} ${center} ${center})`}>
                <line
                  x1={center}
                  y1={center}
                  x2={center}
                  y2={center - radius + 10}
                  stroke="#374151"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx={center}
                  cy={center}
                  r="6"
                  fill="#374151"
                />
              </g>
              
              {/* Scale labels */}
              <text x="20" y="115" textAnchor="middle" className="text-xs fill-gray-600">0.0</text>
              <text x="100" y="25" textAnchor="middle" className="text-xs fill-gray-600">0.5</text>
              <text x="180" y="115" textAnchor="middle" className="text-xs fill-gray-600">1.0</text>
            </svg>
          </div>
          
          <div className="text-center mt-4">
            <div className="text-3xl font-bold">
              {riskScore.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Risk Score</div>
            {confidence && (
              <div className="text-xs text-gray-500 mt-1">
                Confidence: {(confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
        
        {/* Environmental Features */}
        {features && (
          <div className="grid grid-cols-2 gap-4">
            {features.temperature !== undefined && (
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <Thermometer className="w-5 h-5 mx-auto mb-1 text-red-600" />
                <div className="text-lg font-semibold">{features.temperature.toFixed(1)}°C</div>
                <div className="text-xs text-gray-600">Temperature</div>
              </div>
            )}
            
            {features.windSpeed !== undefined && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Wind className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <div className="text-lg font-semibold">{features.windSpeed.toFixed(1)} m/s</div>
                <div className="text-xs text-gray-600">Wind Speed</div>
              </div>
            )}
            
            {features.ndvi !== undefined && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">{features.ndvi.toFixed(2)}</div>
                <div className="text-xs text-gray-600">NDVI</div>
              </div>
            )}
            
            {features.humidity !== undefined && (
              <div className="text-center p-3 bg-cyan-50 rounded-lg">
                <div className="text-lg font-semibold text-cyan-600">{features.humidity.toFixed(0)}%</div>
                <div className="text-xs text-gray-600">Humidity</div>
              </div>
            )}
          </div>
        )}
        
        {/* Location Info */}
        {location && (
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium">Location</div>
            <div className="text-xs text-gray-600">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </div>
          </div>
        )}
        
        {/* Risk Description */}
        <div className="text-center p-3 border rounded-lg">
          <div className="text-sm">
            {riskLevel === 'EXTREME' && '🔥 Extreme fire risk - immediate action required'}
            {riskLevel === 'HIGH' && '⚠️ High fire risk - enhanced monitoring recommended'}
            {riskLevel === 'MODERATE' && '⚡ Moderate fire risk - normal precautions advised'}
            {riskLevel === 'LOW' && '✅ Low fire risk - routine monitoring sufficient'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskGauge;
```

### 3. Main Fire Risk Dashboard Page (`app/fire-risk/page.tsx`)

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import RiskGauge from '@/components/fire-risk/RiskGauge';
import { fireRiskAPI, FireRiskPrediction, FireRiskHotspot } from '@/lib/fire-risk-api';
import { MapPin, Activity, TrendingUp, AlertTriangle, Loader2, Globe } from 'lucide-react';

export default function FireRiskDashboard() {
  const [currentRisk, setCurrentRisk] = useState<FireRiskPrediction | null>(null);
  const [hotspots, setHotspots] = useState<FireRiskHotspot[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 28.6139, // Default to Delhi
    longitude: 77.2090
  });

  const [locationInput, setLocationInput] = useState({
    latitude: '28.6139',
    longitude: '77.2090'
  });

  const [locationName, setLocationName] = useState('Delhi, India');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Load initial data
  useEffect(() => {
    loadCurrentRisk();
    loadHotspots();
  }, []);

  const loadCurrentRisk = async () => {
    setLoading(true);
    setLoadingProgress(0);
    setLoadingMessage('Fetching location data...');
    
    try {
      // Progress simulation for better UX
      setLoadingProgress(25);
      setLoadingMessage('Analyzing environmental features...');
      
      const risk = await fireRiskAPI.getCurrentRisk(selectedLocation);
      
      setLoadingProgress(75);
      setLoadingMessage('Calculating fire risk...');
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX
      
      setCurrentRisk(risk);
      setLoadingProgress(100);
      setLoadingMessage('Risk analysis complete!');
      
    } catch (error) {
      console.error('Error loading current risk:', error);
      setLoadingMessage('Error loading risk data');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingMessage('');
      }, 1000);
    }
  };

  const loadHotspots = async () => {
    setMapLoading(true);
    try {
      const { hotspots } = await fireRiskAPI.getHotspots({
        centerLocation: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          radius: 2.0 // 2 degree radius around user location
        },
        riskThreshold: 0.6
      });
      setHotspots(hotspots);
    } catch (error) {
      console.error('Error loading hotspots:', error);
    } finally {
      setMapLoading(false);
    }
  };

  const handleLocationChange = async () => {
    const lat = parseFloat(locationInput.latitude);
    const lng = parseFloat(locationInput.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinate ranges (Latitude: -90 to 90, Longitude: -180 to 180)');
      return;
    }
    
    setSelectedLocation({ latitude: lat, longitude: lng });
    
    // Update location name (reverse geocoding simulation)
    setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    
    // Load data for new location
    await Promise.all([loadCurrentRisk(), loadHotspots()]);
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ latitude: lat, longitude: lng });
    setLocationInput({
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4)
    });
    loadCurrentRisk();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fire Risk Dashboard</h1>
          <p className="text-gray-600">
            ML-powered forest fire risk assessment for {locationName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleLocationChange()} disabled={loading || mapLoading}>
            {(loading || mapLoading) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Loading Progress Bar */}
      {loading && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Loading Fire Risk Analysis...</span>
                <span className="text-sm text-gray-500">{loadingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              {loadingMessage && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {loadingMessage}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Risk at Location</p>
                <p className="text-2xl font-bold">
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Loading...
                    </span>
                  ) : (
                    currentRisk?.riskLevel || 'No Data'
                  )}
                </p>
              </div>
              <div className="text-right">
                {currentRisk && !loading && (
                  <Badge className={
                    currentRisk.riskLevel === 'EXTREME' ? 'bg-red-600' :
                    currentRisk.riskLevel === 'HIGH' ? 'bg-orange-600' :
                    currentRisk.riskLevel === 'MODERATE' ? 'bg-yellow-500' : 'bg-green-500'
                  }>
                    {currentRisk.riskScore.toFixed(2)}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nearby Hotspots</p>
                <p className="text-2xl font-bold">
                  {mapLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Scanning...
                    </span>
                  ) : (
                    hotspots.length
                  )}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Areas</p>
                <p className="text-2xl font-bold">
                  {hotspots.filter(h => h.alertLevel === 'CRITICAL').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Risk Score</p>
                <p className="text-2xl font-bold">
                  {hotspots.length > 0 
                    ? (hotspots.reduce((sum, h) => sum + h.riskScore, 0) / hotspots.length).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Location Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    value={locationInput.latitude}
                    onChange={(e) => setLocationInput(prev => ({
                      ...prev, 
                      latitude: e.target.value
                    }))}
                    placeholder="28.6139"
                    disabled={loading || mapLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    value={locationInput.longitude}
                    onChange={(e) => setLocationInput(prev => ({
                      ...prev, 
                      longitude: e.target.value
                    }))}
                    placeholder="77.2090"
                    disabled={loading || mapLoading}
                  />
                </div>
                
                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                  Current: {locationName}
                </div>
                
                <Button 
                  onClick={handleLocationChange} 
                  disabled={loading || mapLoading}
                  className="w-full"
                >
                  {(loading || mapLoading) ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {loading ? 'Analyzing Risk...' : 'Loading Hotspots...'}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Analyze Location
                    </>
                  )}
                </Button>
                
                {/* Quick Location Buttons */}
                <div className="space-y-2">
                  <Label className="text-xs">Quick Locations:</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
                      { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
                      { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
                      { name: 'Dehradun', lat: 30.3165, lng: 78.0322 }
                    ].map((location) => (
                      <Button
                        key={location.name}
                        variant="outline"
                        size="sm"
                        disabled={loading || mapLoading}
                        onClick={() => {
                          setLocationInput({
                            latitude: location.lat.toString(),
                            longitude: location.lng.toString()
                          });
                          setSelectedLocation({
                            latitude: location.lat,
                            longitude: location.lng
                          });
                          setLocationName(location.name);
                          Promise.all([loadCurrentRisk(), loadHotspots()]);
                        }}
                        className="text-xs"
                      >
                        {location.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Gauge */}
            <div className="lg:col-span-2">
              {currentRisk ? (
                <RiskGauge
                  riskScore={currentRisk.riskScore}
                  riskLevel={currentRisk.riskLevel}
                  confidence={currentRisk.confidence}
                  features={currentRisk.features}
                  location={currentRisk.location}
                />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p>Loading fire risk assessment...</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hotspots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Fire Risk Hotspots</CardTitle>
            </CardHeader>
            <CardContent>
              {hotspots.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600">No active hotspots detected</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hotspots.map((hotspot) => (
                    <div 
                      key={hotspot._id}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={
                              hotspot.alertLevel === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-600'
                            }>
                              {hotspot.alertLevel}
                            </Badge>
                            <span className="font-medium">{hotspot.riskLevel}</span>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            Location: {hotspot.coordinates.latitude.toFixed(4)}, {hotspot.coordinates.longitude.toFixed(4)}
                          </div>
                          
                          <div className="text-sm">
                            Risk Score: <span className="font-medium">{hotspot.riskScore.toFixed(3)}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {hotspot.riskDescription}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMapLocationSelect(
                            hotspot.coordinates.latitude, 
                            hotspot.coordinates.longitude
                          )}
                        >
                          Analyze
                        </Button>
                      </div>
                      
                      {hotspot.features && (
                        <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                          <div>Temp: {hotspot.features.temperature?.toFixed(1)}°C</div>
                          <div>Wind: {hotspot.features.windSpeed?.toFixed(1)} m/s</div>
                          <div>NDVI: {hotspot.features.ndvi?.toFixed(2)}</div>
                          <div>Humidity: {hotspot.features.humidity?.toFixed(0)}%</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Implementation Steps

### Step 1: Install Required Dependencies

```bash
# In the Frontend directory
npm install axios leaflet react-leaflet @types/leaflet
npm install lucide-react recharts

# For map tiles and styling
npm install leaflet/dist/leaflet.css
```

### Step 2: Create Environment Configuration

Add to `Frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:10000/api
NEXT_PUBLIC_MAP_TILES_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Step 3: Update Navigation

Add to `Frontend/app/layout.tsx` navigation:
```tsx
// Add fire risk link to main navigation
{
  href: '/fire-risk',
  label: 'Fire Risk',
  icon: Flame
}
```

### Step 4: Setup Map Assets

Create `Frontend/public/leaflet/` directory and add:
- marker-icon.png
- marker-icon-2x.png  
- marker-shadow.png

### Step 5: Add Route to Dashboard

Update `Frontend/app/dashboard/layout.tsx` to include fire risk section:
```tsx
<SidebarItem href="/fire-risk" icon={Flame}>
  Fire Risk Analysis
</SidebarItem>
```

## Features Overview

### 1. **Real-time Risk Assessment**
- Location-based fire risk prediction
- Interactive coordinate input
- Confidence scoring display
- Environmental feature visualization

### 2. **Visual Risk Gauge**
- SVG-based semicircle gauge
- Color-coded risk levels
- Needle indicator for precise scoring
- Feature breakdowns (temp, wind, NDVI, humidity)

### 3. **Hotspots Management**
- Real-time hotspot detection
- Critical/High alert classification
- Location-based hotspot filtering
- Quick analysis access

### 4. **Responsive Design**
- Mobile-friendly interface
- Card-based layout
- Accessible components
- Loading states and error handling

### 5. **Integration Ready**
- TypeScript interfaces
- Error boundary implementation
- API client with retry logic
- Extensible component architecture

This frontend integration provides a complete user interface for the ML-powered fire risk assessment system, with professional-grade components and seamless backend integration.
