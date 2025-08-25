const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const CONSTANTS = require('../config/constants');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    uppercase: true,
    match: [/^TXN[0-9]{10,}$/, 'Invalid transaction ID format']
  },
  type: {
    type: String,
    enum: {
      values: Object.values(CONSTANTS.TRANSACTION_TYPES),
      message: 'Invalid transaction type'
    },
    required: [true, 'Transaction type is required'],
    index: true
  },
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: [true, 'Inventory item is required'],
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    enum: {
      values: Object.values(CONSTANTS.INVENTORY_UNITS),
      message: 'Invalid unit type'
    },
    required: [true, 'Unit is required']
  },
  from: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    warehouse: {
      type: String,
      trim: true,
      maxlength: [100, 'Warehouse name cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    }
  },
  to: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    warehouse: {
      type: String,
      trim: true,
      maxlength: [100, 'Warehouse name cannot exceed 100 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    },
    recipient: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Recipient name cannot exceed 100 characters']
      },
      contact: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid contact number']
      },
      designation: {
        type: String,
        trim: true,
        maxlength: [50, 'Designation cannot exceed 50 characters']
      }
    }
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  reference: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference cannot exceed 100 characters']
  },
  emergencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  cost: {
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative']
    },
    totalCost: {
      type: Number,
      min: [0, 'Total cost cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
      uppercase: true
    }
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Auth removed: performedBy no longer required
    index: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: {
      values: Object.values(CONSTANTS.TRANSACTION_STATUS),
      message: 'Invalid transaction status'
    },
    default: CONSTANTS.TRANSACTION_STATUS.PENDING,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  timeline: [{
    status: {
      type: String,
      enum: Object.values(CONSTANTS.TRANSACTION_STATUS),
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    location: {
      type: String,
      trim: true
    }
  }],
  scheduledDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Batch number cannot exceed 50 characters']
  },
  serialNumbers: [{
    type: String,
    trim: true
  }],
  qualityCheck: {
    performed: {
      type: Boolean,
      default: false
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: Date,
    passed: {
      type: Boolean
    },
    issues: [{
      type: String,
      trim: true
    }],
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Quality check notes cannot exceed 500 characters']
    }
  },
  geolocation: {
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
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    }
  },
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

// Indexes for better query performance (unique fields already indexed in schema)
transactionSchema.index({ inventory: 1, type: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ performedBy: 1, createdAt: -1 });
transactionSchema.index({ 'from.department': 1 });
transactionSchema.index({ 'to.department': 1 });
transactionSchema.index({ emergencyLevel: 1, priority: 1 });
transactionSchema.index({ isDeleted: 1, status: 1 });
transactionSchema.index({ scheduledDate: 1 });
transactionSchema.index({ completedDate: 1 });

// Virtual for transaction duration
transactionSchema.virtual('duration').get(function() {
  if (!this.completedDate) return null;
  const start = this.createdAt;
  const end = this.completedDate;
  return Math.round((end - start) / (1000 * 60 * 60)); // Duration in hours
});

// Virtual for transaction age
transactionSchema.virtual('age').get(function() {
  const now = new Date();
  const created = this.createdAt;
  return Math.round((now - created) / (1000 * 60 * 60 * 24)); // Age in days
});

// Virtual for is overdue
transactionSchema.virtual('isOverdue').get(function() {
  if (!this.scheduledDate || this.status === CONSTANTS.TRANSACTION_STATUS.COMPLETED) {
    return false;
  }
  return new Date() > this.scheduledDate;
});

// Virtual for days until due
transactionSchema.virtual('daysUntilDue').get(function() {
  if (!this.scheduledDate) return null;
  const now = new Date();
  const due = this.scheduledDate;
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
});

// Virtual for is urgent
transactionSchema.virtual('isUrgent').get(function() {
  return this.priority === 'urgent' || this.emergencyLevel === 'critical';
});

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Pre-save middleware to calculate total cost
transactionSchema.pre('save', function(next) {
  if (this.cost.unitPrice && this.quantity) {
    this.cost.totalCost = this.cost.unitPrice * this.quantity;
  }
  next();
});

// Pre-save middleware to add timeline entry on status change
transactionSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    const timelineEntry = {
      status: this.status,
      user: this.performedBy,
      timestamp: new Date()
    };
    
    // Add completion date if status is completed
    if (this.status === CONSTANTS.TRANSACTION_STATUS.COMPLETED) {
      this.completedDate = new Date();
    }
    
    this.timeline.push(timelineEntry);
  }
  next();
});

// Static method to generate unique transaction ID
transactionSchema.statics.generateTransactionId = async function() {
  let transactionId;
  let exists = true;
  
  while (exists) {
    transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    exists = await this.findOne({ transactionId });
  }
  
  return transactionId;
};

// Static method to find transactions by department
transactionSchema.statics.findByDepartment = function(departmentId, type = null) {
  const query = {
    isDeleted: false,
    $or: [
      { 'from.department': departmentId },
      { 'to.department': departmentId }
    ]
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.find(query)
    .populate('inventory performedBy approvedBy receivedBy')
    .populate('from.department to.department')
    .sort({ createdAt: -1 });
};

// Static method to find pending transactions
transactionSchema.statics.findPending = function(departmentId = null) {
  const query = {
    isDeleted: false,
    status: CONSTANTS.TRANSACTION_STATUS.PENDING
  };
  
  if (departmentId) {
    query.$or = [
      { 'from.department': departmentId },
      { 'to.department': departmentId }
    ];
  }
  
  return this.find(query)
    .populate('inventory performedBy')
    .populate('from.department to.department')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method to find overdue transactions
transactionSchema.statics.findOverdue = function(departmentId = null) {
  const query = {
    isDeleted: false,
    status: { $ne: CONSTANTS.TRANSACTION_STATUS.COMPLETED },
    scheduledDate: { $lt: new Date() }
  };
  
  if (departmentId) {
    query.$or = [
      { 'from.department': departmentId },
      { 'to.department': departmentId }
    ];
  }
  
  return this.find(query)
    .populate('inventory performedBy')
    .populate('from.department to.department')
    .sort({ scheduledDate: 1 });
};

// Instance method to approve transaction
transactionSchema.methods.approve = function(approvedBy = null, comment = null) {
  this.status = CONSTANTS.TRANSACTION_STATUS.APPROVED;
  if (approvedBy) {
    this.approvedBy = approvedBy;
  }
  
  const timelineEntry = {
    status: CONSTANTS.TRANSACTION_STATUS.APPROVED,
    timestamp: new Date()
  };
  
  if (approvedBy) {
    timelineEntry.user = approvedBy;
  }
  
  if (comment) {
    timelineEntry.comment = comment;
  }
  
  this.timeline.push(timelineEntry);
  return this.save();
};

// Instance method to complete transaction
transactionSchema.methods.complete = function(completedBy = null, comment = null) {
  this.status = CONSTANTS.TRANSACTION_STATUS.COMPLETED;
  this.completedDate = new Date();
  if (completedBy) {
    this.receivedBy = completedBy;
  }
  
  const timelineEntry = {
    status: CONSTANTS.TRANSACTION_STATUS.COMPLETED,
    timestamp: new Date()
  };
  
  if (completedBy) {
    timelineEntry.user = completedBy;
  }
  
  if (comment) {
    timelineEntry.comment = comment;
  }
  
  this.timeline.push(timelineEntry);
  return this.save();
};

// Instance method to cancel transaction
transactionSchema.methods.cancel = function(cancelledBy = null, reason) {
  this.status = CONSTANTS.TRANSACTION_STATUS.CANCELLED;
  
  const timelineEntry = {
    status: CONSTANTS.TRANSACTION_STATUS.CANCELLED,
    timestamp: new Date(),
    comment: reason
  };
  
  if (cancelledBy) {
    timelineEntry.user = cancelledBy;
  }
  
  this.timeline.push(timelineEntry);
  return this.save();
};

// Instance method to add timeline entry
transactionSchema.methods.addTimelineEntry = function(status, user, comment = null, location = null) {
  const entry = {
    status,
    user,
    timestamp: new Date()
  };
  
  if (comment) entry.comment = comment;
  if (location) entry.location = location;
  
  this.timeline.push(entry);
  return this.save();
};

// Instance method to soft delete
transactionSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

// Add pagination plugin
transactionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Transaction', transactionSchema);
