"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";
import type { InventoryItem } from "../../../lib/api";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onConfirm: (itemId: string, permanent?: boolean) => void;
  isDark: boolean;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  item, 
  onConfirm, 
  isDark,
  isDeleting = false 
}: DeleteConfirmationModalProps) {
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
