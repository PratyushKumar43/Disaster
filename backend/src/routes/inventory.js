const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  getCriticalStockItems,
  getExpiringItems,
  getExpiredItems,
  reserveInventory,
  releaseReservedInventory,
  getDashboardStats
} = require('../controllers/inventoryController');
// Authentication middleware removed
const CONSTANTS = require('../config/constants');

// Authentication protection removed

// Dashboard statistics route
router.get('/dashboard/stats', getDashboardStats);

// Alert routes
router.get('/alerts/low-stock', getLowStockItems);
router.get('/alerts/critical-stock', getCriticalStockItems);
router.get('/alerts/expiring', getExpiringItems);
router.get('/alerts/expired', getExpiredItems);

// Main inventory routes (authentication disabled for now)
router.route('/')
  .get(getAllInventory)
  .post(createInventoryItem);

// Individual inventory item routes
router.route('/:id')
  .get(getInventoryById)
  .put(updateInventoryItem)
  .delete(deleteInventoryItem);

// Inventory reservation routes
router.post('/:id/reserve', reserveInventory);
router.post('/:id/release', releaseReservedInventory);

module.exports = router;
