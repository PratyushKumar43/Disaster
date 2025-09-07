#!/usr/bin/env node

/**
 * Akash Network Production Entry Point
 * This ensures the backend starts correctly with production settings
 */

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 10000;

console.log('🌐 Starting Disaster Management Backend for Akash Network...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🚪 Port: ${process.env.PORT}`);

// Import and start the server
require('./server.js');
