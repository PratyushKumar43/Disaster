'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, MapPin, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import BhuvanMap from '@/components/BhuvanMap';
import {
  fireRiskAPI,
  FireRiskPrediction,
  FireHotspot,
  FireRiskAnalytics,
  getRiskLevelColor,
  getRiskLevelDescription,
  formatRiskScore,
  type FireRiskLocation
} from '@/lib/fire-risk-api';

const FireRiskDashboard: React.FC = () => {
  // State management
  const [currentLocation, setCurrentLocation] = useState<FireRiskLocation>({
    latitude: 28.6139,
    longitude: 77.2090,
    region: 'Delhi'
  });
  const [currentRisk, setCurrentRisk] = useState<FireRiskPrediction | null>(null);
  const [hotspots, setHotspots] = useState<FireHotspot[]>([]);
  const [analytics, setAnalytics] = useState<FireRiskAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Form state for manual location input
  const [manualLocation, setManualLocation] = useState({
    latitude: '',
    longitude: '',
    region: ''
  });

  /**
   * Simulate loading progress with realistic steps
   */
  const simulateLoadingProgress = useCallback(() => {
    setLoadingProgress(0);
    setLoadingMessage('Initializing prediction system...');

    const steps = [
      { progress: 20, message: 'Detecting region from coordinates...' },
      { progress: 40, message: 'Gathering weather data...' },
      { progress: 60, message: 'Analyzing vegetation indices...' },
      { progress: 80, message: 'Running ML prediction model...' },
      { progress: 95, message: 'Processing results...' },
      { progress: 100, message: 'Complete!' }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLoadingProgress(step.progress);
        setLoadingMessage(step.message);
      }, index * 500);
    });
  }, []);

  /**
   * Get current fire risk for the selected location
   */
  const getCurrentRisk = useCallback(async (location: FireRiskLocation) => {
    try {
      setLoading(true);
      setError(null);
      simulateLoadingProgress();

      const prediction = await fireRiskAPI.getCurrentRisk(
        location.latitude,
        location.longitude,
        location.region
      );

      // Wait for loading animation to complete
      setTimeout(() => {
        setCurrentRisk(prediction);
        setLoading(false);
      }, 3000);

    } catch (err) {
      console.error('Error getting current risk:', err);
      setError(err instanceof Error ? err.message : 'Failed to get fire risk prediction');
      setLoading(false);
    }
  }, [simulateLoadingProgress]);

  /**
   * Get fire hotspots for the selected location area
   */
  const getHotspots = useCallback(async (location: FireRiskLocation) => {
    try {
      const result = await fireRiskAPI.getHotspots({
        centerLocation: location,
        riskThreshold: 0.6
      });
      setHotspots(result.hotspots);
    } catch (err) {
      console.error('Error getting hotspots:', err);
    }
  }, []);

  /**
   * Get analytics data for the selected location
   */
  const getAnalytics = useCallback(async (location: FireRiskLocation) => {
    try {
      const analyticsData = await fireRiskAPI.getAnalytics(location.region, 7);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error getting analytics:', err);
    }
  }, []);

  /**
   * Handle location change and refresh all data
   */
  const handleLocationChange = useCallback((newLocation: FireRiskLocation) => {
    setCurrentLocation(newLocation);
    getCurrentRisk(newLocation);
    getHotspots(newLocation);
    getAnalytics(newLocation);
  }, [getCurrentRisk, getHotspots, getAnalytics]);

  /**
   * Handle manual location form submission
   */
  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Please enter valid latitude and longitude coordinates');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180');
      return;
    }

    const newLocation: FireRiskLocation = {
      latitude: lat,
      longitude: lng,
      region: manualLocation.region || undefined
    };

    handleLocationChange(newLocation);
    
    // Clear form
    setManualLocation({ latitude: '', longitude: '', region: '' });
  };

  /**
   * Get current location using browser geolocation
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setLoadingMessage('Getting your current location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: FireRiskLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        handleLocationChange(newLocation);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your current location. Please enter coordinates manually.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Initialize with default location on component mount
  useEffect(() => {
    handleLocationChange(currentLocation);
  }, []); // Empty dependency array for initial load only

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fire Risk Prediction Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time forest fire risk assessment using machine learning
        </p>
      </div>

      {/* Location Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={getCurrentLocation} 
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Use Current Location
            </Button>
            
            <div className="text-sm text-muted-foreground">
              or enter coordinates manually:
            </div>
          </div>

          <form onSubmit={handleManualLocationSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 28.6139"
                  value={manualLocation.latitude}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualLocation(prev => ({ ...prev, latitude: e.target.value }))}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g., 77.2090"
                  value={manualLocation.longitude}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualLocation(prev => ({ ...prev, longitude: e.target.value }))}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="region">Region (optional)</Label>
                <Input
                  id="region"
                  placeholder="e.g., Delhi"
                  value={manualLocation.region}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualLocation(prev => ({ ...prev, region: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>
            <Button type="submit" disabled={loading || !manualLocation.latitude || !manualLocation.longitude}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Fire Risk Prediction
            </Button>
          </form>

          {/* Current Location Display */}
          {currentLocation && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <div className="text-sm font-medium">Current Location:</div>
              <div className="text-sm text-muted-foreground">
                Lat: {currentLocation.latitude.toFixed(4)}, 
                Lng: {currentLocation.longitude.toFixed(4)}
                {currentLocation.region && `, Region: ${currentLocation.region}`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading Progress */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing...</span>
                <span className="text-sm text-muted-foreground">{loadingProgress}%</span>
              </div>
              <Progress value={loadingProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{loadingMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Risk Prediction */}
      {currentRisk && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Fire Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk Score */}
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold" style={{ color: getRiskLevelColor(currentRisk.riskLevel) }}>
                  {formatRiskScore(currentRisk.riskScore)}
                </div>
                <Badge 
                  variant="secondary" 
                  className="text-sm"
                  style={{ 
                    backgroundColor: getRiskLevelColor(currentRisk.riskLevel) + '20',
                    color: getRiskLevelColor(currentRisk.riskLevel),
                    borderColor: getRiskLevelColor(currentRisk.riskLevel)
                  }}
                >
                  {currentRisk.riskLevel}
                </Badge>
                <p className="text-sm text-muted-foreground">Risk Level</p>
              </div>

              {/* Confidence */}
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-blue-600">
                  {formatRiskScore(currentRisk.confidence)}
                </div>
                <Badge variant="outline">Confidence</Badge>
                <p className="text-sm text-muted-foreground">Model Accuracy</p>
              </div>

              {/* Region */}
              <div className="text-center space-y-2">
                <div className="text-xl font-semibold">
                  {currentRisk.location.region}
                </div>
                <Badge variant="outline">Region</Badge>
                <p className="text-sm text-muted-foreground">
                  {currentRisk.location.latitude.toFixed(4)}, {currentRisk.location.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Risk Description */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Risk Assessment:</p>
              <p className="text-sm">{getRiskLevelDescription(currentRisk.riskLevel)}</p>
            </div>

            {/* Environmental Features */}
            {currentRisk.features && Object.keys(currentRisk.features).length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Environmental Factors:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(currentRisk.features).map(([key, value]) => (
                    <div key={key} className="text-center space-y-1">
                      <div className="text-lg font-semibold">
                        {typeof value === 'number' ? value.toFixed(1) : value}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(currentRisk.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Bhuvan Map */}
      <BhuvanMap
        hotspots={hotspots}
        center={currentLocation}
        onLocationSelect={handleLocationChange}
        className="w-full"
      />

      {/* Fire Hotspots */}
      {hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Fire Risk Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotspots.slice(0, 5).map((hotspot) => (
                <div key={hotspot._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {hotspot.coordinates.latitude.toFixed(4)}, {hotspot.coordinates.longitude.toFixed(4)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hotspot.region} • {hotspot.riskDescription}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={hotspot.alertLevel === 'CRITICAL' ? 'destructive' : 'secondary'}
                      style={{ 
                        backgroundColor: getRiskLevelColor(hotspot.riskLevel) + '20',
                        color: getRiskLevelColor(hotspot.riskLevel)
                      }}
                    >
                      {formatRiskScore(hotspot.riskScore)}
                    </Badge>
                  </div>
                </div>
              ))}
              {hotspots.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... and {hotspots.length - 5} more hotspots
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Preview */}
      {analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Risk Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.slice(-3).map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="text-sm font-medium">{new Date(day.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">Avg: {formatRiskScore(day.avgRiskScore)}</div>
                    <div className="text-sm">Max: {formatRiskScore(day.maxRiskScore)}</div>
                    <div className="text-sm text-muted-foreground">{day.totalPredictions} predictions</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FireRiskDashboard;
