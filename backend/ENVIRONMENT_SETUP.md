# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/disaster_management
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.mongodb.net/disaster_management_test

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_change_this_in_production
JWT_REFRESH_EXPIRE=30d

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info

# Security Configuration
BCRYPT_ROUNDS=12

# Rate Limiting Configuration
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## MongoDB Setup

1. Create a MongoDB Atlas account (free tier available)
2. Create a new cluster
3. Create a database user with read/write permissions
4. Get the connection string and replace the MONGODB_URL in your .env file
5. Make sure to URL-encode special characters in the password

### Example for special characters in password:
If your password is `w2avF@@@XiDyNXW`, encode it as `w2avF%40%40%40XiDyNXW`

## JWT Secrets

Generate secure random strings for JWT secrets:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

## Running the Application

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The server will start on http://localhost:5000
4. API documentation will be available at http://localhost:5000/api/docs

## Production Environment

For production, make sure to:
1. Set NODE_ENV=production
2. Use strong, unique JWT secrets
3. Use a production MongoDB cluster
4. Set the correct FRONTEND_URL
5. Configure proper CORS settings








