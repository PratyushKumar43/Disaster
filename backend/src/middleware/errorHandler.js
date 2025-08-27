const CONSTANTS = require('../config/constants');
const { logger } = require('../config/database');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle duplicate key errors (MongoDB E11000)
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  
  return new AppError(message, CONSTANTS.HTTP_STATUS.CONFLICT, 'DUPLICATE_ENTRY');
};

// Handle validation errors (Mongoose)
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Validation Error: ${errors.join('. ')}`;
  
  return new AppError(message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
};

// Handle cast errors (Invalid ObjectId)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'INVALID_ID');
};

// Handle JWT errors
const handleJWTError = () => {
  return new AppError(CONSTANTS.ERRORS.INVALID_TOKEN, CONSTANTS.HTTP_STATUS.UNAUTHORIZED, 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new AppError(CONSTANTS.ERRORS.TOKEN_EXPIRED, CONSTANTS.HTTP_STATUS.UNAUTHORIZED, 'TOKEN_EXPIRED');
};

// Send error for development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    code: err.code,
    stack: err.stack
  });
};

// Send error for production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR:', err);
    
    res.status(CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CONSTANTS.ERRORS.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR'
    });
  }
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = handleCastError(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = handleDuplicateKeyError(error);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(error);
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    const message = err.details.map(detail => detail.message).join('. ');
    error = new AppError(message, CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
  }

  // Handle Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File too large', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'FILE_TOO_LARGE');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Unexpected file field', CONSTANTS.HTTP_STATUS.BAD_REQUEST, 'UNEXPECTED_FILE');
  }

  // Set default statusCode if not set
  if (!error.statusCode) {
    error.statusCode = CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, CONSTANTS.HTTP_STATUS.NOT_FOUND, 'ROUTE_NOT_FOUND');
  next(error);
};

// Validation error handler for express-validator
const handleValidationResult = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: CONSTANTS.ERRORS.VALIDATION_ERROR,
      code: 'VALIDATION_ERROR',
      errors: errorMessages
    });
  }
  
  next();
};

// Rate limit error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.round(req.rateLimit.resetTime / 1000) || 900
  });
};

// Database connection error handler
const handleDBError = (err) => {
  logger.error('Database error:', err);
  
  if (err.name === 'MongoNetworkError') {
    return new AppError('Database connection failed', CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DB_CONNECTION_ERROR');
  }
  
  if (err.name === 'MongoTimeoutError') {
    return new AppError('Database operation timed out', CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DB_TIMEOUT_ERROR');
  }
  
  return new AppError('Database error occurred', CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DB_ERROR');
};

// CORS error handler
const corsErrorHandler = (err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS')) {
    return res.status(CONSTANTS.HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'CORS policy violation',
      code: 'CORS_ERROR'
    });
  }
  next(err);
};

// Request size limit handler
const requestSizeLimitHandler = (err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Request entity too large',
      code: 'REQUEST_TOO_LARGE'
    });
  }
  next(err);
};

// Security headers error handler
const securityErrorHandler = (err, req, res, next) => {
  if (err && err.code === 'HPP_PARAMETER_POLLUTION') {
    return res.status(CONSTANTS.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Parameter pollution detected',
      code: 'PARAMETER_POLLUTION'
    });
  }
  next(err);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFound,
  handleValidationResult,
  rateLimitHandler,
  handleDBError,
  corsErrorHandler,
  requestSizeLimitHandler,
  securityErrorHandler
};





