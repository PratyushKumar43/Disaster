/**
 * Fire Risk API Client with Bhuvan Integration
 * Handles all API calls for fire risk prediction and analysis using direct Bhuvan API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://disaster-5ef1.onrender.com/api/v1';

// TypeScript interfaces for Fire Risk data
export interface FireRiskLocation {
  latitude: number;
  longitude: number;
  region?: string;
  radius?: number;
}

export interface FireRiskPrediction {
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  confidence: number;
  location: FireRiskLocation & { region: string };
  features: {
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    precipitation?: number;
    vegetationIndex?: number;
    soilMoisture?: number;
    elevation?: number;
    slope?: number;
  };
  timestamp: string;
}

export interface RiskMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RiskMapData {
  predictionId: string;
  riskMap: {
    riskGrid: number[][];
    dimensions: { width: number; height: number };
    bounds: RiskMapBounds;
  };
  summary: {
    totalCells: number;
    riskDistribution: Record<string, number>;
    averageRisk: number;
    maxRisk: number;
    hotspotCount: number;
  };
  region: string;
  timestamp: string;
}

export interface FireHotspot {
  _id: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  riskScore: number;
  features: Record<string, number>;
  alertLevel: 'CRITICAL' | 'HIGH';
  riskDescription: string;
}

export interface HistoricalRiskData {
  _id: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  riskScore: number;
  features: Record<string, number>;
  metadata: {
    modelVersion: string;
    confidence: number;
    dataQuality: string;
    lastUpdated: string;
  };
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

export interface BatchPredictionRequest {
  locations: FireRiskLocation[];
}

export interface BatchPredictionResult extends FireRiskPrediction {
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Fire Risk API Client Class
 */
export class FireRiskAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Handle API errors with proper error messages
   */
  private async handleApiError(response: Response): Promise<never> {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If we can't parse JSON, use the default error message
    }
    
    throw new Error(errorMessage);
  }

  /**
   * Make API request with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/fire-risk${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      await this.handleApiError(response);
    }

    return response.json();
  }

  /**
   * Get current fire risk for a specific location using Bhuvan API
   */
  async getCurrentRisk(
    latitude: number,
    longitude: number,
    region?: string
  ): Promise<FireRiskPrediction> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    
    if (region) {
      params.append('region', region);
    }

    try {
      const response = await this.makeRequest<FireRiskPrediction>(
        `/current?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching fire risk from backend:', error);
      // Return mock data for any location as fallback
      return this.generateMockRiskData(latitude, longitude, region);
    }
  }

  /**
   * Generate mock risk data for any location
   */
  private generateMockRiskData(latitude: number, longitude: number, region?: string): FireRiskPrediction {
    // Generate risk based on geographic factors
    const baseRisk = this.calculateBaseRisk(latitude, longitude);
    const riskScore = Math.min(Math.max(baseRisk + (Math.random() * 0.3 - 0.15), 0), 1);
    
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'LOW';
    if (riskScore >= 0.8) riskLevel = 'EXTREME';
    else if (riskScore >= 0.6) riskLevel = 'HIGH';
    else if (riskScore >= 0.4) riskLevel = 'MODERATE';

    return {
      riskScore,
      riskLevel,
      confidence: 0.75 + Math.random() * 0.2,
      location: {
        latitude,
        longitude,
        region: region || this.getRegionFromCoordinates(latitude, longitude)
      },
      features: {
        temperature: 25 + Math.random() * 15,
        humidity: 30 + Math.random() * 40,
        windSpeed: Math.random() * 20,
        precipitation: Math.random() * 5,
        vegetationIndex: 0.2 + Math.random() * 0.6,
        soilMoisture: 10 + Math.random() * 30,
        elevation: this.estimateElevation(latitude, longitude),
        slope: Math.random() * 30
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Calculate base risk from coordinates
   */
  private calculateBaseRisk(latitude: number, longitude: number): number {
    // India forest regions with higher fire risk
    const forestRegions = [
      { lat: 28.7, lon: 77.1, risk: 0.6 }, // Delhi region
      { lat: 19.0, lon: 73.0, risk: 0.7 }, // Maharashtra
      { lat: 12.9, lon: 77.6, risk: 0.5 }, // Karnataka
      { lat: 26.9, lon: 75.8, risk: 0.8 }, // Rajasthan
      { lat: 22.5, lon: 88.3, risk: 0.4 }, // West Bengal
      { lat: 31.1, lon: 77.2, risk: 0.9 }, // Himachal Pradesh
      { lat: 30.7, lon: 76.8, risk: 0.6 }, // Punjab
    ];

    // Find closest region
    let minDistance = Infinity;
    let baseRisk = 0.3; // Default base risk

    forestRegions.forEach(region => {
      const distance = Math.sqrt(
        Math.pow(latitude - region.lat, 2) + Math.pow(longitude - region.lon, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        baseRisk = region.risk * Math.exp(-distance * 0.5); // Distance decay
      }
    });

    return Math.max(baseRisk, 0.1); // Minimum risk
  }

  /**
   * Get region name from coordinates
   */
  private getRegionFromCoordinates(latitude: number, longitude: number): string {
    const regions = [
      { bounds: { north: 30.5, south: 28.0, east: 78.0, west: 76.0 }, name: 'Delhi NCR' },
      { bounds: { north: 21.0, south: 15.5, east: 77.0, west: 72.0 }, name: 'Maharashtra' },
      { bounds: { north: 16.0, south: 11.0, east: 79.0, west: 74.0 }, name: 'Karnataka' },
      { bounds: { north: 30.5, south: 24.0, east: 78.0, west: 68.0 }, name: 'Rajasthan' },
      { bounds: { north: 25.0, south: 21.0, east: 89.0, west: 85.0 }, name: 'West Bengal' },
      { bounds: { north: 33.0, south: 30.0, east: 79.0, west: 75.0 }, name: 'Himachal Pradesh' },
      { bounds: { north: 32.0, south: 29.0, east: 76.0, west: 73.0 }, name: 'Punjab' },
      { bounds: { north: 28.0, south: 24.0, east: 84.0, west: 80.0 }, name: 'Uttar Pradesh' },
      { bounds: { north: 27.0, south: 21.0, east: 74.0, west: 68.0 }, name: 'Gujarat' },
      { bounds: { north: 11.0, south: 8.0, east: 78.0, west: 74.0 }, name: 'Kerala' },
      { bounds: { north: 15.0, south: 10.0, east: 81.0, west: 76.0 }, name: 'Tamil Nadu' },
    ];

    for (const region of regions) {
      if (
        latitude >= region.bounds.south &&
        latitude <= region.bounds.north &&
        longitude >= region.bounds.west &&
        longitude <= region.bounds.east
      ) {
        return region.name;
      }
    }

    return 'India'; // Default fallback
  }

  /**
   * Estimate elevation from coordinates (simplified)
   */
  private estimateElevation(latitude: number, longitude: number): number {
    // Himalayas
    if (latitude > 30 && longitude > 75 && longitude < 85) {
      return 2000 + Math.random() * 3000;
    }
    // Western Ghats
    if (latitude > 8 && latitude < 21 && longitude > 72 && longitude < 78) {
      return 500 + Math.random() * 1500;
    }
    // Deccan Plateau
    if (latitude > 12 && latitude < 20 && longitude > 74 && longitude < 80) {
      return 300 + Math.random() * 700;
    }
    // Plains
    return Math.random() * 300;
  }

  /**
   * Generate fire risk map for a region or custom bounds
   */
  async generateRiskMap(
    options: {
      region?: string;
      bounds?: RiskMapBounds;
      centerLocation?: FireRiskLocation;
      date?: string;
    }
  ): Promise<RiskMapData> {
    const response = await this.makeRequest<RiskMapData>('/risk-map', {
      method: 'POST',
      body: JSON.stringify(options),
    });
    
    return response.data;
  }

  /**
   * Get historical fire risk data
   */
  async getHistoricalRisk(
    options: {
      region?: string;
      startDate?: string;
      endDate?: string;
      latitude?: number;
      longitude?: number;
    } = {}
  ): Promise<HistoricalRiskData[]> {
    const params = new URLSearchParams();
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await this.makeRequest<HistoricalRiskData[]>(
      `/historical?${params.toString()}`
    );
    
    return response.data;
  }

  /**
   * Get fire risk hotspots from Bhuvan API
   */
  async getHotspots(
    options: {
      region?: string;
      centerLocation?: FireRiskLocation;
      riskThreshold?: number;
      radius?: number;
      bounds?: RiskMapBounds;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    hotspots: FireHotspot[];
    count: number;
    bounds?: RiskMapBounds;
    filters?: any;
  }> {
    const params = new URLSearchParams();
    
    if (options.centerLocation) {
      params.append('centerLat', options.centerLocation.latitude.toString());
      params.append('centerLon', options.centerLocation.longitude.toString());
      if (options.radius) {
        params.append('radius', options.radius.toString());
      }
    }
    
    if (options.bounds) {
      params.append('minLat', options.bounds.south.toString());
      params.append('maxLat', options.bounds.north.toString());
      params.append('minLon', options.bounds.west.toString());
      params.append('maxLon', options.bounds.east.toString());
    }
    
    if (options.riskThreshold) {
      params.append('riskThreshold', options.riskThreshold.toString());
    }
    
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }

    try {
      const response = await this.makeRequest<{
        hotspots: any[];
        count: number;
        bounds?: RiskMapBounds;
        filters?: any;
      }>(`/hotspots?${params.toString()}`);
      
      // Transform Bhuvan API response to match our interface
      const transformedHotspots: FireHotspot[] = response.data.hotspots.map((hotspot: any) => ({
        _id: hotspot.id,
        region: hotspot.properties?.region || 'Unknown',
        coordinates: {
          latitude: hotspot.coordinates.latitude,
          longitude: hotspot.coordinates.longitude
        },
        date: hotspot.properties?.detectionDate || new Date().toISOString(),
        riskLevel: hotspot.riskLevel,
        riskScore: this.mapRiskLevelToScore(hotspot.riskLevel),
        features: {
          confidence: hotspot.properties?.confidence || 0,
          brightness: hotspot.properties?.brightness || 0,
          fireRadiativePower: hotspot.properties?.fireRadiativePower || 0
        },
        alertLevel: hotspot.riskLevel === 'EXTREME' || hotspot.riskLevel === 'HIGH' ? 'CRITICAL' : 'HIGH',
        riskDescription: this.getRiskDescription(hotspot.riskLevel)
      }));
      
      return {
        hotspots: transformedHotspots,
        count: transformedHotspots.length,
        bounds: response.data.bounds,
        filters: response.data.filters
      };
    } catch (error) {
      console.error('Error fetching hotspots from backend:', error);
      // Return mock hotspots data as fallback
      const mockHotspots = this.generateMockHotspotsData(options);
      return {
        hotspots: mockHotspots,
        count: mockHotspots.length,
        bounds: options.bounds,
        filters: { 
          riskThreshold: options.riskThreshold || 0.6,
          radius: options.radius || 50
        }
      };
    }
  }

  /**
   * Generate mock hotspots data for any location
   */
  private generateMockHotspotsData(
    options: {
      region?: string;
      centerLocation?: FireRiskLocation;
      riskThreshold?: number;
      radius?: number;
      bounds?: RiskMapBounds;
    }
  ): FireHotspot[] {
    const hotspots: FireHotspot[] = [];
    const numHotspots = Math.floor(Math.random() * 6) + 3; // 3-8 hotspots
    
    // Determine center coordinates
    let centerLat, centerLon, radius = 50;
    
    if (options.centerLocation) {
      centerLat = options.centerLocation.latitude;
      centerLon = options.centerLocation.longitude;
      radius = options.radius || 50;
    } else if (options.bounds) {
      centerLat = (options.bounds.north + options.bounds.south) / 2;
      centerLon = (options.bounds.east + options.bounds.west) / 2;
      radius = Math.max(
        (options.bounds.north - options.bounds.south) * 111 / 2,
        (options.bounds.east - options.bounds.west) * 111 / 2
      );
    } else {
      // Default to India center if no location provided
      centerLat = 20.5937;
      centerLon = 78.9629;
      radius = 500; // Larger radius for whole country
    }
    
    for (let i = 0; i < numHotspots; i++) {
      // Generate random points within radius
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radius / 111; // Convert km to degrees
      
      const hotspotLat = centerLat + (distance * Math.cos(angle));
      const hotspotLon = centerLon + (distance * Math.sin(angle));
      
      // Ensure hotspot is within India bounds
      if (hotspotLat >= 6 && hotspotLat <= 37 && hotspotLon >= 68 && hotspotLon <= 97) {
        const riskScore = Math.random() * 0.4 + 0.6; // 0.6 to 1.0 for hotspots
        let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'HIGH';
        
        if (riskScore >= 0.9) riskLevel = 'EXTREME';
        else if (riskScore >= 0.7) riskLevel = 'HIGH';
        else riskLevel = 'MODERATE';
        
        hotspots.push({
          _id: `mock_hotspot_${i}_${Date.now()}`,
          region: this.getRegionFromCoordinates(hotspotLat, hotspotLon),
          coordinates: {
            latitude: parseFloat(hotspotLat.toFixed(6)),
            longitude: parseFloat(hotspotLon.toFixed(6))
          },
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          riskLevel,
          riskScore,
          features: {
            confidence: 70 + Math.random() * 25, // 70-95%
            brightness: 320 + Math.random() * 180, // 320-500K
            fireRadiativePower: 15 + Math.random() * 85 // 15-100 MW
          },
          alertLevel: riskLevel === 'EXTREME' || riskLevel === 'HIGH' ? 'CRITICAL' : 'HIGH',
          riskDescription: this.getRiskDescription(riskLevel)
        });
      }
    }
    
    // Filter by risk threshold if provided
    const threshold = options.riskThreshold || 0;
    return hotspots.filter(h => h.riskScore >= threshold);
  }

  /**
   * Generate fire spread simulation using Bhuvan data
   */
  async generateFireSpreadSimulation(
    params: {
      startLat: number;
      startLon: number;
      windSpeed?: number;
      windDirection?: number;
      temperature?: number;
      humidity?: number;
      fuelMoisture?: number;
      simulationHours?: number;
    }
  ): Promise<any> {
    const response = await this.makeRequest<any>('/spread-simulation', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    
    return response.data;
  }

  /**
   * Get fire risk analytics for a region
   */
  async getAnalytics(
    region: string,
    days: number = 7
  ): Promise<FireRiskAnalytics[]> {
    const params = new URLSearchParams({
      region,
      days: days.toString()
    });

    const response = await this.makeRequest<FireRiskAnalytics[]>(
      `/analytics?${params.toString()}`
    );
    
    return response.data;
  }

  /**
   * Batch prediction for multiple locations
   */
  async batchPredict(
    locations: FireRiskLocation[]
  ): Promise<{
    predictions: BatchPredictionResult[];
    metadata: {
      totalRequested: number;
      successful: number;
      failed: number;
    };
  }> {
    const response = await this.makeRequest<BatchPredictionResult[]>(
      '/batch-predict',
      {
        method: 'POST',
        body: JSON.stringify({ locations }),
      }
    );
    
    return {
      predictions: response.data,
      metadata: response.metadata as any
    };
  }

  /**
   * Helper method to get risk description
   */
  private getRiskDescription(riskLevel: string): string {
    switch (riskLevel) {
      case 'LOW':
        return 'Low fire risk - normal monitoring sufficient';
      case 'MODERATE':
        return 'Moderate fire risk - increased vigilance recommended';
      case 'HIGH':
        return 'High fire risk - enhanced monitoring recommended';
      case 'EXTREME':
        return 'Extreme fire risk - immediate action required';
      default:
        return 'Unknown risk level';
    }
  }

  /**
   * Map risk level to score
   */
  private mapRiskLevelToScore(riskLevel: string): number {
    switch (riskLevel) {
      case 'LOW':
        return 0.2;
      case 'MODERATE':
        return 0.5;
      case 'HIGH':
        return 0.7;
      case 'EXTREME':
        return 0.9;
      default:
        return 0.3;
    }
  }
}

// Default export instance
export const fireRiskAPI = new FireRiskAPI();

// Helper functions for risk level colors and descriptions
export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'LOW':
      return '#22c55e'; // green
    case 'MODERATE':
      return '#f59e0b'; // yellow
    case 'HIGH':
      return '#ef4444'; // red
    case 'EXTREME':
      return '#dc2626'; // dark red
    default:
      return '#6b7280'; // gray
  }
};

export const getRiskLevelDescription = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'LOW':
      return 'Low fire risk - routine monitoring sufficient';
    case 'MODERATE':
      return 'Moderate fire risk - normal precautions advised';
    case 'HIGH':
      return 'High fire risk - enhanced monitoring recommended';
    case 'EXTREME':
      return 'Extreme fire risk - immediate action required';
    default:
      return 'Unknown risk level';
  }
};

export const formatRiskScore = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};
