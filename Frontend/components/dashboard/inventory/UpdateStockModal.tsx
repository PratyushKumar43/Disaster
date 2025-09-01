"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { XCircle, AlertTriangle } from "lucide-react";
import type { InventoryItem } from "../../../lib/api";

interface UpdateStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSubmit: (itemId: string, newQuantity: number, reason: string) => void;
  isDark: boolean;
}

export function UpdateStockModal({ isOpen, onClose, item, onSubmit, isDark }: UpdateStockModalProps) {
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
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4"
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
