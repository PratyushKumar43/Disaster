"use client";

import { motion, AnimatePresence } from "motion/react";
import { XCircle } from "lucide-react";
import type { InventoryItem } from "../../../lib/api";

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  isDark: boolean;
}

export function ViewDetailsModal({ isOpen, onClose, item, isDark }: ViewDetailsModalProps) {
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
