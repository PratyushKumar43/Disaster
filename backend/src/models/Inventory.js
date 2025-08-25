const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const CONSTANTS = require('../config/constants');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters'],
    index: 'text'
  },
  itemCode: {
    type: String,
    required: [true, 'Item code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]{3,20}$/, 'Item code must be 3-20 alphanumeric characters'],
    index: 'text'
  },
  category: {
    type: String,
    enum: {
      values: Object.values(CONSTANTS.INVENTORY_CATEGORIES),
      message: 'Invalid inventory category'
    },
    required: [true, 'Category is required'],
    index: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'Subcategory cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  specifications: {
    brand: {
      type: String,
      trim: true,
      maxlength: [50, 'Brand name cannot exceed 50 characters']
    },
    model: {
      type: String,
      trim: true,
      maxlength: [50, 'Model cannot exceed 50 characters']
    },
    size: {
      type: String,
      trim: true,
      maxlength: [30, 'Size cannot exceed 30 characters']
    },
    weight: {
      type: String,
      trim: true,
      maxlength: [30, 'Weight cannot exceed 30 characters']
    },
    color: {
      type: String,
      trim: true,
      maxlength: [30, 'Color cannot exceed 30 characters']
    },
    material: {
      type: String,
      trim: true,
      maxlength: [50, 'Material cannot exceed 50 characters']
    },
    expiryDate: {
      type: Date,
      validate: {
        validator: function(date) {
          return !date || date > new Date();
        },
        message: 'Expiry date must be in the future'
      }
    },
    batchNumber: {
      type: String,
      trim: true,
      maxlength: [30, 'Batch number cannot exceed 30 characters']
    },
    serialNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Serial number cannot exceed 50 characters']
    },
    manufacturingDate: Date,
    warrantyExpiry: Date
  },
  quantity: {
    current: {
      type: Number,
      required: [true, 'Current quantity is required'],
      min: [0, 'Current quantity cannot be negative'],
      index: true
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative']
    },
    minimum: {
      type: Number,
      required: [true, 'Minimum quantity is required'],
      min: [0, 'Minimum quantity cannot be negative']
    },
    maximum: {
      type: Number,
      required: [true, 'Maximum quantity is required'],
      min: [1, 'Maximum quantity must be at least 1'],
      validate: {
        validator: function(max) {
          return max >= this.quantity.minimum;
        },
        message: 'Maximum quantity must be greater than or equal to minimum quantity'
      }
    }
  },
  unit: {
    type: String,
    enum: {
      values: Object.values(CONSTANTS.INVENTORY_UNITS),
      message: 'Invalid unit type'
    },
    required: [true, 'Unit is required']
  },
  cost: {
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative']
    },
    totalValue: {
      type: Number,
      min: [0, 'Total value cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
      uppercase: true
    },
    lastUpdatedPrice: Date
  },
  location: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true
    },
    warehouse: {
      type: String,
      required: [true, 'Warehouse is required'],
      trim: true,
      maxlength: [100, 'Warehouse name cannot exceed 100 characters']
    },
    section: {
      type: String,
      trim: true,
      maxlength: [50, 'Section cannot exceed 50 characters']
    },
    rack: {
      type: String,
      trim: true,
      maxlength: [20, 'Rack cannot exceed 20 characters']
    },
    shelf: {
      type: String,
      trim: true,
      maxlength: [20, 'Shelf cannot exceed 20 characters']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  supplier: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Supplier name cannot exceed 100 characters']
    },
    contact: {
      type: String,
      trim: true,
      maxlength: [20, 'Contact cannot exceed 20 characters'],
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid contact number']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format']
    }
  },
  status: {
    type: String,
    enum: {
      values: Object.values(CONSTANTS.INVENTORY_STATUS),
      message: 'Invalid inventory status'
    },
    default: CONSTANTS.INVENTORY_STATUS.AVAILABLE,
    index: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(url) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(url);
      },
      message: 'Invalid image URL format'
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  qrCode: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastStockUpdate: {
    type: Date,
    default: Date.now
  },
  lastMaintenanceDate: Date,
  nextMaintenanceDate: Date,
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Plugin for pagination
inventorySchema.plugin(mongoosePaginate);

// Compound indexes for better query performance
inventorySchema.index({ category: 1, status: 1 });
inventorySchema.index({ 'location.department': 1, status: 1 });
inventorySchema.index({ 'quantity.current': 1, 'quantity.minimum': 1 });
inventorySchema.index({ itemName: 'text', itemCode: 'text', description: 'text' });
inventorySchema.index({ isDeleted: 1, status: 1 });
inventorySchema.index({ 'specifications.expiryDate': 1 });

// Virtual for available quantity (current - reserved)
inventorySchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.quantity.current - this.quantity.reserved);
});

// Virtual for stock percentage
inventorySchema.virtual('stockPercentage').get(function() {
  if (this.quantity.maximum === 0) return 0;
  return Math.round((this.quantity.current / this.quantity.maximum) * 100);
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  const current = this.quantity.current;
  const minimum = this.quantity.minimum;
  
  if (current === 0) return 'out_of_stock';
  if (current <= minimum * 0.5) return 'critical';
  if (current <= minimum) return 'low_stock';
  return 'adequate';
});

// Virtual for location path
inventorySchema.virtual('locationPath').get(function() {
  let path = this.location.warehouse;
  if (this.location.section) path += ` → ${this.location.section}`;
  if (this.location.rack) path += ` → ${this.location.rack}`;
  if (this.location.shelf) path += ` → ${this.location.shelf}`;
  return path;
});

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function() {
  if (!this.specifications.expiryDate) return null;
  const today = new Date();
  const expiry = new Date(this.specifications.expiryDate);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for expired status
inventorySchema.virtual('isExpired').get(function() {
  if (!this.specifications.expiryDate) return false;
  return new Date() > new Date(this.specifications.expiryDate);
});

// Virtual for expiring soon (within 30 days)
inventorySchema.virtual('isExpiringSoon').get(function() {
  const daysUntilExpiry = this.daysUntilExpiry;
  return daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
});

// Check if item is low stock
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity.current <= this.quantity.minimum;
});

// Check if item is out of stock
inventorySchema.virtual('isOutOfStock').get(function() {
  return this.quantity.current === 0;
});

// Check if item is critical (very low stock)
inventorySchema.virtual('isCritical').get(function() {
  return this.quantity.current <= this.quantity.minimum * 0.5;
});

// Pre-save middleware to calculate total value
inventorySchema.pre('save', function(next) {
  if (this.cost.unitPrice && this.quantity.current) {
    this.cost.totalValue = this.cost.unitPrice * this.quantity.current;
    this.cost.lastUpdatedPrice = new Date();
  }
  
  // Update lastUpdated timestamp
  this.lastUpdated = new Date();
  
  // Set lastStockUpdate if quantity changed
  if (this.isModified('quantity.current')) {
    this.lastStockUpdate = new Date();
  }
  
  next();
});

// Pre-save middleware to generate QR code if not exists
inventorySchema.pre('save', function(next) {
  if (this.isNew && !this.qrCode) {
    this.qrCode = `QR_${this.itemCode}_${Date.now()}`;
  }
  next();
});

// Static method to find low stock items
inventorySchema.statics.findLowStock = function(departmentId = null) {
  const query = {
    isDeleted: false,
    status: CONSTANTS.INVENTORY_STATUS.AVAILABLE,
    $expr: {
      $lte: ['$quantity.current', '$quantity.minimum']
    }
  };
  
  if (departmentId) {
    query['location.department'] = departmentId;
  }
  
  return this.find(query).populate('location.department updatedBy');
};

// Static method to find critical stock items
inventorySchema.statics.findCriticalStock = function(departmentId = null) {
  const query = {
    isDeleted: false,
    status: CONSTANTS.INVENTORY_STATUS.AVAILABLE,
    $expr: {
      $lte: ['$quantity.current', { $multiply: ['$quantity.minimum', 0.5] }]
    }
  };
  
  if (departmentId) {
    query['location.department'] = departmentId;
  }
  
  return this.find(query).populate('location.department updatedBy');
};

// Static method to find expiring items
inventorySchema.statics.findExpiring = function(days = 30, departmentId = null) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const query = {
    isDeleted: false,
    'specifications.expiryDate': {
      $gte: new Date(),
      $lte: futureDate
    }
  };
  
  if (departmentId) {
    query['location.department'] = departmentId;
  }
  
  return this.find(query).populate('location.department updatedBy');
};

// Static method to find expired items
inventorySchema.statics.findExpired = function(departmentId = null) {
  const query = {
    isDeleted: false,
    'specifications.expiryDate': {
      $lt: new Date()
    }
  };
  
  if (departmentId) {
    query['location.department'] = departmentId;
  }
  
  return this.find(query).populate('location.department updatedBy');
};

// Instance method to reserve quantity
inventorySchema.methods.reserveQuantity = function(quantity) {
  if (quantity > this.availableQuantity) {
    throw new Error('Insufficient available quantity');
  }
  
  this.quantity.reserved += quantity;
  return this.save();
};

// Instance method to release reserved quantity
inventorySchema.methods.releaseReservedQuantity = function(quantity) {
  if (quantity > this.quantity.reserved) {
    throw new Error('Cannot release more than reserved quantity');
  }
  
  this.quantity.reserved -= quantity;
  return this.save();
};

// Instance method to update stock
inventorySchema.methods.updateStock = function(newQuantity, updatedBy = null) {
  this.quantity.current = newQuantity;
  if (updatedBy) {
    this.updatedBy = updatedBy;
  }
  this.lastStockUpdate = new Date();
  
  // Auto-update status based on new quantity
  if (newQuantity === 0) {
    this.status = CONSTANTS.INVENTORY_STATUS.AVAILABLE; // Keep as available but quantity is 0
  }
  
  return this.save();
};

// Instance method to soft delete
inventorySchema.methods.softDelete = function(deletedBy = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  if (deletedBy) {
    this.deletedBy = deletedBy;
  }
  return this.save();
};

// Instance method to restore from soft delete
inventorySchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

module.exports = mongoose.model('Inventory', inventorySchema);
