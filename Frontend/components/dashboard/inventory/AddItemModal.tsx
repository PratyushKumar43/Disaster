"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save } from "lucide-react";
import { departmentAPI } from "../../../lib/api";
import type { Department } from "../../../lib/api";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: any) => void;
  isDark: boolean;
}

export function AddItemModal({ isOpen, onClose, onSubmit, isDark }: AddItemModalProps) {
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
        <div className="flex min-h-full items-center justify-center p-2 md:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`
              relative w-full max-w-4xl rounded-xl md:rounded-2xl border shadow-2xl max-h-[95vh] overflow-hidden
              ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
            `}
          >
            {/* Header */}
            <div className={`px-4 md:px-6 py-3 md:py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-10 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`text-lg md:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                  Add New Inventory Item
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:space-x-3 sm:gap-0 mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className={`
                    w-full sm:w-auto px-4 md:px-6 py-2 rounded-lg font-medium transition-colors order-2 sm:order-1
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
                    w-full sm:w-auto px-4 md:px-6 py-2 rounded-lg font-medium text-white transition-colors order-1 sm:order-2
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
