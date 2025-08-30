const fs = require('fs');
const path = require('path');

const envContent = `# MongoDB Atlas Configuration
MONGODB_URL=mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/disaster-management?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Security (Change in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads/

# Email Configuration (Optional - Configure if needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
`;

const envPath = path.join(__dirname, '.env');

try {
  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists. Skipping creation.');
    console.log('📄 Current .env file:');
    console.log(fs.readFileSync(envPath, 'utf8'));
  } else {
    // Create .env file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file successfully!');
    console.log('📄 .env file contents:');
    console.log(envContent);
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Review and update the .env file as needed');
  console.log('2. Make sure to add your IP to MongoDB Atlas whitelist');
  console.log('3. Run: node simple-connection-test.js');
  console.log('4. If connection test passes, run: node migrate-to-atlas.js');
  
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Manual setup:');
  console.log('Create a .env file in the backend directory with the following content:');
  console.log(envContent);
}
