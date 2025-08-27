#!/usr/bin/env node

// Simple test script to verify all dependencies are working
console.log('🔍 Testing backend dependencies...\n');

try {
  // Test core dependencies
  const express = require('express');
  console.log('✅ Express:', require('express/package.json').version);

  const mongoose = require('mongoose');
  console.log('✅ Mongoose:', require('mongoose/package.json').version);

  const bcrypt = require('bcryptjs');
  console.log('✅ BCryptJS:', require('bcryptjs/package.json').version);

  const jwt = require('jsonwebtoken');
  console.log('✅ JSON Web Token:', require('jsonwebtoken/package.json').version);

  const joi = require('joi');
  console.log('✅ Joi:', require('joi/package.json').version);

  const cors = require('cors');
  console.log('✅ CORS:', require('cors/package.json').version);

  const helmet = require('helmet');
  console.log('✅ Helmet:', require('helmet/package.json').version);

  const morgan = require('morgan');
  console.log('✅ Morgan:', require('morgan/package.json').version);

  const rateLimit = require('express-rate-limit');
  console.log('✅ Express Rate Limit:', require('express-rate-limit/package.json').version);

  const multer = require('multer');
  console.log('✅ Multer:', require('multer/package.json').version);

  const socketio = require('socket.io');
  console.log('✅ Socket.io:', require('socket.io/package.json').version);

  const winston = require('winston');
  console.log('✅ Winston:', require('winston/package.json').version);

  const mongoosePaginate = require('mongoose-paginate-v2');
  console.log('✅ Mongoose Paginate:', require('mongoose-paginate-v2/package.json').version);

  console.log('\n🎉 All dependencies loaded successfully!');
  console.log('\n📊 Environment check:');
  console.log('Node.js version:', process.version);
  console.log('Platform:', process.platform);
  console.log('Architecture:', process.arch);

  // Test basic Express app creation
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan('combined'));

  console.log('\n✅ Basic Express app created successfully');
  console.log('\n🚀 Backend is ready to start!');

} catch (error) {
  console.error('❌ Error loading dependencies:', error.message);
  process.exit(1);
}





