/**
 * Fire Risk API Client
 * Handles all API calls for fire risk prediction and analysis
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
   * Get current fire risk for a specific location
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

    const response = await this.makeRequest<FireRiskPrediction>(
      `/current?${params.toString()}`
    );
    
    return response.data;
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
   * Get fire risk hotspots
   */
  async getHotspots(
    options: {
      region?: string;
      date?: string;
      riskThreshold?: number;
      centerLocation?: FireRiskLocation;
    } = {}
  ): Promise<{
    hotspots: FireHotspot[];
    summary: {
      totalHotspots: number;
      criticalCount: number;
      highCount: number;
      averageRisk: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (options.region) params.append('region', options.region);
    if (options.date) params.append('date', options.date);
    if (options.riskThreshold) params.append('riskThreshold', options.riskThreshold.toString());
    if (options.centerLocation) {
      params.append('centerLocation', JSON.stringify(options.centerLocation));
    }

    const response = await this.makeRequest<FireHotspot[]>(
      `/hotspots?${params.toString()}`
    );
    
    return {
      hotspots: response.data,
      summary: response.metadata as any
    };
  }

  /**
   * Get fire risk analytics and trends
   */
  async getAnalytics(
    region?: string,
    period: number = 7
  ): Promise<FireRiskAnalytics[]> {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    params.append('period', period.toString());

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
