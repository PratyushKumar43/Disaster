const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  getPendingTransactions,
  getOverdueTransactions,
  getTransactionStats
} = require('../controllers/transactionController');
// Authentication middleware removed
const CONSTANTS = require('../config/constants');

// Authentication protection removed

// Statistics and alert routes
router.get('/stats', getTransactionStats);
router.get('/pending', getPendingTransactions);
router.get('/overdue', getOverdueTransactions);

// Main transaction routes
router.route('/')
  .get(getAllTransactions)
  .post(createTransaction);

// Individual transaction routes
router.route('/:id')
  .get(getTransactionById);

// Transaction status management
router.patch('/:id/status', updateTransactionStatus);

module.exports = router;
