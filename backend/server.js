const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const server = createServer(app);

// Import configurations
const { connectDB, logger } = require('./src/config/database');
const CONSTANTS = require('./src/config/constants');

// Import routes
const inventoryRoutes = require('./src/routes/inventory');
const departmentRoutes = require('./src/routes/departments');
const transactionRoutes = require('./src/routes/transactions');
const weatherRoutes = require('./src/routes/weather');
const testRoutes = require('./src/routes/test');

// Import middleware
const { 
  errorHandler, 
  notFound, 
  corsErrorHandler,
  requestSizeLimitHandler,
  securityErrorHandler 
} = require('./src/middleware/errorHandler');

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Disaster Management Inventory API',
      version: '1.0.0',
      description: 'A comprehensive API for managing disaster relief inventory and resources',
      contact: {
        name: 'API Support',
        email: 'support@disastermanagement.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-domain.com/api/v1'
          : `http://localhost:${process.env.PORT || 5000}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      // Authentication removed
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js'] // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://disaster-rudkly.vercel.app',
      'https://*.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customSiteTitle: 'Disaster Management API Documentation',
  customfavIcon: '/favicon.ico',
  customCss: '.swagger-ui .topbar { display: none }'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Disaster Management Inventory API',
    version: 'v1',
    status: 'Server is running',
    endpoints: {
      health: '/health',
      api: '/api',
      documentation: '/api/docs',
      inventory: '/api/v1/inventory',
      departments: '/api/v1/departments',
      transactions: '/api/v1/transactions',
      weather: '/api/v1/weather'
    },
    timestamp: new Date().toISOString()
  });
});

// Favicon endpoint - browsers automatically request this
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content - just prevents 404 errors
});

// API version info
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Disaster Management Inventory API',
    version: 'v1',
    documentation: '/api/docs',
    endpoints: {
      inventory: '/api/v1/inventory',
      departments: '/api/v1/departments',
      transactions: '/api/v1/transactions',
      weather: '/api/v1/weather'
    }
  });
});

// API v1 info endpoint - for frontend API base URL
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Disaster Management Inventory API v1',
    version: 'v1',
    status: 'operational',
    endpoints: {
      inventory: '/api/v1/inventory',
      departments: '/api/v1/departments',
      transactions: '/api/v1/transactions',
      weather: '/api/v1/weather',
      test: '/api/v1/test'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/test', testRoutes);

// Error handling middleware (order matters!)
app.use(corsErrorHandler);
app.use(requestSizeLimitHandler);
app.use(securityErrorHandler);

// 404 handler
app.use(notFound);

// Global error handler (must be last middleware)
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id} from ${socket.handshake.address}`);
  
  // Join department-specific rooms for targeted updates
  socket.on('joinDepartment', (departmentId) => {
    if (departmentId) {
      socket.join(`department_${departmentId}`);
      logger.info(`Socket ${socket.id} joined department room: ${departmentId}`);
    }
  });

  // Leave department room
  socket.on('leaveDepartment', (departmentId) => {
    if (departmentId) {
      socket.leave(`department_${departmentId}`);
      logger.info(`Socket ${socket.id} left department room: ${departmentId}`);
    }
  });

  // Note: Authentication removed - sockets now work without authentication

  // Handle real-time inventory updates
  socket.on('subscribeToInventory', (filters) => {
    socket.inventoryFilters = filters;
    logger.info(`Socket ${socket.id} subscribed to inventory updates with filters:`, filters);
  });

  // Handle real-time transaction updates
  socket.on('subscribeToTransactions', (filters) => {
    socket.transactionFilters = filters;
    logger.info(`Socket ${socket.id} subscribed to transaction updates with filters:`, filters);
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
  });

  // Error handling
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, error);
  });
});

// Make io accessible to controllers
app.set('io', io);

// Socket.io utility functions for controllers
const emitToRole = (role, event, data) => {
  io.sockets.sockets.forEach((socket) => {
    if (socket.userRole === role) {
      socket.emit(event, data);
    }
  });
};

const emitToDepartment = (departmentId, event, data) => {
  io.to(`department_${departmentId}`).emit(event, data);
};

const emitToUser = (userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

// Add utility functions to app
app.set('emitToRole', emitToRole);
app.set('emitToDepartment', emitToDepartment);
app.set('emitToUser', emitToUser);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    const PORT = process.env.PORT || 5001;
    
    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      }
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = { app, server, io };
