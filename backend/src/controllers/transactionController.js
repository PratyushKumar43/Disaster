const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');
const { validateTransaction, validatePaginationQuery } = require('../utils/validators');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const CONSTANTS = require('../config/constants');
const { logger } = require('../config/database');

// @desc    Get all transactions with filtering and pagination
// @route   GET /api/v1/transactions
// @access  Private
const getAllTransactions = asyncHandler(async (req, res, next) => {
  // Validate query parameters
  const { error, value: query } = validatePaginationQuery(req.query);
  if (error) {
    return next(new AppError(error.details[0].message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR'));
  }

  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    search,
    type,
    status,
    department,
    startDate,
    endDate,
    priority,
    emergencyLevel
  } = req.query;

  // Build filter object
  const filter = { isDeleted: false };
  
  // Department filter (removed auth-based restrictions)
  if (department) {
    filter.$or = [
      { 'from.department': department },
      { 'to.department': department }
    ];
  }

  // Apply filters
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (emergencyLevel) filter.emergencyLevel = emergencyLevel;

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Search functionality
  if (search) {
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { transactionId: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ]
    });
  }

  // Sort configuration
  const sortObj = {};
  sortObj[sort] = order === 'asc' ? 1 : -1;

  // Pagination options
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      {
        path: 'inventory',
        select: 'itemName itemCode category unit'
      },
      {
        path: 'performedBy',
        select: 'firstName lastName username email'
      },
      {
        path: 'approvedBy',
        select: 'firstName lastName username'
      },
      {
        path: 'receivedBy',
        select: 'firstName lastName username'
      },
      {
        path: 'from.department',
        select: 'name code type'
      },
      {
        path: 'to.department',
        select: 'name code type'
      }
    ],
    sort: sortObj
  };

  const result = await Transaction.paginate(filter, options);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    data: result.docs,
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalItems: result.totalDocs,
      itemsPerPage: result.limit,
      hasNext: result.hasNextPage,
      hasPrev: result.hasPrevPage
    },
    filters: {
      type,
      status,
      department,
      priority,
      emergencyLevel,
      startDate,
      endDate,
      search
    }
  });
});

// @desc    Get single transaction
// @route   GET /api/v1/transactions/:id
// @access  Private
const getTransactionById = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findOne({
    _id: req.params.id,
    isDeleted: false
  })
    .populate('inventory', 'itemName itemCode category specifications location')
    .populate('performedBy', 'firstName lastName username email phoneNumber')
    .populate('approvedBy', 'firstName lastName username email')
    .populate('receivedBy', 'firstName lastName username email')
    .populate('from.department', 'name code type state district contactInfo')
    .populate('to.department', 'name code type state district contactInfo')
    .populate('timeline.user', 'firstName lastName username');

  if (!transaction) {
    return next(new AppError('Transaction not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'TRANSACTION_NOT_FOUND'));
  }

  // Access control removed

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    data: transaction
  });
});

// @desc    Create new transaction
// @route   POST /api/v1/transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res, next) => {
  // Validate request data
  const { error } = validateTransaction(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR'));
  }

  // Verify inventory item exists
  const inventory = await Inventory.findOne({
    _id: req.body.inventory,
    isDeleted: false
  }).populate('location.department');

  if (!inventory) {
    return next(new AppError('Inventory item not found', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVENTORY_NOT_FOUND'));
  }

  // Access control removed

  // Validate transaction type and quantities
  const { type, quantity, unit } = req.body;

  if (unit !== inventory.unit) {
    return next(new AppError('Transaction unit must match inventory unit', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'UNIT_MISMATCH'));
  }

  // For outbound transactions, check available quantity
  if (type === CONSTANTS.TRANSACTION_TYPES.OUTBOUND) {
    if (quantity > inventory.availableQuantity) {
      return next(new AppError(CONSTANTS.ERRORS.INSUFFICIENT_STOCK, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INSUFFICIENT_STOCK'));
    }
  }

  // Generate unique transaction ID
  const transactionId = await Transaction.generateTransactionId();

  // Set default values
  req.body.transactionId = transactionId;
  // performedBy removed (no user tracking)

  // Set from department for outbound transactions
  if (type === CONSTANTS.TRANSACTION_TYPES.OUTBOUND && !req.body.from.department) {
    req.body.from = {
      ...req.body.from,
      department: inventory.location.department._id,
      warehouse: inventory.location.warehouse
    };
  }

  // Set to department for inbound transactions
  if (type === CONSTANTS.TRANSACTION_TYPES.INBOUND && !req.body.to.department) {
    req.body.to = {
      ...req.body.to,
      department: inventory.location.department._id,
      warehouse: inventory.location.warehouse
    };
  }

  const transaction = await Transaction.create(req.body);

  // Update inventory quantities based on transaction type
  await updateInventoryFromTransaction(inventory, transaction, 'create');

  const populatedTransaction = await Transaction.findById(transaction._id)
    .populate('inventory', 'itemName itemCode category')
    .populate('performedBy', 'firstName lastName username')
    .populate('from.department', 'name code type')
    .populate('to.department', 'name code type');

  // Emit real-time update
  if (req.app.get('io')) {
    req.app.get('io').emit('transactionCreated', {
      transaction: populatedTransaction,
      departments: [
        transaction.from.department,
        transaction.to.department
      ].filter(Boolean)
    });
  }

  logger.info(`Transaction created: ${transaction.transactionId}`);

  res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
    success: true,
    message: CONSTANTS.SUCCESS.TRANSACTION_CREATED,
    data: populatedTransaction
  });
});

// @desc    Update transaction status
// @route   PATCH /api/v1/transactions/:id/status
// @access  Private
const updateTransactionStatus = asyncHandler(async (req, res, next) => {
  const { status, comment } = req.body;

  if (!status || !Object.values(CONSTANTS.TRANSACTION_STATUS).includes(status)) {
    return next(new AppError('Valid status is required', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS'));
  }

  const transaction = await Transaction.findOne({
    _id: req.params.id,
    isDeleted: false
  }).populate('inventory');

  if (!transaction) {
    return next(new AppError('Transaction not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'TRANSACTION_NOT_FOUND'));
  }

  // Check permissions
  const canUpdate = req.user.role === CONSTANTS.USER_ROLES.ADMIN ||
    req.user.hasPermission('transactions', 'approve') ||
    transaction.performedBy.equals(req.user._id);

  if (!canUpdate) {
    return next(new AppError('Access denied', CONSTANTS.HTTP_STATUS.FORBIDDEN, 'ACCESS_DENIED'));
  }

  // Validate status transition
  const currentStatus = transaction.status;
  const validTransitions = {
    [CONSTANTS.TRANSACTION_STATUS.PENDING]: [
      CONSTANTS.TRANSACTION_STATUS.APPROVED,
      CONSTANTS.TRANSACTION_STATUS.CANCELLED
    ],
    [CONSTANTS.TRANSACTION_STATUS.APPROVED]: [
      CONSTANTS.TRANSACTION_STATUS.COMPLETED,
      CONSTANTS.TRANSACTION_STATUS.CANCELLED
    ]
  };

  if (!validTransitions[currentStatus]?.includes(status)) {
    return next(new AppError(`Cannot change status from ${currentStatus} to ${status}`, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS_TRANSITION'));
  }

  // Update transaction based on new status
  if (status === CONSTANTS.TRANSACTION_STATUS.APPROVED) {
    await transaction.approve(null, comment);
  } else if (status === CONSTANTS.TRANSACTION_STATUS.COMPLETED) {
    await transaction.complete(null, comment);
    // Update inventory quantities
    await updateInventoryFromTransaction(transaction.inventory, transaction, 'complete');
  } else if (status === CONSTANTS.TRANSACTION_STATUS.CANCELLED) {
    await transaction.cancel(null, comment || 'Transaction cancelled');
    // Reverse any inventory changes if needed
    if (currentStatus === CONSTANTS.TRANSACTION_STATUS.APPROVED) {
      await updateInventoryFromTransaction(transaction.inventory, transaction, 'cancel');
    }
  }

  const updatedTransaction = await Transaction.findById(transaction._id)
    .populate('inventory', 'itemName itemCode')
    .populate('performedBy', 'firstName lastName username')
    .populate('approvedBy', 'firstName lastName username')
    .populate('receivedBy', 'firstName lastName username');

  // Emit real-time update
  if (req.app.get('io')) {
    req.app.get('io').emit('transactionUpdated', {
      transaction: updatedTransaction,
      statusChange: { from: currentStatus, to: status }
    });
  }

  logger.info(`Transaction status updated: ${transaction.transactionId} ${currentStatus} → ${status}`);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    message: `Transaction ${status} successfully`,
    data: updatedTransaction
  });
});

// @desc    Get pending transactions
// @route   GET /api/v1/transactions/pending
// @access  Private
const getPendingTransactions = asyncHandler(async (req, res, next) => {
  const departmentId = req.query.department;

  const pendingTransactions = await Transaction.findPending(departmentId);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    count: pendingTransactions.length,
    data: pendingTransactions
  });
});

// @desc    Get overdue transactions
// @route   GET /api/v1/transactions/overdue
// @access  Private
const getOverdueTransactions = asyncHandler(async (req, res, next) => {
  const departmentId = req.query.department;

  const overdueTransactions = await Transaction.findOverdue(departmentId);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    count: overdueTransactions.length,
    data: overdueTransactions
  });
});

// @desc    Get transaction statistics
// @route   GET /api/v1/transactions/stats
// @access  Private
const getTransactionStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, department } = req.query;
  
  // Build match criteria
  const matchCriteria = { isDeleted: false };
  
  // Access control removed  
  if (department) {
    matchCriteria.$or = [
      { 'from.department': department },
      { 'to.department': department }
    ];
  }

  if (startDate || endDate) {
    matchCriteria.createdAt = {};
    if (startDate) matchCriteria.createdAt.$gte = new Date(startDate);
    if (endDate) matchCriteria.createdAt.$lte = new Date(endDate);
  }

  const stats = await Transaction.aggregate([
    { $match: matchCriteria },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        byType: {
          $push: {
            type: '$type',
            status: '$status'
          }
        },
        byStatus: {
          $push: '$status'
        },
        byPriority: {
          $push: '$priority'
        },
        totalQuantity: { $sum: '$quantity' },
        averageQuantity: { $avg: '$quantity' }
      }
    }
  ]);

  // Process statistics
  let processedStats = {
    overview: {
      totalTransactions: 0,
      totalQuantity: 0,
      averageQuantity: 0
    },
    byType: {},
    byStatus: {},
    byPriority: {}
  };

  if (stats.length > 0) {
    const stat = stats[0];
    processedStats.overview = {
      totalTransactions: stat.totalTransactions,
      totalQuantity: stat.totalQuantity,
      averageQuantity: Math.round(stat.averageQuantity * 100) / 100
    };

    // Process by type
    stat.byType.forEach(item => {
      if (!processedStats.byType[item.type]) {
        processedStats.byType[item.type] = {
          total: 0,
          completed: 0,
          pending: 0,
          cancelled: 0
        };
      }
      processedStats.byType[item.type].total++;
      processedStats.byType[item.type][item.status] = 
        (processedStats.byType[item.type][item.status] || 0) + 1;
    });

    // Process by status
    stat.byStatus.forEach(status => {
      processedStats.byStatus[status] = (processedStats.byStatus[status] || 0) + 1;
    });

    // Process by priority
    stat.byPriority.forEach(priority => {
      processedStats.byPriority[priority] = (processedStats.byPriority[priority] || 0) + 1;
    });
  }

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    data: processedStats,
    filters: { startDate, endDate, department }
  });
});

// Helper function to update inventory based on transaction
const updateInventoryFromTransaction = async (inventory, transaction, action) => {
  const { type, quantity } = transaction;

  try {
    if (action === 'create' || action === 'complete') {
      switch (type) {
        case CONSTANTS.TRANSACTION_TYPES.INBOUND:
          inventory.quantity.current += quantity;
          break;
        case CONSTANTS.TRANSACTION_TYPES.OUTBOUND:
          inventory.quantity.current -= quantity;
          // Release reserved quantity if any
          if (inventory.quantity.reserved >= quantity) {
            inventory.quantity.reserved -= quantity;
          }
          break;
        case CONSTANTS.TRANSACTION_TYPES.ADJUSTMENT:
          // Adjustment already handled in inventory controller
          break;
      }
    } else if (action === 'cancel') {
      // Reverse the transaction
      switch (type) {
        case CONSTANTS.TRANSACTION_TYPES.INBOUND:
          inventory.quantity.current -= quantity;
          break;
        case CONSTANTS.TRANSACTION_TYPES.OUTBOUND:
          inventory.quantity.current += quantity;
          break;
      }
    }

    await inventory.save();
  } catch (error) {
    logger.error('Error updating inventory from transaction:', error);
    throw error;
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionStatus,
  getPendingTransactions,
  getOverdueTransactions,
  getTransactionStats
};
