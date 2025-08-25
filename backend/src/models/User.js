const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CONSTANTS = require('../config/constants');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: {
      values: Object.values(CONSTANTS.USER_ROLES),
      message: 'Invalid user role'
    },
    default: CONSTANTS.USER_ROLES.FIELD_WORKER
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String,
    default: null
  },
  permissions: [{
    resource: {
      type: String,
      required: true,
      enum: ['inventory', 'users', 'departments', 'transactions', 'reports']
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'approve']
    }]
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    relationship: {
      type: String,
      trim: true,
      maxlength: [50, 'Relationship cannot exceed 50 characters']
    },
    phone: {
      type: String,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    }
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: Date
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.emailVerificationToken;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance (unique fields already indexed in schema)
userSchema.index({ department: 1 });
userSchema.index({ state: 1, district: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastLogin: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role') || this.isNew) {
    this.permissions = this.getDefaultPermissions();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Get default permissions based on role
userSchema.methods.getDefaultPermissions = function() {
  const role = this.role;
  const permissions = [];

  switch (role) {
    case CONSTANTS.USER_ROLES.ADMIN:
      permissions.push(
        { resource: 'inventory', actions: ['create', 'read', 'update', 'delete', 'approve'] },
        { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'departments', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'transactions', actions: ['create', 'read', 'update', 'delete', 'approve'] },
        { resource: 'reports', actions: ['create', 'read', 'update', 'delete'] }
      );
      break;
    case CONSTANTS.USER_ROLES.COORDINATOR:
      permissions.push(
        { resource: 'inventory', actions: ['create', 'read', 'update', 'approve'] },
        { resource: 'users', actions: ['read', 'update'] },
        { resource: 'departments', actions: ['read'] },
        { resource: 'transactions', actions: ['create', 'read', 'update', 'approve'] },
        { resource: 'reports', actions: ['create', 'read'] }
      );
      break;
    case CONSTANTS.USER_ROLES.FIELD_WORKER:
      permissions.push(
        { resource: 'inventory', actions: ['read', 'update'] },
        { resource: 'transactions', actions: ['create', 'read'] },
        { resource: 'reports', actions: ['read'] }
      );
      break;
    case CONSTANTS.USER_ROLES.VOLUNTEER:
      permissions.push(
        { resource: 'inventory', actions: ['read'] },
        { resource: 'transactions', actions: ['read'] },
        { resource: 'reports', actions: ['read'] }
      );
      break;
    default:
      // Minimal permissions for unknown roles
      permissions.push(
        { resource: 'inventory', actions: ['read'] }
      );
  }

  return permissions;
};

// Check if user has specific permission
userSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  return permission && permission.actions.includes(action);
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find users by department
userSchema.statics.findByDepartment = function(departmentId) {
  return this.find({ department: departmentId, isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to find users by location
userSchema.statics.findByLocation = function(state, district = null) {
  const query = { state, isActive: true };
  if (district) {
    query.district = district;
  }
  return this.find(query);
};

module.exports = mongoose.model('User', userSchema);
