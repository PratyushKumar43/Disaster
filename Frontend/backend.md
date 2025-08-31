# Disaster Management Inventory System - Backend Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Technology Stack](#technology-stack)
4. [Project Setup](#project-setup)
5. [Database Design](#database-design)
6. [API Endpoints](#api-endpoints)
7. [Authentication & Authorization](#authentication--authorization)
8. [Real-time Features](#real-time-features)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)

## Project Overview

### System Requirements
- **Node.js**: v18+ 
- **MongoDB**: v6.0+
- **Express.js**: v4.18+
- **JWT Authentication**
- **Real-time Updates**: Socket.io
- **File Upload**: Multer
- **Data Validation**: Joi
- **API Documentation**: Swagger

### Key Features
- Multi-level geographic organization (States → Districts → Departments)
- Department-specific inventory management (Fire, Flood, Medical, etc.)
- Role-based access control (Admin, Coordinator, Field Worker)
- Real-time inventory tracking and alerts
- Resource allocation and distribution management
- Disaster response coordination
- Comprehensive audit logging

## Architecture & Design

### Folder Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── server.js
│   │   └── constants.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Organization.js
│   │   ├── Inventory.js
│   │   ├── Department.js
│   │   ├── Location.js
│   │   └── Transaction.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── inventoryController.js
│   │   ├── departmentController.js
│   │   ├── locationController.js
│   │   └── transactionController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── inventory.js
│   │   ├── departments.js
│   │   ├── locations.js
│   │   └── transactions.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── rateLimit.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── inventoryService.js
│   │   ├── notificationService.js
│   │   └── auditService.js
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   └── tests/
├── uploads/
├── logs/
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Technology Stack

### Core Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^6.10.0",
    "multer": "^1.4.5",
    "socket.io": "^4.7.2",
    "nodemailer": "^6.9.4",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "eslint": "^8.47.0"
  }
}
```

## Project Setup

### Step 1: Initialize Project
```bash
# Create project directory
mkdir disaster-backend
cd disaster-backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken joi cors dotenv helmet morgan express-rate-limit multer socket.io nodemailer swagger-jsdoc swagger-ui-express winston

# Install dev dependencies
npm install -D nodemon jest supertest eslint
```

### Step 2: Environment Configuration
Create `.env` file:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/disaster_management
MONGODB_TEST_URI=mongodb://localhost:27017/disaster_management_test

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Step 3: Basic Server Setup
Create `server.js`:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Import routes
const authRoutes = require('./src/routes/auth');
const inventoryRoutes = require('./src/routes/inventory');
const departmentRoutes = require('./src/routes/departments');
const locationRoutes = require('./src/routes/locations');
const transactionRoutes = require('./src/routes/transactions');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');
const { connectDB } = require('./src/config/database');

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
  message: 'Too many requests from this IP'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to controllers
app.set('io', io);

// Database connection and server start
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
```

## Database Design

### Database Configuration
Create `src/config/database.js`:
```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = { connectDB };
```

### Data Models

#### User Model (`src/models/User.js`)
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['admin', 'coordinator', 'field_worker', 'volunteer'],
    default: 'field_worker'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String
  },
  permissions: [{
    resource: String,
    actions: [String]
  }]
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ department: 1 });
userSchema.index({ state: 1, district: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
```

#### Department Model (`src/models/Department.js`)
```javascript
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['fire', 'flood', 'medical', 'rescue', 'police', 'military', 'ngo', 'other'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  state: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  headquarters: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  resources: [{
    category: String,
    available: Number,
    total: Number
  }]
}, {
  timestamps: true
});

departmentSchema.index({ state: 1, district: 1 });
departmentSchema.index({ type: 1 });
departmentSchema.index({ code: 1 });

module.exports = mongoose.model('Department', departmentSchema);
```

#### Inventory Model (`src/models/Inventory.js`)
```javascript
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: ['medical', 'rescue_equipment', 'food_supplies', 'water_supplies', 'shelter_materials', 'communication', 'transportation', 'tools', 'clothing', 'other'],
    required: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  specifications: {
    brand: String,
    model: String,
    size: String,
    weight: String,
    color: String,
    material: String,
    expiryDate: Date,
    batchNumber: String
  },
  quantity: {
    current: {
      type: Number,
      required: true,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    minimum: {
      type: Number,
      required: true,
      min: 0
    },
    maximum: {
      type: Number,
      required: true
    }
  },
  unit: {
    type: String,
    enum: ['pieces', 'kg', 'liters', 'boxes', 'packets', 'meters', 'sets'],
    required: true
  },
  cost: {
    unitPrice: Number,
    totalValue: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  location: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    warehouse: {
      type: String,
      required: true
    },
    section: String,
    rack: String,
    shelf: String
  },
  supplier: {
    name: String,
    contact: String,
    address: String
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'damaged', 'expired', 'under_maintenance'],
    default: 'available'
  },
  images: [String],
  qrCode: String,
  barcode: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better performance
inventorySchema.index({ itemCode: 1 });
inventorySchema.index({ category: 1 });
inventorySchema.index({ 'location.department': 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ 'quantity.current': 1 });

// Virtual for available quantity
inventorySchema.virtual('availableQuantity').get(function() {
  return this.quantity.current - this.quantity.reserved;
});

// Check if item is low stock
inventorySchema.virtual('isLowStock').get(function() {
  return this.quantity.current <= this.quantity.minimum;
});

// Check if item is out of stock
inventorySchema.virtual('isOutOfStock').get(function() {
  return this.quantity.current === 0;
});

module.exports = mongoose.model('Inventory', inventorySchema);
```

#### Transaction Model (`src/models/Transaction.js`)
```javascript
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['inbound', 'outbound', 'transfer', 'adjustment', 'damaged', 'expired'],
    required: true
  },
  inventory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  from: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    warehouse: String
  },
  to: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    warehouse: String
  },
  reason: {
    type: String,
    required: true
  },
  reference: {
    type: String // Purchase order, transfer order, etc.
  },
  cost: {
    unitPrice: Number,
    totalCost: Number
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  attachments: [String]
}, {
  timestamps: true
});

transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ inventory: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
```

## API Endpoints

### Authentication Controller (`src/controllers/authController.js`)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegister, validateLogin } = require('../utils/validators');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { username, email, password, firstName, lastName, phoneNumber, role, department, state, district } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role,
      department,
      state,
      district
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
          state: user.state,
          district: user.district
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).populate('department');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Validate password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          department: user.department,
          state: user.state,
          district: user.district,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department')
      .select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
```

### Inventory Controller (`src/controllers/inventoryController.js`)
```javascript
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const { validateInventoryItem } = require('../utils/validators');

// @desc    Get all inventory items
// @route   GET /api/v1/inventory
// @access  Private
const getAllInventory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      department,
      lowStock,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (department) filter['location.department'] = department;
    if (search) {
      filter.$or = [
        { itemName: { $regex: search, $options: 'i' } },
        { itemCode: { $regex: search, $options: 'i' } }
      ];
    }

    // Low stock filter
    if (lowStock === 'true') {
      filter.$expr = {
        $lte: ['$quantity.current', '$quantity.minimum']
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: 'location.department updatedBy',
      sort: { createdAt: -1 }
    };

    const result = await Inventory.paginate(filter, options);

    res.status(200).json({
      success: true,
      data: result.docs,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.totalDocs,
        hasNext: result.hasNextPage,
        hasPrev: result.hasPrevPage
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single inventory item
// @route   GET /api/v1/inventory/:id
// @access  Private
const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate('location.department updatedBy');

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: inventory
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new inventory item
// @route   POST /api/v1/inventory
// @access  Private
const createInventoryItem = async (req, res) => {
  try {
    const { error } = validateInventoryItem(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Generate unique item code if not provided
    if (!req.body.itemCode) {
      const count = await Inventory.countDocuments();
      req.body.itemCode = `INV${String(count + 1).padStart(6, '0')}`;
    }

    // Calculate total value
    if (req.body.cost && req.body.cost.unitPrice) {
      req.body.cost.totalValue = req.body.cost.unitPrice * req.body.quantity.current;
    }

    // Set updatedBy
    req.body.updatedBy = req.user.id;

    const inventory = await Inventory.create(req.body);

    // Create initial transaction
    await Transaction.create({
      transactionId: `TXN${Date.now()}`,
      type: 'inbound',
      inventory: inventory._id,
      quantity: inventory.quantity.current,
      to: {
        department: inventory.location.department,
        warehouse: inventory.location.warehouse
      },
      reason: 'Initial stock',
      performedBy: req.user.id,
      status: 'completed'
    });

    const populatedInventory = await Inventory.findById(inventory._id)
      .populate('location.department updatedBy');

    // Emit real-time update
    req.app.get('io').emit('inventoryCreated', populatedInventory);

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: populatedInventory
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update inventory item
// @route   PUT /api/v1/inventory/:id
// @access  Private
const updateInventoryItem = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Store old quantity for transaction
    const oldQuantity = inventory.quantity.current;
    
    // Update fields
    Object.assign(inventory, req.body);
    inventory.updatedBy = req.user.id;
    inventory.lastUpdated = new Date();

    // Recalculate total value if needed
    if (inventory.cost && inventory.cost.unitPrice) {
      inventory.cost.totalValue = inventory.cost.unitPrice * inventory.quantity.current;
    }

    await inventory.save();

    // Create adjustment transaction if quantity changed
    if (req.body.quantity && req.body.quantity.current !== oldQuantity) {
      const quantityDiff = req.body.quantity.current - oldQuantity;
      
      await Transaction.create({
        transactionId: `TXN${Date.now()}`,
        type: 'adjustment',
        inventory: inventory._id,
        quantity: Math.abs(quantityDiff),
        reason: req.body.adjustmentReason || 'Manual adjustment',
        performedBy: req.user.id,
        status: 'completed'
      });
    }

    const updatedInventory = await Inventory.findById(inventory._id)
      .populate('location.department updatedBy');

    // Emit real-time update
    req.app.get('io').emit('inventoryUpdated', updatedInventory);

    res.status(200).json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedInventory
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/v1/inventory/:id
// @access  Private
const deleteInventoryItem = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await inventory.deleteOne();

    // Emit real-time update
    req.app.get('io').emit('inventoryDeleted', { id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/v1/inventory/low-stock
// @access  Private
const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: {
        $lte: ['$quantity.current', '$quantity.minimum']
      }
    }).populate('location.department');

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems
};
```

### Authentication Middleware (`src/middleware/auth.js`)
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
```

### Routes Setup (`src/routes/inventory.js`)
```javascript
const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);

// Routes
router.route('/')
  .get(getAllInventory)
  .post(authorize('admin', 'coordinator'), createInventoryItem);

router.route('/low-stock')
  .get(getLowStockItems);

router.route('/:id')
  .get(getInventoryById)
  .put(authorize('admin', 'coordinator'), updateInventoryItem)
  .delete(authorize('admin'), deleteInventoryItem);

module.exports = router;
```

## Testing Strategy

### Test Setup (`src/tests/setup.js`)
```javascript
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

module.exports.connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
};

module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
```

### Sample Test (`src/tests/inventory.test.js`)
```javascript
const request = require('supertest');
const { app } = require('../../server');
const { connect, closeDatabase, clearDatabase } = require('./setup');
const User = require('../models/User');
const Department = require('../models/Department');
const Inventory = require('../models/Inventory');

describe('Inventory API', () => {
  beforeAll(async () => await connect());
  afterEach(async () => await clearDatabase());
  afterAll(async () => await closeDatabase());

  describe('GET /api/v1/inventory', () => {
    it('should return all inventory items', async () => {
      // Create test user and department
      const department = await Department.create({
        name: 'Fire Department',
        code: 'FIRE001',
        type: 'fire',
        state: 'Maharashtra',
        district: 'Mumbai'
      });

      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '+919876543210',
        role: 'admin',
        department: department._id,
        state: 'Maharashtra',
        district: 'Mumbai'
      });

      // Login to get token
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      const token = loginRes.body.data.token;

      // Create test inventory item
      await Inventory.create({
        itemName: 'Fire Extinguisher',
        itemCode: 'FE001',
        category: 'rescue_equipment',
        quantity: {
          current: 50,
          minimum: 10,
          maximum: 100
        },
        unit: 'pieces',
        location: {
          department: department._id,
          warehouse: 'Main Warehouse'
        }
      });

      const res = await request(app)
        .get('/api/v1/inventory')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].itemName).toBe('Fire Extinguisher');
    });
  });
});
```

## Deployment Guide

### Docker Configuration (`Dockerfile`)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

### Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/disaster_management
    depends_on:
      - mongo
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  mongo_data:
```

### Production Deployment Steps

1. **Server Setup**
```bash
# Install Node.js and MongoDB
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
npm install -g pm2
```

2. **Application Deployment**
```bash
# Clone repository
git clone <repository-url>
cd disaster-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with production values

# Build and start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

3. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

This comprehensive backend system provides:
- Complete CRUD operations for inventory management
- State and district-wise organization
- Department-specific access control
- Real-time updates via WebSockets
- Comprehensive transaction logging
- Role-based authentication
- RESTful API design
- Production-ready deployment configuration

The system is designed to handle the complex requirements of disaster management with scalability, security, and reliability in mind.

