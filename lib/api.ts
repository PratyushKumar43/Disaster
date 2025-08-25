import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
    console.error('API Error:', error.response?.data || error.message);
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

// Export APIs and types (auth functions removed)
export {
  api
};

export type {
  ApiResponse,
  User,
  Department,
  InventoryItem,
  Transaction
};
