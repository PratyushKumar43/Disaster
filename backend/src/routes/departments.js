const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByState,
  getDepartmentsByType,
  updateDepartmentStatus,
  getDepartmentStats
} = require('../controllers/departmentController');
// Authentication middleware removed
const CONSTANTS = require('../config/constants');

// Apply protection to all routes (disabled for now - implement authentication later)
// router.use(protect);

// Statistics route (Admin only) - auth disabled for now
router.get('/stats', 
  // authorize(CONSTANTS.USER_ROLES.ADMIN), 
  getDepartmentStats
);

// Filter routes
router.get('/by-state/:state', getDepartmentsByState);
router.get('/by-type/:type', getDepartmentsByType);

// Main department routes (auth disabled for now)
router.route('/')
  .get(getAllDepartments)
  .post(
    // requirePermission('departments', 'create'),
    // authorize(CONSTANTS.USER_ROLES.ADMIN),
    createDepartment
  );

// Individual department routes (auth disabled for now)
router.route('/:id')
  .get(getDepartmentById)
  .put(
    // requirePermission('departments', 'update'),
    // authorize(CONSTANTS.USER_ROLES.ADMIN),
    updateDepartment
  )
  .delete(
    // requirePermission('departments', 'delete'),
    // authorize(CONSTANTS.USER_ROLES.ADMIN),
    deleteDepartment
  );

// Department status management (auth disabled for now)
router.patch('/:id/status',
  // authorize(CONSTANTS.USER_ROLES.ADMIN),
  updateDepartmentStatus
);

module.exports = router;
