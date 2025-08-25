// Application constants
const CONSTANTS = {
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    COORDINATOR: 'coordinator',
    FIELD_WORKER: 'field_worker',
    VOLUNTEER: 'volunteer'
  },

  // Department types
  DEPARTMENT_TYPES: {
    FIRE: 'fire',
    FLOOD: 'flood',
    MEDICAL: 'medical',
    RESCUE: 'rescue',
    POLICE: 'police',
    MILITARY: 'military',
    NGO: 'ngo',
    OTHER: 'other'
  },

  // Inventory categories
  INVENTORY_CATEGORIES: {
    MEDICAL: 'medical',
    RESCUE_EQUIPMENT: 'rescue_equipment',
    FOOD_SUPPLIES: 'food_supplies',
    WATER_SUPPLIES: 'water_supplies',
    SHELTER_MATERIALS: 'shelter_materials',
    COMMUNICATION: 'communication',
    TRANSPORTATION: 'transportation',
    TOOLS: 'tools',
    CLOTHING: 'clothing',
    OTHER: 'other'
  },

  // Inventory units
  INVENTORY_UNITS: {
    PIECES: 'pieces',
    KG: 'kg',
    LITERS: 'liters',
    BOXES: 'boxes',
    PACKETS: 'packets',
    METERS: 'meters',
    SETS: 'sets'
  },

  // Inventory status
  INVENTORY_STATUS: {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    DAMAGED: 'damaged',
    EXPIRED: 'expired',
    UNDER_MAINTENANCE: 'under_maintenance'
  },

  // Transaction types
  TRANSACTION_TYPES: {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
    TRANSFER: 'transfer',
    ADJUSTMENT: 'adjustment',
    DAMAGED: 'damaged',
    EXPIRED: 'expired'
  },

  // Transaction status
  TRANSACTION_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // HTTP status codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  },

  // Indian states (for validation)
  INDIAN_STATES: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
    'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
    'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 
    'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
    'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Lakshadweep', 'Puducherry'
  ],

  // Error messages
  ERRORS: {
    VALIDATION_ERROR: 'Validation error',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    DUPLICATE_ENTRY: 'Duplicate entry',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_EXPIRED: 'Token expired',
    INVALID_TOKEN: 'Invalid token',
    USER_NOT_FOUND: 'User not found',
    INVENTORY_NOT_FOUND: 'Inventory item not found',
    INSUFFICIENT_STOCK: 'Insufficient stock',
    ACCOUNT_DEACTIVATED: 'Account is deactivated'
  },

  // Success messages
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    INVENTORY_CREATED: 'Inventory item created successfully',
    INVENTORY_UPDATED: 'Inventory item updated successfully',
    INVENTORY_DELETED: 'Inventory item deleted successfully',
    TRANSACTION_CREATED: 'Transaction created successfully',
    PASSWORD_UPDATED: 'Password updated successfully'
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },

  // File upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    UPLOAD_PATH: 'uploads/'
  }
};

module.exports = CONSTANTS;


