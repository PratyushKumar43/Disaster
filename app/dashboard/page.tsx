"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Brain,
  Search,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Shield,
  Menu,
  X,
  Plus,
  Upload,
  Calendar,
  MapPin,
  Building,
  Save,
  XCircle,
  Trash2
} from "lucide-react";
import { inventoryAPI, departmentAPI } from "../../lib/api";
import type { InventoryItem, Department, User as UserType } from "../../lib/api";
import { useSocket } from "../../lib/socket";

// Theme context
const useTheme = () => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
      
      setIsDark(shouldBeDark);
      // Apply theme immediately to prevent flash
      document.documentElement.classList.toggle('dark', shouldBeDark);
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark, mounted]);

  return { isDark, setIsDark, mounted };
};

// Sidebar Component
function Sidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen, isDark }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isDark: boolean;
}) {
  const sidebarItems = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Brain },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: 0 }}
        animate={{ 
          x: isMobileOpen ? 0 : 0,
        }}
        className={`
          fixed lg:relative lg:translate-x-0 top-0 left-0 z-50 lg:z-0
          w-80 h-full lg:h-screen
          ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          border-r transition-all duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-green-500" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DisasterGuard
              </span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200
                ${activeTab === item.id
                  ? 'bg-green-500 text-white shadow-lg'
                  : isDark
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Emergency Coordinator
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

// Header Component
function Header({ isDark, setIsDark, setIsMobileOpen, isConnected }: {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  isConnected?: () => boolean;
}) {
  return (
    <header className={`
      sticky top-0 z-30 px-6 py-4 border-b
      ${isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'}
      backdrop-blur-md
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          {isConnected && (
            <div className="hidden md:flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected() ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isConnected() ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}

          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className={`
                pl-10 pr-4 py-2 w-80 rounded-lg border
                ${isDark
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                }
                focus:outline-none focus:ring-2 focus:ring-green-500/20
              `}
            />
          </div>

          {/* Theme Toggle */}
          <motion.button
            onClick={() => setIsDark(!isDark)}
            className={`
              p-2 rounded-lg transition-colors
              ${isDark ? 'text-yellow-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </motion.button>

          {/* Notifications */}
          <motion.button
            className={`
              relative p-2 rounded-lg transition-colors
              ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </motion.button>



          {/* Settings */}
          <motion.button
            className={`
              p-2 rounded-lg transition-colors
              ${isDark ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}

// Stats Card Component
function StatsCard({ title, value, trend, icon: Icon, color, isDark }: {
  title: string;
  value: string;
  trend: string;
  icon: any;
  color: string;
  isDark: boolean;
}) {
  return (
    <motion.div
      className={`
        p-6 rounded-2xl border
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        shadow-sm hover:shadow-md transition-all duration-200
      `}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-4 w-4 ${color} mr-1`} />
            <span className={`text-sm font-medium ${color}`}>{trend}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('-500', '-100')} ${isDark ? 'bg-opacity-20' : ''}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </motion.div>
  );
}

// Add New Item Modal Component
function AddItemModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isDark 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: any) => void;
  isDark: boolean;
}) {
  const [formData, setFormData] = useState({
    itemName: '',
    itemCode: '',
    category: 'medical',
    subcategory: '',
    description: '',
    currentQuantity: '',
    minimumQuantity: '',
    maximumQuantity: '',
    unit: 'pieces',
    unitPrice: '',
    brand: '',
    model: '',
    size: '',
    weight: '',
    color: '',
    material: '',
    expiryDate: '',
    batchNumber: '',
    warehouse: '',
    section: '',
    rack: '',
    shelf: '',
    department: '',
    state: '',
    district: '',
    supplierName: '',
    supplierContact: '',
    supplierAddress: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departmentAPI.getAll({ isActive: true });
      if (response.success) {
        setDepartments(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const categories = [
    { value: 'medical', label: 'Medical' },
    { value: 'rescue_equipment', label: 'Rescue Equipment' },
    { value: 'food_supplies', label: 'Food Supplies' },
    { value: 'water_supplies', label: 'Water Supplies' },
    { value: 'shelter_materials', label: 'Shelter Materials' },
    { value: 'communication', label: 'Communication' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'tools', label: 'Tools' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'other', label: 'Other' }
  ];

  const units = [
    { value: 'pieces', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'liters', label: 'Liters' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'packets', label: 'Packets' },
    { value: 'meters', label: 'Meters' },
    { value: 'sets', label: 'Sets' }
  ];

  // Note: departments array is now loaded from API

  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';
    if (!formData.itemCode.trim()) newErrors.itemCode = 'Item code is required';
    if (!formData.currentQuantity || Number(formData.currentQuantity) < 0) 
      newErrors.currentQuantity = 'Valid current quantity is required';
    if (!formData.minimumQuantity || Number(formData.minimumQuantity) < 0) 
      newErrors.minimumQuantity = 'Valid minimum quantity is required';
    if (!formData.maximumQuantity || Number(formData.maximumQuantity) < Number(formData.minimumQuantity)) 
      newErrors.maximumQuantity = 'Maximum quantity must be greater than minimum';
    if (!formData.warehouse.trim()) newErrors.warehouse = 'Warehouse is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        itemName: '',
        itemCode: '',
        category: 'medical',
        subcategory: '',
        description: '',
        currentQuantity: '',
        minimumQuantity: '',
        maximumQuantity: '',
        unit: 'pieces',
        unitPrice: '',
        brand: '',
        model: '',
        size: '',
        weight: '',
        color: '',
        material: '',
        expiryDate: '',
        batchNumber: '',
        warehouse: '',
        section: '',
        rack: '',
        shelf: '',
        department: '',
        state: '',
        district: '',
        supplierName: '',
        supplierContact: '',
        supplierAddress: ''
      });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`
              relative w-full max-w-4xl rounded-2xl border shadow-2xl
              ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
            `}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Add New Inventory Item
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Basic Information
                  </h3>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.itemName}
                      onChange={(e) => handleInputChange('itemName', e.target.value)}
                      className={`
                        w-full px-3 py-2 rounded-lg border text-sm
                        ${errors.itemName 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : isDark
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-green-500/20
                      `}
                      placeholder="Enter item name"
                    />
                    {errors.itemName && (
                      <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Item Code *
                    </label>
                    <input
                      type="text"
                      value={formData.itemCode}
                      onChange={(e) => handleInputChange('itemCode', e.target.value.toUpperCase())}
                      className={`
                        w-full px-3 py-2 rounded-lg border text-sm
                        ${errors.itemCode 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : isDark
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-green-500/20
                      `}
                      placeholder="Enter item code (e.g., FE001)"
                    />
                    {errors.itemCode && (
                      <p className="text-red-500 text-xs mt-1">{errors.itemCode}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                      >
                        {categories.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Unit *
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => handleInputChange('unit', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                      >
                        {units.map(unit => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={`
                        w-full px-3 py-2 rounded-lg border text-sm resize-none
                        ${isDark
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-green-500/20
                      `}
                      placeholder="Enter item description"
                    />
                  </div>
                </div>

                {/* Quantity & Location */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Quantity & Location
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Qty *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.currentQuantity}
                        onChange={(e) => handleInputChange('currentQuantity', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${errors.currentQuantity 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                      />
                      {errors.currentQuantity && (
                        <p className="text-red-500 text-xs mt-1">{errors.currentQuantity}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Min Qty *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minimumQuantity}
                        onChange={(e) => handleInputChange('minimumQuantity', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${errors.minimumQuantity 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                      />
                      {errors.minimumQuantity && (
                        <p className="text-red-500 text-xs mt-1">{errors.minimumQuantity}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Max Qty *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maximumQuantity}
                        onChange={(e) => handleInputChange('maximumQuantity', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${errors.maximumQuantity 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                      />
                      {errors.maximumQuantity && (
                        <p className="text-red-500 text-xs mt-1">{errors.maximumQuantity}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      disabled={loadingDepartments}
                      className={`
                        w-full px-3 py-2 rounded-lg border text-sm
                        ${errors.department 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : isDark
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-green-500/20
                        ${loadingDepartments ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <option value="">
                        {loadingDepartments ? 'Loading departments...' : 'Select Department'}
                      </option>
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name} ({dept.code})
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        State *
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${errors.state 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        District *
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => handleInputChange('district', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${errors.district 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                            : isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                        placeholder="Enter district"
                      />
                      {errors.district && (
                        <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Warehouse *
                    </label>
                    <input
                      type="text"
                      value={formData.warehouse}
                      onChange={(e) => handleInputChange('warehouse', e.target.value)}
                      className={`
                        w-full px-3 py-2 rounded-lg border text-sm
                        ${errors.warehouse 
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                          : isDark
                          ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                        }
                        focus:outline-none focus:ring-2 focus:ring-green-500/20
                      `}
                      placeholder="Enter warehouse name"
                    />
                    {errors.warehouse && (
                      <p className="text-red-500 text-xs mt-1">{errors.warehouse}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Section
                      </label>
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) => handleInputChange('section', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                        placeholder="Section"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Rack
                      </label>
                      <input
                        type="text"
                        value={formData.rack}
                        onChange={(e) => handleInputChange('rack', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                        placeholder="Rack"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Shelf
                      </label>
                      <input
                        type="text"
                        value={formData.shelf}
                        onChange={(e) => handleInputChange('shelf', e.target.value)}
                        className={`
                          w-full px-3 py-2 rounded-lg border text-sm
                          ${isDark
                            ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                          }
                          focus:outline-none focus:ring-2 focus:ring-green-500/20
                        `}
                        placeholder="Shelf"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details (Collapsible) */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <details className="group">
                  <summary className={`cursor-pointer list-none text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Additional Details (Optional)
                    <span className="ml-2 group-open:rotate-90 transition-transform">▶</span>
                  </summary>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Specifications */}
                    <div className="space-y-4">
                      <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Specifications
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Brand
                          </label>
                          <input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => handleInputChange('brand', e.target.value)}
                            className={`
                              w-full px-3 py-2 rounded-lg border text-sm
                              ${isDark
                                ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                              }
                              focus:outline-none focus:ring-2 focus:ring-green-500/20
                            `}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Model
                          </label>
                          <input
                            type="text"
                            value={formData.model}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                            className={`
                              w-full px-3 py-2 rounded-lg border text-sm
                              ${isDark
                                ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                              }
                              focus:outline-none focus:ring-2 focus:ring-green-500/20
                            `}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Unit Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.unitPrice}
                            onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                            className={`
                              w-full px-3 py-2 rounded-lg border text-sm
                              ${isDark
                                ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                              }
                              focus:outline-none focus:ring-2 focus:ring-green-500/20
                            `}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Expiry Date
                          </label>
                          <input
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                            className={`
                              w-full px-3 py-2 rounded-lg border text-sm
                              ${isDark
                                ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                              }
                              focus:outline-none focus:ring-2 focus:ring-green-500/20
                            `}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Supplier Information */}
                    <div className="space-y-4">
                      <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Supplier Information
                      </h4>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Supplier Name
                        </label>
                        <input
                          type="text"
                          value={formData.supplierName}
                          onChange={(e) => handleInputChange('supplierName', e.target.value)}
                          className={`
                            w-full px-3 py-2 rounded-lg border text-sm
                            ${isDark
                              ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                            }
                            focus:outline-none focus:ring-2 focus:ring-green-500/20
                          `}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Supplier Contact
                        </label>
                        <input
                          type="text"
                          value={formData.supplierContact}
                          onChange={(e) => handleInputChange('supplierContact', e.target.value)}
                          className={`
                            w-full px-3 py-2 rounded-lg border text-sm
                            ${isDark
                              ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                            }
                            focus:outline-none focus:ring-2 focus:ring-green-500/20
                          `}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Supplier Address
                        </label>
                        <textarea
                          rows={3}
                          value={formData.supplierAddress}
                          onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
                          className={`
                            w-full px-3 py-2 rounded-lg border text-sm resize-none
                            ${isDark
                              ? 'bg-gray-800 border-gray-600 text-white focus:border-green-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:border-green-500'
                            }
                            focus:outline-none focus:ring-2 focus:ring-green-500/20
                          `}
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-colors
                    ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className={`
                    px-6 py-2 rounded-lg font-medium text-white transition-colors
                    ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="h-4 w-4 mr-2 inline" />
                  Add Item
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

// Update Stock Modal Component
function UpdateStockModal({ 
  isOpen, 
  onClose, 
  item, 
  onSubmit, 
  isDark 
}: {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSubmit: (itemId: string, newQuantity: number, reason: string) => void;
  isDark: boolean;
}) {
  const [formData, setFormData] = useState({
    currentQuantity: 0,
    reason: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        currentQuantity: item.quantity.current,
        reason: ''
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item && formData.currentQuantity >= 0 && formData.reason.trim()) {
      onSubmit(item._id, formData.currentQuantity, formData.reason);
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`
            w-full max-w-md rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto
            ${isDark ? 'bg-gray-800' : 'bg-white'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Update Stock - {item.itemName}
              </h2>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Stock Info */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className={`block font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current Stock
                    </label>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.quantity.current}
                    </span>
                  </div>
                  <div>
                    <label className={`block font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Minimum
                    </label>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.quantity.minimum}
                    </span>
                  </div>
                  <div>
                    <label className={`block font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Maximum
                    </label>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.quantity.maximum}
                    </span>
                  </div>
                </div>
              </div>

              {/* New Quantity */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  max={item.quantity.maximum}
                  value={formData.currentQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentQuantity: parseInt(e.target.value) || 0 }))}
                  className={`
                    w-full px-3 py-2 rounded-lg border text-sm
                    ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-green-500/20
                  `}
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Reason for Update *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Stock replenishment, Usage, Damage, etc."
                  rows={3}
                  className={`
                    w-full px-3 py-2 rounded-lg border text-sm
                    ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-green-500/20
                  `}
                  required
                />
              </div>

              {/* Stock Level Warning */}
              {formData.currentQuantity <= item.quantity.minimum && (
                <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      Warning: New quantity is at or below minimum stock level
                    </span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`
                    flex-1 px-4 py-2 rounded-lg border font-medium transition-colors
                    ${isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.reason.trim() || formData.currentQuantity < 0}
                  className={`
                    flex-1 px-4 py-2 rounded-lg font-medium transition-colors
                    ${formData.reason.trim() && formData.currentQuantity >= 0
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    }
                  `}
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// View Details Modal Component
function ViewDetailsModal({ 
  isOpen, 
  onClose, 
  item, 
  isDark 
}: {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  isDark: boolean;
}) {
  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`
            w-full max-w-4xl rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto
            ${isDark ? 'bg-gray-800' : 'bg-white'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {item.itemName} Details
              </h2>
              <button
                onClick={onClose}
                className={`p-1 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Item Code
                    </label>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.itemCode}
                    </span>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800`}>
                      {item.category.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {item.subcategory && (
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Subcategory
                      </label>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.subcategory}
                      </span>
                    </div>
                  )}
                  {item.description && (
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                      </label>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Stock Information
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Stock
                      </label>
                      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.quantity.current} {item.unit}
                      </span>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Reserved
                      </label>
                      <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.quantity.reserved} {item.unit}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Minimum
                      </label>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.quantity.minimum} {item.unit}
                      </span>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Maximum
                      </label>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.quantity.maximum} {item.unit}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'available' ? 'bg-green-100 text-green-800' :
                      item.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Location
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Department
                    </label>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.location.department.name}
                    </span>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Warehouse
                    </label>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {item.location.warehouse}
                    </span>
                  </div>
                  {(item.location.section || item.location.rack || item.location.shelf) && (
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Detailed Location
                      </label>
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {[item.location.section, item.location.rack, item.location.shelf].filter(Boolean).join(' → ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications */}
              {item.specifications && Object.keys(item.specifications).some(key => item.specifications?.[key as keyof typeof item.specifications]) && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Specifications
                  </h3>
                  <div className="space-y-3">
                    {item.specifications.brand && (
                      <div>
                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Brand
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.specifications.brand}
                        </span>
                      </div>
                    )}
                    {item.specifications.model && (
                      <div>
                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Model
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.specifications.model}
                        </span>
                      </div>
                    )}
                    {item.specifications.batchNumber && (
                      <div>
                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Batch Number
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.specifications.batchNumber}
                        </span>
                      </div>
                    )}
                    {item.specifications.expiryDate && (
                      <div>
                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Expiry Date
                        </label>
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(item.specifications.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            {item.notes && (
              <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Notes
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.notes}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  item, 
  onConfirm, 
  isDark,
  isDeleting = false 
}: {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onConfirm: (itemId: string, permanent?: boolean) => void;
  isDark: boolean;
  isDeleting?: boolean;
}) {
  const [deleteType, setDeleteType] = useState<'soft' | 'permanent'>('soft');
  
  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`
            w-full max-w-md rounded-lg shadow-2xl
            ${isDark ? 'bg-gray-800' : 'bg-white'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Delete Inventory Item
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
            </div>

            {/* Item Details */}
            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="space-y-2">
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Item Name:
                  </span>
                  <span className={`ml-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.itemName}
                  </span>
                </div>
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Item Code:
                  </span>
                  <span className={`ml-2 text-sm font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.itemCode}
                  </span>
                </div>
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Current Stock:
                  </span>
                  <span className={`ml-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.quantity.current} {item.unit}
                  </span>
                </div>
                <div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Department:
                  </span>
                  <span className={`ml-2 text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.location.department.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Delete Type Selection */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Deletion Type
              </label>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="deleteType"
                    value="soft"
                    checked={deleteType === 'soft'}
                    onChange={(e) => setDeleteType(e.target.value as 'soft' | 'permanent')}
                    className="mt-1 mr-3 text-blue-600"
                  />
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Archive (Recommended)
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Hide item from inventory but keep in database for records. Can be restored later.
                    </div>
                  </div>
                </label>
                <label className="flex items-start">
                  <input
                    type="radio"
                    name="deleteType"
                    value="permanent"
                    checked={deleteType === 'permanent'}
                    onChange={(e) => setDeleteType(e.target.value as 'soft' | 'permanent')}
                    className="mt-1 mr-3 text-red-600"
                  />
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Permanent Delete
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Completely remove from database. This action cannot be undone.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Warning Message */}
            <div className={`border rounded-lg p-3 mb-6 ${
              deleteType === 'permanent' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-start">
                <AlertTriangle className={`w-5 h-5 mt-0.5 mr-2 flex-shrink-0 ${
                  deleteType === 'permanent' 
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} />
                <div>
                  {deleteType === 'permanent' ? (
                    <>
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        Warning: This will permanently delete the item
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                        All associated transaction history and data will be completely removed from the database.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        Item will be archived
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        The item will be hidden from inventory but can be restored by administrators if needed.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className={`
                  flex-1 px-4 py-2 rounded-lg border font-medium transition-colors
                  ${isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                  ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm(item._id, deleteType === 'permanent')}
                disabled={isDeleting}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white
                  ${isDeleting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : deleteType === 'permanent'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }
                `}
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {deleteType === 'permanent' ? 'Deleting...' : 'Archiving...'}
                  </div>
                ) : (
                  deleteType === 'permanent' ? 'Delete Permanently' : 'Archive Item'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Inventory Component
function InventoryView({ isDark }: { isDark: boolean }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [updateStockModal, setUpdateStockModal] = useState<{isOpen: boolean, item: InventoryItem | null}>({isOpen: false, item: null});
  const [viewDetailsModal, setViewDetailsModal] = useState<{isOpen: boolean, item: InventoryItem | null}>({isOpen: false, item: null});
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, item: InventoryItem | null}>({isOpen: false, item: null});
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'medical', label: 'Medical' },
    { id: 'rescue_equipment', label: 'Rescue Equipment' },
    { id: 'food_supplies', label: 'Food Supplies' },
    { id: 'water_supplies', label: 'Water Supplies' },
    { id: 'shelter_materials', label: 'Shelter Materials' },
    { id: 'communication', label: 'Communication' },
    { id: 'transportation', label: 'Transportation' },
  ];

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<any>(null);
  
  // Socket integration
  const { subscribe, subscribeToInventory } = useSocket();

  // Set up real-time event listeners
  useEffect(() => {
    subscribeToInventory();
    
    const unsubscribeInventoryCreated = subscribe('inventoryCreated', (data: any) => {
      console.log('New inventory item created:', data);
      setNotification({ 
        message: `New item "${data.inventory?.itemName}" was added`, 
        type: 'success' 
      });
      // Refresh data if it affects current view
      fetchInventoryData();
      fetchDashboardStats();
    });

    const unsubscribeInventoryUpdated = subscribe('inventoryUpdated', (data: any) => {
      console.log('Inventory item updated:', data);
      setNotification({ 
        message: `Item "${data.inventory?.itemName}" was updated`, 
        type: 'success' 
      });
      // Update local state
      setInventoryItems(prev => 
        prev.map(item => 
          item._id === data.inventory?._id ? { ...item, ...data.inventory } : item
        )
      );
      fetchDashboardStats();
    });

    const unsubscribeInventoryDeleted = subscribe('inventoryDeleted', (data: any) => {
      console.log('Inventory item deleted:', data);
      setNotification({ 
        message: 'An item was removed from inventory', 
        type: 'success' 
      });
      // Remove from local state
      setInventoryItems(prev => prev.filter(item => item._id !== data.id));
      fetchDashboardStats();
    });

    // Cleanup function
    return () => {
      unsubscribeInventoryCreated();
      unsubscribeInventoryUpdated();
      unsubscribeInventoryDeleted();
    };
  }, []);

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        order: sortOrder,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await inventoryAPI.getAll(params);
      
      if (response.success) {
        setInventoryItems(response.data || []);
        setPaginationInfo(response.pagination);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch inventory data');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await inventoryAPI.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInventoryData();
    fetchDashboardStats();
  }, [currentPage, itemsPerPage, sortBy, sortOrder, selectedCategory]);

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchInventoryData();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStockPercentage = (current: number, maximum: number) => {
    return Math.min((current / maximum) * 100, 100);
  };

  const getStockBarColor = (current: number, minimum: number) => {
    if (current <= minimum * 0.5) return 'bg-red-500';
    if (current <= minimum) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleAddNewItem = async (itemData: any) => {
    try {
      setLoading(true);

      // Prepare data for API
      const apiData = {
        itemName: itemData.itemName,
        itemCode: itemData.itemCode,
        category: itemData.category,
        ...(itemData.subcategory && { subcategory: itemData.subcategory }),
        ...(itemData.description && { description: itemData.description }),
        quantity: {
          current: parseInt(itemData.currentQuantity),
          minimum: parseInt(itemData.minimumQuantity),
          maximum: parseInt(itemData.maximumQuantity),
        },
        unit: itemData.unit,
        location: {
          department: itemData.department,
          warehouse: itemData.warehouse,
          ...(itemData.section && { section: itemData.section }),
          ...(itemData.rack && { rack: itemData.rack }),
          ...(itemData.shelf && { shelf: itemData.shelf }),
        },
        ...((itemData.brand || itemData.model || itemData.expiryDate || itemData.batchNumber) && {
          specifications: {
            ...(itemData.brand && { brand: itemData.brand }),
            ...(itemData.model && { model: itemData.model }),
            ...(itemData.expiryDate && { expiryDate: itemData.expiryDate }),
            ...(itemData.batchNumber && { batchNumber: itemData.batchNumber }),
          }
        }),
        cost: itemData.unitPrice ? {
          unitPrice: parseFloat(itemData.unitPrice),
          currency: 'INR',
        } : undefined,
        ...((itemData.supplierName || itemData.supplierContact || itemData.supplierAddress) && {
          supplier: {
            ...(itemData.supplierName && { name: itemData.supplierName }),
            ...(itemData.supplierContact && { contact: itemData.supplierContact }),
            ...(itemData.supplierAddress && { address: itemData.supplierAddress }),
          }
        }),
        ...(itemData.notes && { notes: itemData.notes }),
      };

      const response = await inventoryAPI.create(apiData);
      
      if (response.success) {
        setNotification({ 
          message: `${itemData.itemName} has been added successfully!`, 
          type: 'success' 
        });
        
        // Refresh inventory data
        await fetchInventoryData();
        await fetchDashboardStats();
      } else {
        setNotification({ 
          message: response.message || 'Failed to add item', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error adding inventory item:', error);
      setNotification({ 
        message: 'Failed to add item. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleUpdateStock = async (itemId: string, newQuantity: number, reason: string) => {
    try {
      setLoading(true);
      
      const response = await inventoryAPI.update(itemId, {
        quantity: {
          current: newQuantity
        },
        adjustmentReason: reason
      });
      
      if (response.success) {
        setNotification({ 
          message: 'Stock updated successfully!', 
          type: 'success' 
        });
        
        // Refresh inventory data
        await fetchInventoryData();
        await fetchDashboardStats();
      } else {
        setNotification({ 
          message: response.message || 'Failed to update stock', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      setNotification({ 
        message: 'Failed to update stock. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteItem = async (itemId: string, permanent = false) => {
    try {
      setIsDeleting(true);
      
      const response = await inventoryAPI.delete(itemId, permanent);
      
      if (response.success) {
        setNotification({ 
          message: permanent ? 'Item permanently deleted!' : 'Item archived successfully!', 
          type: 'success' 
        });
        
        // Close modal
        setDeleteModal({isOpen: false, item: null});
        
        // Refresh inventory data
        await fetchInventoryData();
        await fetchDashboardStats();
      } else {
        setNotification({ 
          message: response.message || `Failed to ${permanent ? 'delete' : 'archive'} item`, 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setNotification({ 
        message: `Failed to ${permanent ? 'delete' : 'archive'} item. Please try again.`, 
        type: 'error' 
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Items"
          value={dashboardStats?.overview?.totalItems?.toString() || "0"}
          trend={loading ? "Loading..." : "Current total"}
          icon={Package}
          color="text-blue-500"
          isDark={isDark}
        />
        <StatsCard
          title="Low Stock Alerts"
          value={dashboardStats?.overview?.lowStockCount?.toString() || "0"}
          trend={loading ? "Loading..." : "Items below minimum"}
          icon={AlertTriangle}
          color="text-yellow-500"
          isDark={isDark}
        />
        <StatsCard
          title="Critical Items"
          value={dashboardStats?.overview?.criticalStockCount?.toString() || "0"}
          trend={loading ? "Loading..." : "Immediate attention needed"}
          icon={AlertTriangle}
          color="text-red-500"
          isDark={isDark}
        />
        <StatsCard
          title="Out of Stock"
          value={dashboardStats?.overview?.outOfStockCount?.toString() || "0"}
          trend={loading ? "Loading..." : "No items available"}
          icon={BarChart3}
          color="text-red-600"
          isDark={isDark}
        />
      </div>

      {/* Filters and Controls */}
      <div className={`
        p-4 rounded-xl border
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${selectedCategory === category.id
                    ? 'bg-green-500 text-white'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`
                  pl-9 pr-4 py-2 w-64 rounded-lg border text-sm
                  ${isDark
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-green-500'
                  }
                  focus:outline-none focus:ring-2 focus:ring-green-500/20
                `}
              />
            </div>
            <motion.button 
              onClick={() => setIsAddModalOpen(true)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
                text-white
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4" />
              Add New Item
            </motion.button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className={`
        rounded-xl border overflow-hidden
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`
              ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}
              border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}
            `}>
              <tr>
                <th className={`text-left py-4 px-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Item Details
                </th>
                <th className={`text-left py-4 px-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Category
                </th>
                <th className={`text-left py-4 px-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Status
                </th>
                <th className={`text-left py-4 px-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Stock Level
                </th>
                <th className={`text-left py-4 px-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Location
                </th>
                <th className={`text-left py-4 px-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Department
                </th>
                <th className={`text-right py-4 px-6 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: itemsPerPage }).map((_, index) => (
                  <tr key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className={`h-4 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                        <div className={`h-3 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`h-6 w-24 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`h-6 w-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className={`h-3 w-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                        <div className={`h-2 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className={`h-3 w-28 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                        <div className={`h-3 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`h-4 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end space-x-2">
                        <div className={`h-8 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                        <div className={`h-8 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : inventoryItems.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No inventory items found
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                      {searchTerm ? 'Try adjusting your search terms' : 'Add your first inventory item to get started'}
                    </div>
                  </td>
                </tr>
              ) : (
                // Actual data
                inventoryItems.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    className={`
                      border-b transition-colors duration-200
                      ${isDark ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-200 hover:bg-gray-50'}
                    `}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.itemName}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.itemCode}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}
                      `}>
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.quantity.current}/{item.quantity.maximum}
                          </span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getStockPercentage(item.quantity.current, item.quantity.maximum).toFixed(0)}%
                          </span>
                        </div>
                        <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getStockBarColor(item.quantity.current, item.quantity.minimum)}`}
                            style={{ width: `${getStockPercentage(item.quantity.current, item.quantity.maximum)}%` }}
                          />
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Min: {item.quantity.minimum}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.location.warehouse}
                        {item.location.section && ` → ${item.location.section}`}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.location.department?.name || 'Unknown Department'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item.location.department?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end space-x-1 lg:space-x-2">
                        <motion.button
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                            ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setViewDetailsModal({isOpen: true, item});
                          }}
                        >
                          View Details
                        </motion.button>
                        <motion.button
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-white
                            ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setUpdateStockModal({isOpen: true, item});
                          }}
                        >
                          Update Stock
                        </motion.button>
                        <motion.button
                          className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-white
                            ${isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setDeleteModal({isOpen: true, item});
                          }}
                        >
                          <Trash2 className="h-3 w-3 mr-1 inline" />
                          Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className={`
          px-6 py-4 border-t
          ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}
        `}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {paginationInfo ? (
                `Showing ${((paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage) + 1} to ${Math.min(paginationInfo.currentPage * paginationInfo.itemsPerPage, paginationInfo.totalItems)} of ${paginationInfo.totalItems} items`
              ) : (
                'Loading...'
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={!paginationInfo?.hasPrev || loading}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${!paginationInfo?.hasPrev || loading
                    ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                Previous
              </button>
              <span className={`px-3 py-2 rounded-lg text-sm font-medium bg-green-500 text-white`}>
                {paginationInfo?.currentPage || currentPage}
              </span>
              {paginationInfo?.totalPages && paginationInfo.totalPages > 1 && (
                <>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    of {paginationInfo.totalPages}
                  </span>
                </>
              )}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!paginationInfo?.hasNext || loading}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${!paginationInfo?.hasNext || loading
                    ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`
              fixed top-4 left-1/2 transform -translate-x-1/2 z-50
              px-6 py-3 rounded-lg shadow-lg border
              ${notification.type === 'success'
                ? isDark ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-100 border-green-300 text-green-800'
                : isDark ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-100 border-red-300 text-red-800'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add New Item Modal */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddNewItem}
        isDark={isDark}
      />

      {/* Update Stock Modal */}
      <UpdateStockModal
        isOpen={updateStockModal.isOpen}
        onClose={() => setUpdateStockModal({isOpen: false, item: null})}
        item={updateStockModal.item}
        onSubmit={handleUpdateStock}
        isDark={isDark}
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewDetailsModal.isOpen}
        onClose={() => setViewDetailsModal({isOpen: false, item: null})}
        item={viewDetailsModal.item}
        isDark={isDark}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({isOpen: false, item: null})}
        item={deleteModal.item}
        onConfirm={handleDeleteItem}
        isDark={isDark}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// AI Analysis Component
function AIAnalysisView({ isDark }: { isDark: boolean }) {
  return (
    <div className="space-y-6">
      <div className={`
        p-8 rounded-xl border text-center
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <Brain className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          AI Analysis Dashboard
        </h3>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          Intelligent insights and predictive analytics for disaster management and inventory optimization.
        </p>
        <button className={`
          px-6 py-3 rounded-lg font-medium transition-colors
          ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
          text-white
        `}>
          Coming Soon
        </button>
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const { isDark, setIsDark, mounted } = useTheme();
  const [activeTab, setActiveTab] = useState('inventory');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { connect, disconnect, isConnected } = useSocket();

  // Initialize socket connection at dashboard level
  useEffect(() => {
    const socket = connect();
    return () => {
      disconnect();
    };
  }, []);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          isDark={isDark}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            isDark={isDark}
            setIsDark={setIsDark}
            setIsMobileOpen={setIsMobileOpen}
            isConnected={isConnected}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'inventory' && <InventoryView isDark={isDark} />}
                {activeTab === 'ai-analysis' && <AIAnalysisView isDark={isDark} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
