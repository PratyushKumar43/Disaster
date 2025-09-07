const fs = require('fs');
const path = require('path');

// Create minimal .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  const minimalEnv = `# Environment Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (using MongoDB Cloud or local)
MONGODB_URL=mongodb://localhost:27017/disaster_management

# JWT Configuration
JWT_SECRET=test_jwt_secret_key_for_development_only
JWT_EXPIRE=7d

# Frontend Configuration
FRONTEND_URL=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info

# Rate Limiting Configuration
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
`;

  fs.writeFileSync(envPath, minimalEnv);
  console.log('✓ Created minimal .env file for development');
} else {
  console.log('✓ .env file already exists');
}

console.log('Setup complete. You can now run: npm start');



