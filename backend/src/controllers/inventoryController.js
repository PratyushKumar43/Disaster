const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const Department = require('../models/Department');
const { validateInventoryItem, validateUpdateInventory, validateInventoryQuery } = require('../utils/validators');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const CONSTANTS = require('../config/constants');
const { logger } = require('../config/database');

// @desc    Get all inventory items with filtering, pagination, and search
// @route   GET /api/v1/inventory
// @access  Private
const getAllInventory = asyncHandler(async (req, res, next) => {
  // Validate query parameters
  const { error, value: query } = validateInventoryQuery(req.query);
  if (error) {
    return next(new AppError(error.details[0].message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR'));
  }

  const {
    page,
    limit,
    sort = 'createdAt',
    order = 'desc',
    search,
    category,
    status,
    department,
    lowStock,
    criticalStock,
    expiring
  } = query;

  // Build filter object
  const filter = { isDeleted: false };
  
  // Department filter (removed auth-based restrictions)
  if (department) {
    filter['location.department'] = department;
  }

  // Apply filters
  if (category) filter.category = category;
  if (status) filter.status = status;

  // Search functionality
  if (search) {
    filter.$or = [
      { itemName: { $regex: search, $options: 'i' } },
      { itemCode: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'specifications.brand': { $regex: search, $options: 'i' } },
      { 'specifications.model': { $regex: search, $options: 'i' } }
    ];
  }

  // Stock level filters
  if (lowStock === true) {
    filter.$expr = {
      $lte: ['$quantity.current', '$quantity.minimum']
    };
  }

  if (criticalStock === true) {
    filter.$expr = {
      $lte: ['$quantity.current', { $multiply: ['$quantity.minimum', 0.5] }]
    };
  }

  // Expiring items filter
  if (expiring) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + expiring);
    
    filter['specifications.expiryDate'] = {
      $gte: new Date(),
      $lte: futureDate
    };
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
        path: 'location.department',
        select: 'name code type state district'
      },
      {
        path: 'updatedBy',
        select: 'firstName lastName username'
      },
      {
        path: 'createdBy',
        select: 'firstName lastName username'
      }
    ],
    sort: sortObj,
    lean: false
  };

  const result = await Inventory.paginate(filter, options);

  // Calculate additional statistics
  const stats = await Inventory.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalValue: { $sum: '$cost.totalValue' },
        lowStockCount: {
          $sum: {
            $cond: [
              { $lte: ['$quantity.current', '$quantity.minimum'] },
              1,
              0
            ]
          }
        },
        criticalStockCount: {
          $sum: {
            $cond: [
              { $lte: ['$quantity.current', { $multiply: ['$quantity.minimum', 0.5] }] },
              1,
              0
            ]
          }
        },
        outOfStockCount: {
          $sum: {
            $cond: [
              { $eq: ['$quantity.current', 0] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    data: result.docs,
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalItems: result.totalDocs,
      itemsPerPage: result.limit,
      hasNext: result.hasNextPage,
      hasPrev: result.hasPrevPage,
      nextPage: result.nextPage,
      prevPage: result.prevPage
    },
    stats: stats[0] || {
      totalItems: 0,
      totalValue: 0,
      lowStockCount: 0,
      criticalStockCount: 0,
      outOfStockCount: 0
    },
    filters: {
      category,
      status,
      department,
      search,
      lowStock,
      criticalStock,
      expiring
    }
  });
});

// @desc    Get single inventory item
// @route   GET /api/v1/inventory/:id
// @access  Private
const getInventoryById = asyncHandler(async (req, res, next) => {
  const inventory = await Inventory.findOne({
    _id: req.params.id,
    isDeleted: false
  })
    .populate('location.department', 'name code type state district contactInfo')
    .populate('updatedBy', 'firstName lastName username email')
    .populate('createdBy', 'firstName lastName username email');

  if (!inventory) {
    return next(new AppError(CONSTANTS.ERRORS.INVENTORY_NOT_FOUND, CONSTANTS.HTTP_STATUS.NOT_FOUND, 'INVENTORY_NOT_FOUND'));
  }

  // Access control removed

  // Get recent transactions for this item
  const recentTransactions = await Transaction.find({
    inventory: inventory._id,
    isDeleted: false
  })
    .populate('performedBy', 'firstName lastName username')
    .populate('approvedBy', 'firstName lastName username')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('type quantity status reason createdAt performedBy approvedBy');

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    data: {
      inventory,
      recentTransactions,
      alerts: {
        isLowStock: inventory.isLowStock,
        isCritical: inventory.isCritical,
        isOutOfStock: inventory.isOutOfStock,
        isExpired: inventory.isExpired,
        isExpiringSoon: inventory.isExpiringSoon,
        daysUntilExpiry: inventory.daysUntilExpiry
      }
    }
  });
});

// @desc    Create new inventory item
// @route   POST /api/v1/inventory
// @access  Private (Admin, Coordinator)
const createInventoryItem = asyncHandler(async (req, res, next) => {
  // Validate request data
  const { error } = validateInventoryItem(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR'));
  }

  // Check if item code already exists
  const existingItem = await Inventory.findOne({ 
    itemCode: req.body.itemCode.toUpperCase(),
    isDeleted: false 
  });
  
  if (existingItem) {
    return next(new AppError('Item code already exists', CONSTANTS.HTTP_STATUS.CONFLICT, 'ITEM_CODE_EXISTS'));
  }

  // Verify department exists and user has access
  const department = await Department.findById(req.body.location.department);
  if (!department) {
    return next(new AppError('Department not found', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'DEPARTMENT_NOT_FOUND'));
  }

  // Access control removed

  // Generate unique item code if not provided
  if (!req.body.itemCode) {
    const count = await Inventory.countDocuments({ isDeleted: false });
    req.body.itemCode = `INV${String(count + 1).padStart(6, '0')}`;
  } else {
    req.body.itemCode = req.body.itemCode.toUpperCase();
  }

  // Calculate total value
  if (req.body.cost && req.body.cost.unitPrice && req.body.quantity) {
    req.body.cost.totalValue = req.body.cost.unitPrice * req.body.quantity.current;
  }

  // Audit fields removed (no user tracking)

  const inventory = await Inventory.create(req.body);

  // Create initial transaction
  await Transaction.create({
    transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    type: CONSTANTS.TRANSACTION_TYPES.INBOUND,
    inventory: inventory._id,
    quantity: inventory.quantity.current,
    unit: inventory.unit,
    to: {
      department: inventory.location.department,
      warehouse: inventory.location.warehouse
    },
    reason: 'Initial stock entry',
    // performedBy removed (no user tracking)
    status: CONSTANTS.TRANSACTION_STATUS.COMPLETED
  });

  const populatedInventory = await Inventory.findById(inventory._id)
    .populate('location.department', 'name code type')
    .populate('updatedBy', 'firstName lastName username')
    .populate('createdBy', 'firstName lastName username');

  // Emit real-time update
  if (req.app.get('io')) {
    req.app.get('io').emit('inventoryCreated', {
      inventory: populatedInventory,
      department: department._id
    });
  }

  logger.info(`Inventory item created: ${inventory.itemCode}`);

  res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
    success: true,
    message: CONSTANTS.SUCCESS.INVENTORY_CREATED,
    data: populatedInventory
  });
});

// @desc    Update inventory item
// @route   PUT /api/v1/inventory/:id
// @access  Private (Admin, Coordinator)
const updateInventoryItem = asyncHandler(async (req, res, next) => {
  // Validate request data
  const { error } = validateUpdateInventory(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR'));
  }

  const inventory = await Inventory.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!inventory) {
    return next(new AppError(CONSTANTS.ERRORS.INVENTORY_NOT_FOUND, CONSTANTS.HTTP_STATUS.NOT_FOUND, 'INVENTORY_NOT_FOUND'));
  }

  // Access control removed

  // Store old quantity for transaction
  const oldQuantity = inventory.quantity.current;
  
  // Update fields
  Object.assign(inventory, req.body);
  // updatedBy field removed (no user tracking)
  inventory.lastUpdated = new Date();

  // Recalculate total value if needed
  if (inventory.cost && inventory.cost.unitPrice && inventory.quantity) {
    inventory.cost.totalValue = inventory.cost.unitPrice * inventory.quantity.current;
  }

  await inventory.save();

  // Create adjustment transaction if quantity changed
  if (req.body.quantity && req.body.quantity.current !== undefined && req.body.quantity.current !== oldQuantity) {
    const quantityDiff = req.body.quantity.current - oldQuantity;
    
    await Transaction.create({
      transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
      type: CONSTANTS.TRANSACTION_TYPES.ADJUSTMENT,
      inventory: inventory._id,
      quantity: Math.abs(quantityDiff),
      unit: inventory.unit,
      reason: req.body.adjustmentReason || 'Manual adjustment',
      notes: quantityDiff > 0 ? `Stock increased by ${quantityDiff}` : `Stock decreased by ${Math.abs(quantityDiff)}`,
      // performedBy removed (no user tracking)
      status: CONSTANTS.TRANSACTION_STATUS.COMPLETED
    });
  }

  const updatedInventory = await Inventory.findById(inventory._id)
    .populate('location.department', 'name code type')
    .populate('updatedBy', 'firstName lastName username')
    .populate('createdBy', 'firstName lastName username');

  // Emit real-time update
  if (req.app.get('io')) {
    req.app.get('io').emit('inventoryUpdated', {
      inventory: updatedInventory,
      department: updatedInventory.location.department._id
    });
  }

  logger.info(`Inventory item updated: ${inventory.itemCode}`);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    message: CONSTANTS.SUCCESS.INVENTORY_UPDATED,
    data: updatedInventory
  });
});

// @desc    Delete inventory item (soft delete by default, hard delete with ?permanent=true)
// @route   DELETE /api/v1/inventory/:id?permanent=true
// @access  Private (Admin only)
const deleteInventoryItem = asyncHandler(async (req, res, next) => {
  const { permanent } = req.query;
  const isHardDelete = permanent === 'true';

  // For hard delete, find any item (including soft-deleted ones)
  // For soft delete, find only active items
  const inventory = await Inventory.findOne({
    _id: req.params.id,
    ...(isHardDelete ? {} : { isDeleted: false })
  });

  if (!inventory) {
    return next(new AppError(CONSTANTS.ERRORS.INVENTORY_NOT_FOUND, CONSTANTS.HTTP_STATUS.NOT_FOUND, 'INVENTORY_NOT_FOUND'));
  }

  if (isHardDelete) {
    // Hard delete - permanently remove from database
    await Inventory.deleteOne({ _id: req.params.id });
    logger.info(`Inventory item permanently deleted: ${inventory.itemCode}`);
  } else {
    // Soft delete - mark as deleted
    await inventory.softDelete();
    logger.info(`Inventory item soft deleted: ${inventory.itemCode}`);
  }

  // Emit real-time update
  if (req.app.get('io')) {
    req.app.get('io').emit('inventoryDeleted', {
      id: req.params.id,
      department: inventory.location.department,
      permanent: isHardDelete
    });
  }

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    message: isHardDelete ? 'Item permanently deleted from database' : CONSTANTS.SUCCESS.INVENTORY_DELETED
  });
});

// @desc    Get low stock items
// @route   GET /api/v1/inventory/alerts/low-stock
// @access  Private
const getLowStockItems = asyncHandler(async (req, res, next) => {
  const departmentId = req.query.department;

  const lowStockItems = await Inventory.findLowStock(departmentId);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    count: lowStockItems.length,
    data: lowStockItems
  });
});

// @desc    Get critical stock items
// @route   GET /api/v1/inventory/alerts/critical-stock
// @access  Private
const getCriticalStockItems = asyncHandler(async (req, res, next) => {
  const departmentId = req.query.department;

  const criticalStockItems = await Inventory.findCriticalStock(departmentId);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    count: criticalStockItems.length,
    data: criticalStockItems
  });
});

// @desc    Get expiring items
// @route   GET /api/v1/inventory/alerts/expiring
// @access  Private
const getExpiringItems = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const departmentId = req.query.department;

  const expiringItems = await Inventory.findExpiring(days, departmentId);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    count: expiringItems.length,
    data: expiringItems,
    filters: {
      days,
      department: departmentId
    }
  });
});

// @desc    Get expired items
// @route   GET /api/v1/inventory/alerts/expired
// @access  Private
const getExpiredItems = asyncHandler(async (req, res, next) => {
  const departmentId = req.query.department;

  const expiredItems = await Inventory.findExpired(departmentId);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    count: expiredItems.length,
    data: expiredItems
  });
});

// @desc    Reserve inventory quantity
// @route   POST /api/v1/inventory/:id/reserve
// @access  Private
const reserveInventory = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Valid quantity is required', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_QUANTITY'));
  }

  const inventory = await Inventory.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!inventory) {
    return next(new AppError(CONSTANTS.ERRORS.INVENTORY_NOT_FOUND, CONSTANTS.HTTP_STATUS.NOT_FOUND, 'INVENTORY_NOT_FOUND'));
  }

  if (quantity > inventory.availableQuantity) {
    return next(new AppError(CONSTANTS.ERRORS.INSUFFICIENT_STOCK, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INSUFFICIENT_STOCK'));
  }

  await inventory.reserveQuantity(quantity);

  logger.info(`Inventory reserved: ${inventory.itemCode} - ${quantity} units`);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    message: 'Inventory reserved successfully',
    data: {
      inventory: inventory.itemCode,
      reservedQuantity: quantity,
      availableQuantity: inventory.availableQuantity - quantity,
      totalReserved: inventory.quantity.reserved + quantity
    }
  });
});

// @desc    Release reserved inventory
// @route   POST /api/v1/inventory/:id/release
// @access  Private
const releaseReservedInventory = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return next(new AppError('Valid quantity is required', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_QUANTITY'));
  }

  const inventory = await Inventory.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!inventory) {
    return next(new AppError(CONSTANTS.ERRORS.INVENTORY_NOT_FOUND, CONSTANTS.HTTP_STATUS.NOT_FOUND, 'INVENTORY_NOT_FOUND'));
  }

  if (quantity > inventory.quantity.reserved) {
    return next(new AppError('Cannot release more than reserved quantity', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_RELEASE_QUANTITY'));
  }

  await inventory.releaseReservedQuantity(quantity);

  logger.info(`Inventory reservation released: ${inventory.itemCode} - ${quantity} units`);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    message: 'Reserved inventory released successfully',
    data: {
      inventory: inventory.itemCode,
      releasedQuantity: quantity,
      availableQuantity: inventory.availableQuantity + quantity,
      totalReserved: inventory.quantity.reserved - quantity
    }
  });
});

// @desc    Get inventory dashboard statistics
// @route   GET /api/v1/inventory/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const departmentId = req.query.department;

  const filter = { isDeleted: false };
  if (departmentId) {
    filter['location.department'] = departmentId;
  }

  const [
    totalItems,
    lowStockCount,
    criticalStockCount,
    outOfStockCount,
    expiringCount,
    expiredCount,
    categoryStats,
    recentActivity
  ] = await Promise.all([
    // Total items
    Inventory.countDocuments(filter),
    
    // Low stock count
    Inventory.countDocuments({
      ...filter,
      $expr: { $lte: ['$quantity.current', '$quantity.minimum'] }
    }),
    
    // Critical stock count
    Inventory.countDocuments({
      ...filter,
      $expr: { $lte: ['$quantity.current', { $multiply: ['$quantity.minimum', 0.5] }] }
    }),
    
    // Out of stock count
    Inventory.countDocuments({
      ...filter,
      'quantity.current': 0
    }),
    
    // Expiring soon count (next 30 days)
    Inventory.countDocuments({
      ...filter,
      'specifications.expiryDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    }),
    
    // Expired count
    Inventory.countDocuments({
      ...filter,
      'specifications.expiryDate': { $lt: new Date() }
    }),
    
    // Category statistics
    Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$cost.totalValue' }
        }
      },
      { $sort: { count: -1 } }
    ]),
    
    // Recent activity
    Transaction.find({
      ...(departmentId ? {
        $or: [
          { 'from.department': departmentId },
          { 'to.department': departmentId }
        ]
      } : {}),
      isDeleted: false
    })
    .populate('inventory', 'itemName itemCode')
    .populate('performedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('type quantity status createdAt inventory performedBy')
  ]);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    data: {
      overview: {
        totalItems,
        lowStockCount,
        criticalStockCount,
        outOfStockCount,
        expiringCount,
        expiredCount
      },
      categoryStats,
      recentActivity
    }
  });
});

module.exports = {
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
};
