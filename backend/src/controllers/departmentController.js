const Department = require('../models/Department');
const User = require('../models/User');
const { validateDepartment, validateDepartmentQuery } = require('../utils/validators');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const CONSTANTS = require('../config/constants');
const { logger } = require('../config/database');

// @desc    Get all departments with filtering and pagination
// @route   GET /api/v1/departments
// @access  Private
const getAllDepartments = asyncHandler(async (req, res, next) => {
  // Validate query parameters
  const { error, value: query } = validateDepartmentQuery(req.query);
  if (error) {
    return next(new AppError(error.details[0].message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR'));
  }

  const {
    page = 1,
    limit = 20,
    sort = 'name',
    order = 'asc',
    search,
    type,
    state,
    district,
    isActive
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (type) filter.type = type;
  if (state) filter.state = state;
  if (district) filter.district = district;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  // Sort configuration
  const sortObj = {};
  sortObj[sort] = order === 'asc' ? 1 : -1;

  // Execute query with pagination
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sortObj,
    populate: [
      {
        path: 'parentDepartment',
        select: 'name code type'
      }
    ]
  };

  const result = await Department.paginate(filter, options);

  // Get additional statistics for each department
  const departmentsWithStats = await Promise.all(
    result.docs.map(async (dept) => {
      const [staffCount, inventoryCount] = await Promise.all([
        User.countDocuments({ department: dept._id, isActive: true }),
        // Assuming we have Inventory model
        require('../models/Inventory').countDocuments({ 
          'location.department': dept._id, 
          isDeleted: false 
        })
      ]);

      return {
        ...dept.toObject(),
        staffCount,
        inventoryCount
      };
    })
  );

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    data: departmentsWithStats,
    pagination: {
      currentPage: result.page,
      totalPages: result.totalPages,
      totalItems: result.totalDocs,
      itemsPerPage: result.limit,
      hasNext: result.hasNextPage,
      hasPrev: result.hasPrevPage
    },
    filters: { type, state, district, isActive, search }
  });
});

// @desc    Get single department
// @route   GET /api/v1/departments/:id
// @access  Private
const getDepartmentById = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id)
    .populate('parentDepartment', 'name code type state district')
    .populate({
      path: 'staffCount',
      model: 'User'
    })
    .populate({
      path: 'inventoryCount',
      model: 'Inventory'
    });

  if (!department) {
    return next(new AppError('Department not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND'));
  }

  // Get department statistics
  const [staffCount, inventoryCount, recentActivity] = await Promise.all([
    User.countDocuments({ department: department._id, isActive: true }),
    require('../models/Inventory').countDocuments({ 
      'location.department': department._id, 
      isDeleted: false 
    }),
    require('../models/Transaction').find({
      $or: [
        { 'from.department': department._id },
        { 'to.department': department._id }
      ],
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
      department,
      statistics: {
        staffCount,
        inventoryCount,
        isActive: department.isActive,
        establishedDate: department.establishedDate,
        lastActiveDate: department.lastActiveDate
      },
      recentActivity
    }
  });
});

// @desc    Create new department
// @route   POST /api/v1/departments
// @access  Private (Admin only)
const createDepartment = asyncHandler(async (req, res, next) => {
  // Validate request data
  const { error } = validateDepartment(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR'));
  }

  // Check if department code already exists
  const existingDepartment = await Department.findOne({ 
    code: req.body.code.toUpperCase() 
  });
  
  if (existingDepartment) {
    return next(new AppError('Department code already exists', CONSTANTS.HTTP_STATUS.CONFLICT, 'DEPARTMENT_CODE_EXISTS'));
  }

  // Verify parent department exists if provided
  if (req.body.parentDepartment) {
    const parentDept = await Department.findById(req.body.parentDepartment);
    if (!parentDept) {
      return next(new AppError('Parent department not found', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'PARENT_DEPARTMENT_NOT_FOUND'));
    }
  }

  // Ensure code is uppercase
  req.body.code = req.body.code.toUpperCase();

  const department = await Department.create(req.body);

  const populatedDepartment = await Department.findById(department._id)
    .populate('parentDepartment', 'name code type');

  logger.info(`Department created: ${department.code} (${department.name})`);

  res.status(CONSTANTS.HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Department created successfully',
    data: populatedDepartment
  });
});

// @desc    Update department
// @route   PUT /api/v1/departments/:id
// @access  Private (Admin only)
const updateDepartment = asyncHandler(async (req, res, next) => {
  // Validate request data
  const { error } = validateDepartment(req.body);
  if (error) {
    return next(new AppError(error.details[0].message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR'));
  }

  const department = await Department.findById(req.params.id);

  if (!department) {
    return next(new AppError('Department not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND'));
  }

  // Check if new code conflicts with existing departments
  if (req.body.code && req.body.code.toUpperCase() !== department.code) {
    const existingDepartment = await Department.findOne({ 
      code: req.body.code.toUpperCase(),
      _id: { $ne: department._id }
    });
    
    if (existingDepartment) {
      return next(new AppError('Department code already exists', CONSTANTS.HTTP_STATUS.CONFLICT, 'DEPARTMENT_CODE_EXISTS'));
    }
  }

  // Verify parent department exists if provided and is different
  if (req.body.parentDepartment && req.body.parentDepartment !== department.parentDepartment?.toString()) {
    const parentDept = await Department.findById(req.body.parentDepartment);
    if (!parentDept) {
      return next(new AppError('Parent department not found', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'PARENT_DEPARTMENT_NOT_FOUND'));
    }
    
    // Prevent circular dependency
    if (req.body.parentDepartment === department._id.toString()) {
      return next(new AppError('Department cannot be its own parent', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'CIRCULAR_DEPENDENCY'));
    }
  }

  // Update fields
  Object.assign(department, req.body);
  if (req.body.code) {
    department.code = req.body.code.toUpperCase();
  }

  await department.save();

  const updatedDepartment = await Department.findById(department._id)
    .populate('parentDepartment', 'name code type');

  logger.info(`Department updated: ${department.code} (${department.name})`);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    message: 'Department updated successfully',
    data: updatedDepartment
  });
});

// @desc    Delete department
// @route   DELETE /api/v1/departments/:id
// @access  Private (Admin only)
const deleteDepartment = asyncHandler(async (req, res, next) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    return next(new AppError('Department not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND'));
  }

  // Check if department has active users
  const activeUsers = await User.countDocuments({ 
    department: department._id, 
    isActive: true 
  });

  if (activeUsers > 0) {
    return next(new AppError('Cannot delete department with active users', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'DEPARTMENT_HAS_USERS'));
  }

  // Check if department has inventory
  const inventoryCount = await require('../models/Inventory').countDocuments({ 
    'location.department': department._id, 
    isDeleted: false 
  });

  if (inventoryCount > 0) {
    return next(new AppError('Cannot delete department with inventory items', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'DEPARTMENT_HAS_INVENTORY'));
  }

  // Check if other departments have this as parent
  const childDepartments = await Department.countDocuments({ 
    parentDepartment: department._id 
  });

  if (childDepartments > 0) {
    return next(new AppError('Cannot delete department that is parent to other departments', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'DEPARTMENT_HAS_CHILDREN'));
  }

  await department.deleteOne();

  logger.info(`Department deleted: ${department.code} (${department.name})`);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    message: 'Department deleted successfully'
  });
});

// @desc    Get departments by state
// @route   GET /api/v1/departments/by-state/:state
// @access  Private
const getDepartmentsByState = asyncHandler(async (req, res, next) => {
  const { state } = req.params;
  const { type, isActive = true } = req.query;

  if (!CONSTANTS.INDIAN_STATES.includes(state)) {
    return next(new AppError('Invalid state name', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_STATE'));
  }

  const filter = { state, isActive };
  if (type) filter.type = type;

  const departments = await Department.find(filter)
    .populate('parentDepartment', 'name code type')
    .sort({ name: 1 });

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    count: departments.length,
    data: departments,
    filters: { state, type, isActive }
  });
});

// @desc    Get departments by type
// @route   GET /api/v1/departments/by-type/:type
// @access  Private
const getDepartmentsByType = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const { state, isActive = true } = req.query;

  if (!Object.values(CONSTANTS.DEPARTMENT_TYPES).includes(type)) {
    return next(new AppError('Invalid department type', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_TYPE'));
  }

  const filter = { type, isActive };
  if (state) filter.state = state;

  const departments = await Department.find(filter)
    .populate('parentDepartment', 'name code type')
    .sort({ state: 1, name: 1 });

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    count: departments.length,
    data: departments,
    filters: { type, state, isActive }
  });
});

// @desc    Activate/Deactivate department
// @route   PATCH /api/v1/departments/:id/status
// @access  Private (Admin only)
const updateDepartmentStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive must be a boolean value', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_STATUS'));
  }

  const department = await Department.findById(req.params.id);

  if (!department) {
    return next(new AppError('Department not found', CONSTANTS.HTTP_STATUS.NOT_FOUND, 'DEPARTMENT_NOT_FOUND'));
  }

  // If deactivating, check if there are active users
  if (!isActive) {
    const activeUsers = await User.countDocuments({ 
      department: department._id, 
      isActive: true 
    });

    if (activeUsers > 0) {
      return next(new AppError('Cannot deactivate department with active users', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'DEPARTMENT_HAS_ACTIVE_USERS'));
    }
  }

  department.isActive = isActive;
  await department.save();

  const action = isActive ? 'activated' : 'deactivated';
  logger.info(`Department ${action}: ${department.code} (${department.name})`);

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    message: `Department ${action} successfully`,
    data: {
      id: department._id,
      name: department.name,
      code: department.code,
      isActive: department.isActive
    }
  });
});

// @desc    Get department statistics
// @route   GET /api/v1/departments/stats
// @access  Private (Admin only)
const getDepartmentStats = asyncHandler(async (req, res, next) => {
  const stats = await Department.aggregate([
    {
      $group: {
        _id: null,
        totalDepartments: { $sum: 1 },
        activeDepartments: {
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        departmentsByType: {
          $push: {
            type: '$type',
            isActive: '$isActive'
          }
        },
        departmentsByState: {
          $push: {
            state: '$state',
            isActive: '$isActive'
          }
        }
      }
    }
  ]);

  // Process department types
  const typeStats = {};
  const stateStats = {};

  if (stats.length > 0) {
    stats[0].departmentsByType.forEach(dept => {
      if (!typeStats[dept.type]) {
        typeStats[dept.type] = { total: 0, active: 0 };
      }
      typeStats[dept.type].total++;
      if (dept.isActive) typeStats[dept.type].active++;
    });

    stats[0].departmentsByState.forEach(dept => {
      if (!stateStats[dept.state]) {
        stateStats[dept.state] = { total: 0, active: 0 };
      }
      stateStats[dept.state].total++;
      if (dept.isActive) stateStats[dept.state].active++;
    });
  }

  res.status(CONSTANTS.HTTP_STATUS.OK).json({
    success: true,
    data: {
      overview: {
        totalDepartments: stats[0]?.totalDepartments || 0,
        activeDepartments: stats[0]?.activeDepartments || 0,
        inactiveDepartments: (stats[0]?.totalDepartments || 0) - (stats[0]?.activeDepartments || 0)
      },
      byType: typeStats,
      byState: stateStats
    }
  });
});

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByState,
  getDepartmentsByType,
  updateDepartmentStatus,
  getDepartmentStats
};
