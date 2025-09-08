import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://disaster-5ef1.onrender.com/api/v1' 
    : 'http://localhost:5000/api/v1');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor removed

// Response interceptor for error handling (auth logic removed)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    return Promise.reject(error);
  }
);

// Auth token management removed

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats?: any;
  filters?: any;
  errors?: any[];
}

// User Types
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: 'admin' | 'coordinator' | 'field_worker' | 'volunteer';
  department: Department;
  state: string;
  district: string;
  isActive: boolean;
  lastLogin?: string;
  emailVerified: boolean;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'hi';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
  createdAt: string;
}

interface Department {
  _id: string;
  name: string;
  code: string;
  type: 'fire' | 'flood' | 'medical' | 'rescue' | 'police' | 'military' | 'ngo' | 'other';
  description?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  state: string;
  district: string;
  headquarters?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  isActive: boolean;
  parentDepartment?: Department;
  resources?: Array<{
    category: string;
    available: number;
    total: number;
  }>;
  establishedDate: string;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryItem {
  _id: string;
  itemName: string;
  itemCode: string;
  category: 'medical' | 'rescue_equipment' | 'food_supplies' | 'water_supplies' | 'shelter_materials' | 'communication' | 'transportation' | 'tools' | 'clothing' | 'other';
  subcategory?: string;
  description?: string;
  specifications?: {
    brand?: string;
    model?: string;
    size?: string;
    weight?: string;
    color?: string;
    material?: string;
    expiryDate?: string;
    batchNumber?: string;
    serialNumber?: string;
    manufacturingDate?: string;
    warrantyExpiry?: string;
  };
  quantity: {
    current: number;
    reserved: number;
    minimum: number;
    maximum: number;
  };
  unit: 'pieces' | 'kg' | 'liters' | 'boxes' | 'packets' | 'meters' | 'sets';
  cost?: {
    unitPrice?: number;
    totalValue?: number;
    currency: 'INR' | 'USD' | 'EUR';
    lastUpdatedPrice?: string;
  };
  location: {
    department: Department;
    warehouse: string;
    section?: string;
    rack?: string;
    shelf?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  supplier?: {
    name?: string;
    contact?: string;
    email?: string;
    address?: string;
    gstin?: string;
  };
  status: 'available' | 'reserved' | 'damaged' | 'expired' | 'under_maintenance';
  images?: string[];
  qrCode?: string;
  barcode?: string;
  tags?: string[];
  notes?: string;
  lastUpdated: string;
  updatedBy: User;
  createdBy: User;
  lastStockUpdate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  availableQuantity: number;
  stockPercentage: number;
  stockStatus: 'out_of_stock' | 'critical' | 'low_stock' | 'adequate';
  locationPath: string;
  daysUntilExpiry?: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isCritical: boolean;
}

interface Transaction {
  _id: string;
  transactionId: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'damaged' | 'expired';
  inventory: InventoryItem;
  quantity: number;
  unit: string;
  from?: {
    department?: Department;
    warehouse?: string;
    location?: string;
  };
  to?: {
    department?: Department;
    warehouse?: string;
    location?: string;
    recipient?: {
      name?: string;
      contact?: string;
      designation?: string;
    };
  };
  reason: string;
  reference?: string;
  emergencyLevel: 'low' | 'medium' | 'high' | 'critical';
  cost?: {
    unitPrice?: number;
    totalCost?: number;
    currency: 'INR' | 'USD' | 'EUR';
  };
  performedBy: User;
  approvedBy?: User;
  receivedBy?: User;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    user: User;
    comment?: string;
    location?: string;
  }>;
  scheduledDate?: string;
  completedDate?: string;
  expiryDate?: string;
  batchNumber?: string;
  serialNumbers?: string[];
  qualityCheck?: {
    performed: boolean;
    performedBy?: User;
    performedAt?: string;
    passed?: boolean;
    issues?: string[];
    notes?: string;
  };
  geolocation?: {
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    address?: string;
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  duration?: number;
  age: number;
  isOverdue: boolean;
  daysUntilDue?: number;
  isUrgent: boolean;
}

// Authentication API removed

// Inventory API
export const inventoryAPI = {
  getAll: async (params?: any): Promise<ApiResponse<InventoryItem[]>> => {
    const response = await api.get('/inventory', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ inventory: InventoryItem; recentTransactions: Transaction[]; alerts: any }>> => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
  },

  create: async (itemData: any): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.post('/inventory', itemData);
    return response.data;
  },

  update: async (id: string, itemData: any): Promise<ApiResponse<InventoryItem>> => {
    const response = await api.put(`/inventory/${id}`, itemData);
    return response.data;
  },

  delete: async (id: string, permanent = false): Promise<ApiResponse> => {
    const response = await api.delete(`/inventory/${id}${permanent ? '?permanent=true' : ''}`);
    return response.data;
  },

  getLowStock: async (params?: any): Promise<ApiResponse<InventoryItem[]>> => {
    const response = await api.get('/inventory/alerts/low-stock', { params });
    return response.data;
  },

  getCriticalStock: async (params?: any): Promise<ApiResponse<InventoryItem[]>> => {
    const response = await api.get('/inventory/alerts/critical-stock', { params });
    return response.data;
  },

  getExpiring: async (params?: any): Promise<ApiResponse<InventoryItem[]>> => {
    const response = await api.get('/inventory/alerts/expiring', { params });
    return response.data;
  },

  getExpired: async (params?: any): Promise<ApiResponse<InventoryItem[]>> => {
    const response = await api.get('/inventory/alerts/expired', { params });
    return response.data;
  },

  reserve: async (id: string, quantity: number): Promise<ApiResponse> => {
    const response = await api.post(`/inventory/${id}/reserve`, { quantity });
    return response.data;
  },

  releaseReserved: async (id: string, quantity: number): Promise<ApiResponse> => {
    const response = await api.post(`/inventory/${id}/release`, { quantity });
    return response.data;
  },

  getDashboardStats: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/inventory/dashboard/stats', { params });
    return response.data;
  }
};

// Department API
export const departmentAPI = {
  getAll: async (params?: any): Promise<ApiResponse<Department[]>> => {
    const response = await api.get('/departments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ department: Department; statistics: any; recentActivity: Transaction[] }>> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  create: async (deptData: any): Promise<ApiResponse<Department>> => {
    const response = await api.post('/departments', deptData);
    return response.data;
  },

  update: async (id: string, deptData: any): Promise<ApiResponse<Department>> => {
    const response = await api.put(`/departments/${id}`, deptData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  getByState: async (state: string, params?: any): Promise<ApiResponse<Department[]>> => {
    const response = await api.get(`/departments/by-state/${state}`, { params });
    return response.data;
  },

  getByType: async (type: string, params?: any): Promise<ApiResponse<Department[]>> => {
    const response = await api.get(`/departments/by-type/${type}`, { params });
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean): Promise<ApiResponse> => {
    const response = await api.patch(`/departments/${id}/status`, { isActive });
    return response.data;
  },

  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/departments/stats');
    return response.data;
  }
};

// Transaction API
export const transactionAPI = {
  getAll: async (params?: any): Promise<ApiResponse<Transaction[]>> => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Transaction>> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (transactionData: any): Promise<ApiResponse<Transaction>> => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  updateStatus: async (id: string, status: string, comment?: string): Promise<ApiResponse<Transaction>> => {
    const response = await api.patch(`/transactions/${id}/status`, { status, comment });
    return response.data;
  },

  getPending: async (params?: any): Promise<ApiResponse<Transaction[]>> => {
    const response = await api.get('/transactions/pending', { params });
    return response.data;
  },

  getOverdue: async (params?: any): Promise<ApiResponse<Transaction[]>> => {
    const response = await api.get('/transactions/overdue', { params });
    return response.data;
  },

  getStats: async (params?: any): Promise<ApiResponse> => {
    const response = await api.get('/transactions/stats', { params });
    return response.data;
  }
};

// Weather Types
interface WeatherLocation {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  state?: string;
  district?: string;
  country: string;
}

interface WeatherCurrent {
  timestamp: string;
  temperature: number;
  apparentTemperature?: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall?: number;
  relativeHumidity?: number;
  pressure: {
    msl?: number;
    surface?: number;
  };
  wind: {
    speed?: number;
    direction?: number;
    gusts?: number;
  };
  isDay: boolean;
  weatherCode?: number;
  cloudCover?: number;
  uvIndex?: number;
  visibility?: number;
  weatherCondition?: string;
  windDirectionDescription?: string;
}

interface WeatherForecast {
  timestamp: string;
  temperature: number;
  apparentTemperature?: number;
  relativeHumidity?: number;
  precipitationProbability?: number;
  precipitation?: number;
  rain?: number;
  showers?: number;
  snowfall?: number;
  pressure?: number;
  windSpeed?: number;
  windDirection?: number;
  windGusts?: number;
  uvIndex?: number;
  isDay?: boolean;
  cloudCover?: number;
  visibility?: number;
  weatherCode?: number;
  dewpoint?: number;
}

interface DailyForecast {
  date: string;
  weatherCode?: number;
  temperature: {
    min?: number;
    max?: number;
  };
  apparentTemperature?: {
    min?: number;
    max?: number;
  };
  precipitation: {
    total: number;
    rain?: number;
    showers?: number;
    snow?: number;
    hours?: number;
    probability?: number;
  };
  wind: {
    speed?: number;
    gusts?: number;
    direction?: number;
  };
  uvIndex?: number;
  sunrise?: string;
  sunset?: string;
  daylightDuration?: number;
  sunshineDuration?: number;
  solarRadiation?: number;
}

interface WeatherAlert {
  type: 'heat_wave' | 'cold_wave' | 'heavy_rain' | 'thunderstorm' | 'cyclone' | 'drought' | 'fog' | 'high_wind';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  location?: WeatherLocation;
}

interface WeatherData {
  _id: string;
  location: WeatherLocation;
  current: WeatherCurrent;
  hourlyForecast: WeatherForecast[];
  dailyForecast: DailyForecast[];
  alerts: WeatherAlert[];
  dataSource: {
    provider: string;
    lastUpdated: string;
    generationTime?: number;
    timezone: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  dataFreshness?: string;
  activeAlertsCount?: number;
}

interface WeatherStats {
  totalLocations: number;
  averageTemperature: number;
  temperatureRange: { min: number; max: number };
  totalAlerts: number;
  activeAlerts: number;
  alertsBySeverity: { low: number; moderate: number; high: number; extreme: number };
  weatherConditions: Record<string, number>;
  averageHumidity: number;
  averageWindSpeed: number;
  topAffectedAreas: Array<{ area: string; alertCount: number }>;
  recentUpdates: Array<{
    location: string;
    state?: string;
    lastUpdated: string;
    temperature: number;
    condition: string;
  }>;
}

// Weather API
export const weatherAPI = {
  getCurrent: async (params: {
    latitude: number;
    longitude: number;
    location_name?: string;
    state?: string;
    district?: string;
  }): Promise<ApiResponse<{
    weather: WeatherData;
    dataFreshness: string;
    activeAlerts: WeatherAlert[];
  }>> => {
    const response = await api.get('/weather/current', { params });
    return response.data;
  },

  getForecast: async (params: {
    latitude: number;
    longitude: number;
    days?: number;
  }): Promise<ApiResponse<{
    location: WeatherLocation;
    current: WeatherCurrent;
    dailyForecast: DailyForecast[];
    hourlyForecast: WeatherForecast[];
    alerts: WeatherAlert[];
    dataSource: any;
  }>> => {
    const response = await api.get('/weather/forecast', { params });
    return response.data;
  },

  getAlerts: async (params?: {
    latitude?: number;
    longitude?: number;
    state?: string;
    severity?: 'low' | 'moderate' | 'high' | 'extreme';
    active_only?: boolean;
  }): Promise<ApiResponse<{
    alerts: WeatherAlert[];
    count: number;
    location?: WeatherLocation;
    filters?: any;
  }>> => {
    const response = await api.get('/weather/alerts', { params });
    return response.data;
  },

  getStats: async (params?: {
    state?: string;
    days?: number;
  }): Promise<ApiResponse<WeatherStats>> => {
    const response = await api.get('/weather/stats', { params });
    return response.data;
  },

  bulkUpdate: async (locations: Array<{
    latitude: number;
    longitude: number;
    name?: string;
    state?: string;
    district?: string;
  }>): Promise<ApiResponse<{
    successful: number;
    failed: number;
    results: any[];
    errors: any[];
  }>> => {
    const response = await api.post('/weather/bulk-update', { locations });
    return response.data;
  },

  cleanup: async (params?: {
    days_old?: number;
    dry_run?: boolean;
  }): Promise<ApiResponse<{
    recordsModified?: number;
    recordsToDelete?: number;
    cutoffDate: string;
    dryRun: boolean;
  }>> => {
    const response = await api.delete('/weather/cleanup', { params });
    return response.data;
  },

  // Weather report generation
  generateReport: async (params: {
    latitude: number;
    longitude: number;
    format?: 'json' | 'pdf' | 'excel' | 'html';
    type?: string;
    language?: 'en' | 'hi';
    includeAlerts?: boolean;
    includeForecast?: boolean;
    forecastDays?: number;
  }) => {
    try {
      const { format = 'json', ...otherParams } = params;
      
      if (format === 'json') {
        const response = await api.get('/weather/reports/generate', { 
          params: { ...otherParams, format } 
        });
        return response.data;
      } else {
        // For non-JSON formats, return the raw response for download
        const response = await api.get('/weather/reports/generate', { 
          params: { ...otherParams, format },
          responseType: 'blob',
          timeout: 60000 // Extended timeout for file generation
        });
        
        // Check if response is actually a blob
        if (response.data instanceof Blob) {
          return response;
        } else {
          throw new Error('Invalid response format received');
        }
      }
    } catch (error) {
      console.error('Error generating weather report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to generate ${params.format || 'json'} report: ${errorMessage}`);
    }
  },

  getReportMetadata: async (params: {
    latitude: number;
    longitude: number;
  }): Promise<ApiResponse<{
    dataAvailable: boolean;
    lastUpdated: string;
    dataFreshness: string;
    location: any;
    activeAlerts: number;
    forecastDays: number;
    supportedFormats: string[];
    supportedLanguages: string[];
    recentReports: number;
  }>> => {
    const response = await api.get('/weather/reports/metadata', { params });
    return response.data;
  },

  // Save weather report to database
  saveReport: async (reportData: {
    latitude: number;
    longitude: number;
    reportData: any;
    format?: 'json' | 'pdf' | 'excel' | 'html';
    title?: string;
    location_name?: string;
    state?: string;
    district?: string;
    language?: 'en' | 'hi';
    includeAlerts?: boolean;
    includeForecast?: boolean;
    forecastDays?: number;
  }): Promise<ApiResponse<{
    reportId: string;
    title: string;
    location: any;
    generatedAt: string;
    format: string;
    summary: any;
  }>> => {
    const response = await api.post('/weather/reports/save', reportData);
    return response.data;
  },

  // Get saved weather reports
  getSavedReports: async (params?: {
    page?: number;
    limit?: number;
    latitude?: number;
    longitude?: number;
    state?: string;
    format?: string;
    days?: number;
  }): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/weather/reports/saved', { params });
    return response.data;
  },

  // Get specific saved weather report
  getSavedReport: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/weather/reports/saved/${id}`);
    return response.data;
  },

  // Delete saved weather report
  deleteSavedReport: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/weather/reports/saved/${id}`);
    return response.data;
  }
};

// AI Analysis API
export const aiAnalysisAPI = {
  // Generate disaster analysis report
  generateAnalysisReport: async (data: {
    state: string;
    disasterType: string;
    timeframe?: string;
    dateRange?: {
      type: 'preset' | 'custom' | 'specific';
      startDate?: string;
      endDate?: string;
      year?: string;
      month?: string;
    };
    analysisType?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/ai-analysis/generate-report', data);
    return response.data;
  },

  // Download analysis report as PDF
  downloadReportPDF: async (reportId: string): Promise<Blob> => {
    const response = await api.get(`/ai-analysis/download-pdf/${reportId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Get list of Indian states
  getIndianStates: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/ai-analysis/states');
    return response.data;
  },

  // Get list of disaster types
  getDisasterTypes: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/ai-analysis/disaster-types');
    return response.data;
  },

  // Get recent analysis reports
  getRecentReports: async (params?: {
    state?: string;
    disasterType?: string;
    limit?: number;
  }): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/ai-analysis/reports', { params });
    return response.data;
  }
};

// Export APIs and types (auth functions removed)
export {
  api
};

export type {
  ApiResponse,
  User,
  Department,
  InventoryItem,
  Transaction,
  WeatherLocation,
  WeatherCurrent,
  WeatherForecast,
  DailyForecast,
  WeatherAlert,
  WeatherData,
  WeatherStats
};
