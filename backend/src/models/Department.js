const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const CONSTANTS = require('../config/constants');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: [100, 'Department name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z0-9]{3,10}$/, 'Department code must be 3-10 alphanumeric characters']
  },
  type: {
    type: String,
    enum: {
      values: Object.values(CONSTANTS.DEPARTMENT_TYPES),
      message: 'Invalid department type'
    },
    required: [true, 'Department type is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  contactInfo: {
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    }
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    enum: {
      values: CONSTANTS.INDIAN_STATES,
      message: 'Invalid state name'
    }
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
    maxlength: [50, 'District name cannot exceed 50 characters']
  },
  headquarters: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  resources: [{
    category: {
      type: String,
      required: true,
      trim: true
    },
    available: {
      type: Number,
      required: true,
      min: [0, 'Available resources cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total resources cannot be negative']
    }
  }],
  establishedDate: {
    type: Date,
    default: Date.now
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance (unique fields already indexed in schema)
departmentSchema.index({ state: 1, district: 1 });
departmentSchema.index({ type: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ parentDepartment: 1 });

// Virtual for full location
departmentSchema.virtual('fullLocation').get(function() {
  return `${this.district}, ${this.state}`;
});

// Virtual for total staff count (can be populated from User model)
departmentSchema.virtual('staffCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true
});

// Virtual for inventory count
departmentSchema.virtual('inventoryCount', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'location.department',
  count: true
});

// Static method to get departments by state
departmentSchema.statics.getByState = function(state) {
  return this.find({ state, isActive: true }).sort({ name: 1 });
};

// Static method to get departments by type
departmentSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true }).sort({ name: 1 });
};

// Instance method to update last active date
departmentSchema.methods.updateLastActive = function() {
  this.lastActiveDate = new Date();
  return this.save();
};

// Pre-save middleware to validate parent department
departmentSchema.pre('save', async function(next) {
  if (this.parentDepartment && this.parentDepartment.equals(this._id)) {
    const error = new Error('Department cannot be its own parent');
    return next(error);
  }
  next();
});

// Pre-save middleware to update lastActiveDate on modification
departmentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.lastActiveDate = new Date();
  }
  next();
});

// Add pagination plugin
departmentSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Department', departmentSchema);
