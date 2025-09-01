"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { inventoryAPI, departmentAPI } from "../../lib/api";
import type { InventoryItem, Department } from "../../lib/api";
import { useSocket } from "../../lib/socket";
import { StatsCard } from "./StatsCard";
import { AddItemModal } from "./inventory/AddItemModal";
import { UpdateStockModal } from "./inventory/UpdateStockModal";
import { ViewDetailsModal } from "./inventory/ViewDetailsModal";
import { DeleteConfirmationModal } from "./inventory/DeleteConfirmationModal";

interface InventoryViewProps {
  isDark: boolean;
}

export function InventoryView({ isDark }: InventoryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    <div className="space-y-4 md:space-y-6">
      {/* Stats Overview */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-3 rounded mb-4 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
        p-3 md:p-4 rounded-xl border
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <div className="space-y-4">
          {/* Categories - Horizontal scroll on mobile */}
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap
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
          </div>

          {/* Search and Add Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`
                  pl-9 pr-4 py-2 w-full rounded-lg border text-sm
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
                px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto
                ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
                text-white
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4" />
              <span>Add New Item</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Inventory Table - Desktop */}
      <div className={`
        hidden lg:block rounded-xl border overflow-hidden
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

      {/* Inventory Cards - Mobile & Tablet */}
      <div className={`lg:hidden space-y-3`}>
        {loading ? (
          // Mobile Loading skeleton
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <div key={index} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className={`h-4 w-32 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                    <div className={`h-3 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                  </div>
                  <div className={`h-6 w-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                </div>
                <div className={`h-2 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                <div className="flex justify-between items-center">
                  <div className={`h-3 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                  <div className="flex gap-2">
                    <div className={`h-8 w-16 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                    <div className={`h-8 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : inventoryItems.length === 0 ? (
          // Mobile Empty state
          <div className={`p-8 rounded-xl border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
              No inventory items found
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first inventory item to get started'}
            </div>
          </div>
        ) : (
          // Mobile Cards
          inventoryItems.map((item, index) => (
            <motion.div
              key={item._id}
              className={`
                p-4 rounded-xl border
                ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                shadow-sm
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                    {item.itemName}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} font-mono`}>
                    {item.itemCode}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
                    {item.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Stock Progress */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Stock: {item.quantity.current}/{item.quantity.maximum} {item.unit}
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
                <div className="flex justify-between text-xs mt-1">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Min: {item.quantity.minimum}
                  </span>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Max: {item.quantity.maximum}
                  </span>
                </div>
              </div>

              {/* Location & Department */}
              <div className="mb-4">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  <span className="font-medium">Location:</span> {item.location.warehouse}
                  {item.location.section && ` → ${item.location.section}`}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="font-medium">Dept:</span> {item.location.department?.name || 'Unknown Department'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                    ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setViewDetailsModal({isOpen: true, item});
                  }}
                >
                  View
                </motion.button>
                <motion.button
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white
                    ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setUpdateStockModal({isOpen: true, item});
                  }}
                >
                  Update
                </motion.button>
                <motion.button
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white
                    ${isDark ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setDeleteModal({isOpen: true, item});
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
        
        {/* Mobile Pagination */}
        {inventoryItems.length > 0 && (
          <div className={`
            p-4 rounded-xl border
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          `}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className={`text-sm text-center sm:text-left ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {paginationInfo ? (
                  `${((paginationInfo.currentPage - 1) * paginationInfo.itemsPerPage) + 1}-${Math.min(paginationInfo.currentPage * paginationInfo.itemsPerPage, paginationInfo.totalItems)} of ${paginationInfo.totalItems}`
                ) : (
                  'Loading...'
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
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
                  Prev
                </button>
                <span className={`px-3 py-2 rounded-lg text-sm font-medium bg-green-500 text-white`}>
                  {paginationInfo?.currentPage || currentPage}
                </span>
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
        )}
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
