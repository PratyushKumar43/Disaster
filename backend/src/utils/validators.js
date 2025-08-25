const Joi = require('joi');
const CONSTANTS = require('../config/constants');

// Custom validation for Indian phone numbers
const indianPhoneNumber = Joi.string().pattern(/^[\+]?[1-9][\d]{0,15}$/).message('Please enter a valid phone number');

// Custom validation for Indian states
const indianState = Joi.string().valid(...CONSTANTS.INDIAN_STATES);

// User validation schemas
const validateRegister = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
      }),
    
    firstName: Joi.string()
      .pattern(/^[a-zA-Z\s]+$/)
      .max(50)
      .required()
      .messages({
        'string.pattern.base': 'First name can only contain letters and spaces',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .pattern(/^[a-zA-Z\s]+$/)
      .max(50)
      .required()
      .messages({
        'string.pattern.base': 'Last name can only contain letters and spaces',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    phoneNumber: indianPhoneNumber.required(),
    
    role: Joi.string()
      .valid(...Object.values(CONSTANTS.USER_ROLES))
      .default(CONSTANTS.USER_ROLES.FIELD_WORKER),
    
    department: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid department ID format',
        'any.required': 'Department is required'
      }),
    
    state: indianState.required(),
    
    district: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'District name cannot exceed 50 characters',
        'any.required': 'District is required'
      }),
    
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phone: indianPhoneNumber.optional()
    }).optional()
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data);
};

const validateUpdateProfile = (data) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .pattern(/^[a-zA-Z\s]+$/)
      .max(50)
      .optional()
      .messages({
        'string.pattern.base': 'First name can only contain letters and spaces',
        'string.max': 'First name cannot exceed 50 characters'
      }),
    
    lastName: Joi.string()
      .pattern(/^[a-zA-Z\s]+$/)
      .max(50)
      .optional()
      .messages({
        'string.pattern.base': 'Last name can only contain letters and spaces',
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    
    phoneNumber: indianPhoneNumber.optional(),
    
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      relationship: Joi.string().max(50).optional(),
      phone: indianPhoneNumber.optional()
    }).optional(),
    
    preferences: Joi.object({
      theme: Joi.string().valid('light', 'dark', 'system').optional(),
      language: Joi.string().valid('en', 'hi').optional(),
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        push: Joi.boolean().optional()
      }).optional()
    }).optional()
  });

  return schema.validate(data);
};

// Inventory validation schemas
const validateInventoryItem = (data) => {
  const schema = Joi.object({
    itemName: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Item name cannot exceed 100 characters',
        'any.required': 'Item name is required'
      }),
    
    itemCode: Joi.string()
      .pattern(/^[A-Z0-9]{3,20}$/)
      .required()
      .messages({
        'string.pattern.base': 'Item code must be 3-20 alphanumeric characters in uppercase',
        'any.required': 'Item code is required'
      }),
    
    category: Joi.string()
      .valid(...Object.values(CONSTANTS.INVENTORY_CATEGORIES))
      .required()
      .messages({
        'any.only': 'Invalid inventory category',
        'any.required': 'Category is required'
      }),
    
    subcategory: Joi.string()
      .max(50)
      .optional(),
    
    description: Joi.string()
      .max(1000)
      .optional(),
    
    specifications: Joi.object({
      brand: Joi.string().max(50).optional(),
      model: Joi.string().max(50).optional(),
      size: Joi.string().max(30).optional(),
      weight: Joi.string().max(30).optional(),
      color: Joi.string().max(30).optional(),
      material: Joi.string().max(50).optional(),
      expiryDate: Joi.date().greater('now').optional(),
      batchNumber: Joi.string().max(30).optional(),
      serialNumber: Joi.string().max(50).optional(),
      manufacturingDate: Joi.date().optional(),
      warrantyExpiry: Joi.date().optional()
    }).optional(),
    
    quantity: Joi.object({
      current: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.min': 'Current quantity cannot be negative',
          'any.required': 'Current quantity is required'
        }),
      
      reserved: Joi.number()
        .min(0)
        .default(0),
      
      minimum: Joi.number()
        .min(0)
        .required()
        .messages({
          'number.min': 'Minimum quantity cannot be negative',
          'any.required': 'Minimum quantity is required'
        }),
      
      maximum: Joi.number()
        .min(1)
        .required()
        .messages({
          'number.min': 'Maximum quantity must be at least 1',
          'any.required': 'Maximum quantity is required'
        })
    }).custom((value, helpers) => {
      if (value.maximum < value.minimum) {
        return helpers.error('any.invalid', { message: 'Maximum quantity must be greater than or equal to minimum quantity' });
      }
      return value;
    }),
    
    unit: Joi.string()
      .valid(...Object.values(CONSTANTS.INVENTORY_UNITS))
      .required()
      .messages({
        'any.only': 'Invalid unit type',
        'any.required': 'Unit is required'
      }),
    
    cost: Joi.object({
      unitPrice: Joi.number().min(0).optional(),
      currency: Joi.string().valid('INR', 'USD', 'EUR').default('INR')
    }).optional(),
    
    location: Joi.object({
      department: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
          'string.pattern.base': 'Invalid department ID format',
          'any.required': 'Department is required'
        }),
      
      warehouse: Joi.string()
        .max(100)
        .required()
        .messages({
          'string.max': 'Warehouse name cannot exceed 100 characters',
          'any.required': 'Warehouse is required'
        }),
      
      section: Joi.string().max(50).optional(),
      rack: Joi.string().max(20).optional(),
      shelf: Joi.string().max(20).optional(),
      
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional()
      }).optional()
    }).required(),
    
    supplier: Joi.object({
      name: Joi.string().max(100).optional(),
      contact: indianPhoneNumber.optional(),
      email: Joi.string().email().optional(),
      address: Joi.string().max(300).optional(),
      gstin: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional()
    }).optional(),
    
    status: Joi.string()
      .valid(...Object.values(CONSTANTS.INVENTORY_STATUS))
      .default(CONSTANTS.INVENTORY_STATUS.AVAILABLE),
    
    tags: Joi.array().items(Joi.string().max(30)).optional(),
    notes: Joi.string().max(500).optional()
  });

  return schema.validate(data);
};

const validateUpdateInventory = (data) => {
  const schema = Joi.object({
    itemName: Joi.string().max(100).optional(),
    category: Joi.string().valid(...Object.values(CONSTANTS.INVENTORY_CATEGORIES)).optional(),
    subcategory: Joi.string().max(50).optional(),
    description: Joi.string().max(1000).optional(),
    
    specifications: Joi.object({
      brand: Joi.string().max(50).optional(),
      model: Joi.string().max(50).optional(),
      size: Joi.string().max(30).optional(),
      weight: Joi.string().max(30).optional(),
      color: Joi.string().max(30).optional(),
      material: Joi.string().max(50).optional(),
      expiryDate: Joi.date().greater('now').optional(),
      batchNumber: Joi.string().max(30).optional(),
      serialNumber: Joi.string().max(50).optional(),
      manufacturingDate: Joi.date().optional(),
      warrantyExpiry: Joi.date().optional()
    }).optional(),
    
    quantity: Joi.object({
      current: Joi.number().min(0).optional(),
      reserved: Joi.number().min(0).optional(),
      minimum: Joi.number().min(0).optional(),
      maximum: Joi.number().min(1).optional()
    }).custom((value, helpers) => {
      if (value.maximum && value.minimum && value.maximum < value.minimum) {
        return helpers.error('any.invalid', { message: 'Maximum quantity must be greater than or equal to minimum quantity' });
      }
      return value;
    }).optional(),
    
    cost: Joi.object({
      unitPrice: Joi.number().min(0).optional(),
      currency: Joi.string().valid('INR', 'USD', 'EUR').optional()
    }).optional(),
    
    location: Joi.object({
      warehouse: Joi.string().max(100).optional(),
      section: Joi.string().max(50).optional(),
      rack: Joi.string().max(20).optional(),
      shelf: Joi.string().max(20).optional(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional()
      }).optional()
    }).optional(),
    
    supplier: Joi.object({
      name: Joi.string().max(100).optional(),
      contact: indianPhoneNumber.optional(),
      email: Joi.string().email().optional(),
      address: Joi.string().max(300).optional(),
      gstin: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional()
    }).optional(),
    
    status: Joi.string().valid(...Object.values(CONSTANTS.INVENTORY_STATUS)).optional(),
    tags: Joi.array().items(Joi.string().max(30)).optional(),
    notes: Joi.string().max(500).optional(),
    adjustmentReason: Joi.string().max(200).optional()
  });

  return schema.validate(data);
};

// Transaction validation schemas
const validateTransaction = (data) => {
  const schema = Joi.object({
    type: Joi.string()
      .valid(...Object.values(CONSTANTS.TRANSACTION_TYPES))
      .required()
      .messages({
        'any.only': 'Invalid transaction type',
        'any.required': 'Transaction type is required'
      }),
    
    inventory: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid inventory ID format',
        'any.required': 'Inventory item is required'
      }),
    
    quantity: Joi.number()
      .min(1)
      .required()
      .messages({
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required'
      }),
    
    unit: Joi.string()
      .valid(...Object.values(CONSTANTS.INVENTORY_UNITS))
      .required(),
    
    from: Joi.object({
      department: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
      warehouse: Joi.string().max(100).optional(),
      location: Joi.string().max(200).optional()
    }).optional(),
    
    to: Joi.object({
      department: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
      warehouse: Joi.string().max(100).optional(),
      location: Joi.string().max(200).optional(),
      recipient: Joi.object({
        name: Joi.string().max(100).optional(),
        contact: indianPhoneNumber.optional(),
        designation: Joi.string().max(50).optional()
      }).optional()
    }).optional(),
    
    reason: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'Reason cannot exceed 500 characters',
        'any.required': 'Reason is required'
      }),
    
    reference: Joi.string().max(100).optional(),
    emergencyLevel: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
    notes: Joi.string().max(1000).optional(),
    scheduledDate: Joi.date().greater('now').optional(),
    batchNumber: Joi.string().max(50).optional(),
    serialNumbers: Joi.array().items(Joi.string().max(50)).optional(),
    
    geolocation: Joi.object({
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional()
      }).optional(),
      address: Joi.string().max(300).optional()
    }).optional()
  });

  return schema.validate(data);
};

// Department validation schemas
const validateDepartment = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Department name cannot exceed 100 characters',
        'any.required': 'Department name is required'
      }),
    
    code: Joi.string()
      .pattern(/^[A-Z0-9]{3,10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Department code must be 3-10 alphanumeric characters in uppercase',
        'any.required': 'Department code is required'
      }),
    
    type: Joi.string()
      .valid(...Object.values(CONSTANTS.DEPARTMENT_TYPES))
      .required()
      .messages({
        'any.only': 'Invalid department type',
        'any.required': 'Department type is required'
      }),
    
    description: Joi.string().max(500).optional(),
    
    contactInfo: Joi.object({
      email: Joi.string().email().optional(),
      phone: indianPhoneNumber.optional(),
      address: Joi.string().max(300).optional()
    }).optional(),
    
    state: indianState.required(),
    
    district: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'District name cannot exceed 50 characters',
        'any.required': 'District is required'
      }),
    
    headquarters: Joi.object({
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
      address: Joi.string().max(300).optional()
    }).optional(),
    
    parentDepartment: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
  });

  return schema.validate(data);
};

// Query validation schemas
const validatePaginationQuery = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).optional()
  });

  return schema.validate(data, { convert: true });
};

const validateInventoryQuery = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).optional(),
    category: Joi.string().valid(...Object.values(CONSTANTS.INVENTORY_CATEGORIES)).optional(),
    status: Joi.string().valid(...Object.values(CONSTANTS.INVENTORY_STATUS)).optional(),
    department: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    lowStock: Joi.boolean().optional(),
    criticalStock: Joi.boolean().optional(),
    expiring: Joi.number().min(1).max(365).optional() // Days until expiry
  });

  return schema.validate(data, { convert: true });
};

const validateDepartmentQuery = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).optional(),
    type: Joi.string().valid(...Object.values(CONSTANTS.DEPARTMENT_TYPES)).optional(),
    state: Joi.string().optional(),
    district: Joi.string().optional(),
    isActive: Joi.boolean().optional()
  });

  return schema.validate(data, { convert: true });
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateInventoryItem,
  validateUpdateInventory,
  validateTransaction,
  validateDepartment,
  validatePaginationQuery,
  validateInventoryQuery,
  validateDepartmentQuery
};
