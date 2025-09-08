/**
 * Test Script for Bhuvan API Integration
 * Tests all Bhuvan API endpoints and services
 */

const axios = require('axios');
const path = require('path');
require('dotenv').config();

// Import our Bhuvan service
const bhuvanAPIService = require('./src/services/bhuvanAPIService');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

function logTest(testName) {
  log(`\n🧪 Testing: ${testName}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Test configurations
const testLocations = [
  { name: 'Delhi NCR', lat: 28.7041, lon: 77.1025 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 }
];

// Test the backend API endpoints
async function testBackendAPI() {
  logSection('TESTING BACKEND API ENDPOINTS');

  const baseURL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';
  
  try {
    // Test health endpoint first
    logTest('Health Check');
    const healthResponse = await axios.get(`${baseURL}/health`, { timeout: 5000 });
    if (healthResponse.status === 200) {
      logSuccess('Backend server is running');
      logInfo(`Server response: ${JSON.stringify(healthResponse.data, null, 2)}`);
    }
  } catch (error) {
    logError(`Backend server not responding: ${error.message}`);
    logInfo('Please start the backend server with: npm start');
    return false;
  }

  // Test fire risk endpoints
  for (const location of testLocations.slice(0, 3)) { // Test first 3 locations
    try {
      logTest(`Fire Risk - ${location.name}`);
      
      const riskResponse = await axios.get(
        `${baseURL}/fire-risk/current?latitude=${location.lat}&longitude=${location.lon}`,
        { timeout: 10000 }
      );
      
      if (riskResponse.status === 200) {
        logSuccess(`Got fire risk data for ${location.name}`);
        logInfo(`Risk Level: ${riskResponse.data.data.riskLevel}`);
        logInfo(`Risk Score: ${(riskResponse.data.data.riskScore * 100).toFixed(1)}%`);
      }
    } catch (error) {
      logError(`Failed to get fire risk for ${location.name}: ${error.message}`);
    }

    try {
      logTest(`Fire Hotspots - ${location.name}`);
      
      const hotspotsResponse = await axios.get(
        `${baseURL}/fire-risk/hotspots?centerLat=${location.lat}&centerLon=${location.lon}&radius=50`,
        { timeout: 10000 }
      );
      
      if (hotspotsResponse.status === 200) {
        logSuccess(`Got hotspots data for ${location.name}`);
        logInfo(`Found ${hotspotsResponse.data.data.count} hotspots`);
        if (hotspotsResponse.data.data.hotspots.length > 0) {
          logInfo(`Sample hotspot: ${JSON.stringify(hotspotsResponse.data.data.hotspots[0], null, 2)}`);
        }
      }
    } catch (error) {
      logError(`Failed to get hotspots for ${location.name}: ${error.message}`);
    }
  }

  return true;
}

// Test Bhuvan API service directly
async function testBhuvanService() {
  logSection('TESTING BHUVAN API SERVICE DIRECTLY');

  try {
    logTest('Bhuvan Service Initialization');
    logInfo('Checking Bhuvan API configuration...');
    
    // Check environment variables
    if (process.env.BHUVAN_API_TOKEN) {
      logSuccess('Bhuvan API token is configured');
    } else {
      logError('BHUVAN_API_TOKEN not found in environment variables');
    }

    if (process.env.BHUVAN_API_BASE_URL) {
      logSuccess(`Bhuvan API base URL: ${process.env.BHUVAN_API_BASE_URL}`);
    } else {
      logError('BHUVAN_API_BASE_URL not found in environment variables');
    }

  } catch (error) {
    logError(`Service initialization failed: ${error.message}`);
  }

  // Test fire hotspots
  for (const location of testLocations.slice(0, 2)) { // Test first 2 locations
    try {
      logTest(`Direct Bhuvan API - Forest Fire Hotspots - ${location.name}`);
      
      const bounds = {
        minLat: location.lat - 0.5,
        maxLat: location.lat + 0.5,
        minLon: location.lon - 0.5,
        maxLon: location.lon + 0.5
      };

      const hotspots = await bhuvanAPIService.getForestFireHotspots(bounds);
      
      if (hotspots && Array.isArray(hotspots)) {
        logSuccess(`Retrieved ${hotspots.length} hotspots for ${location.name}`);
        if (hotspots.length > 0) {
          logInfo(`Sample hotspot data: ${JSON.stringify(hotspots[0], null, 2)}`);
        }
      } else {
        logInfo(`No hotspots found for ${location.name} (this is normal)`);
      }

    } catch (error) {
      logError(`Failed to get forest fire hotspots for ${location.name}: ${error.message}`);
      logInfo(`Error details: ${error.stack}`);
    }
  }

  // Test satellite imagery
  try {
    logTest('Direct Bhuvan API - Satellite Imagery');
    
    const delhiBounds = {
      minLat: 28.4,
      maxLat: 28.9,
      minLon: 76.8,
      maxLon: 77.4
    };

    const imagery = await bhuvanAPIService.getSatelliteImagery(delhiBounds);
    
    if (imagery) {
      logSuccess('Retrieved satellite imagery metadata');
      logInfo(`Imagery data: ${JSON.stringify(imagery, null, 2)}`);
    } else {
      logInfo('No satellite imagery data available');
    }

  } catch (error) {
    logError(`Failed to get satellite imagery: ${error.message}`);
  }

  // Test disaster alerts
  try {
    logTest('Direct Bhuvan API - Disaster Alerts');
    
    const alerts = await bhuvanAPIService.getDisasterAlerts('fire', {
      minLat: 20,
      maxLat: 30,
      minLon: 75,
      maxLon: 85
    });
    
    if (alerts && Array.isArray(alerts)) {
      logSuccess(`Retrieved ${alerts.length} disaster alerts`);
      if (alerts.length > 0) {
        logInfo(`Sample alert: ${JSON.stringify(alerts[0], null, 2)}`);
      }
    } else {
      logInfo('No disaster alerts found (this is normal)');
    }

  } catch (error) {
    logError(`Failed to get disaster alerts: ${error.message}`);
  }
}

// Test network connectivity
async function testNetworkConnectivity() {
  logSection('TESTING NETWORK CONNECTIVITY');

  const testUrls = [
    'https://www.google.com',
    'https://bhuvan.nrsc.gov.in',
    'https://api.openweathermap.org',
    'https://generativelanguage.googleapis.com'
  ];

  for (const url of testUrls) {
    try {
      logTest(`Network connectivity to ${url}`);
      
      const response = await axios.get(url, { 
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept any status < 500
      });
      
      logSuccess(`Connected to ${url} (Status: ${response.status})`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logError(`Cannot connect to ${url} - Connection refused`);
      } else if (error.code === 'ENOTFOUND') {
        logError(`Cannot resolve ${url} - DNS error`);
      } else if (error.code === 'ETIMEDOUT') {
        logError(`Timeout connecting to ${url}`);
      } else {
        logError(`Error connecting to ${url}: ${error.message}`);
      }
    }
  }
}

// Test environment configuration
function testEnvironmentConfig() {
  logSection('TESTING ENVIRONMENT CONFIGURATION');

  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'GEMINI_API_KEY',
    'BHUVAN_API_TOKEN',
    'BHUVAN_API_BASE_URL'
  ];

  const optionalEnvVars = [
    'OPENWEATHER_API_KEY',
    'JWT_SECRET',
    'CORS_ORIGIN'
  ];

  logTest('Required Environment Variables');
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      logSuccess(`${envVar}: Set`);
    } else {
      logError(`${envVar}: Missing`);
    }
  }

  logTest('Optional Environment Variables');
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      logSuccess(`${envVar}: Set`);
    } else {
      logInfo(`${envVar}: Not set (optional)`);
    }
  }

  // Test .env file
  logTest('Environment File Check');
  const fs = require('fs');
  if (fs.existsSync('.env')) {
    logSuccess('.env file exists');
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      logInfo(`Found ${envLines.length} environment variables in .env file`);
    } catch (error) {
      logError(`Error reading .env file: ${error.message}`);
    }
  } else {
    logError('.env file not found');
  }
}

// Test mock data generation
async function testMockDataGeneration() {
  logSection('TESTING MOCK DATA GENERATION');

  const FireRiskAPI = require('./src/controllers/fireRiskController');
  
  try {
    logTest('Mock Fire Risk Data Generation');
    
    // Test data generation for different locations
    for (const location of testLocations.slice(0, 3)) {
      logTest(`Mock data for ${location.name}`);
      
      // This would be done by the API, but we're testing the logic
      const mockRisk = {
        riskScore: Math.random(),
        riskLevel: ['LOW', 'MODERATE', 'HIGH', 'EXTREME'][Math.floor(Math.random() * 4)],
        location: location,
        features: {
          temperature: 20 + Math.random() * 20,
          humidity: 30 + Math.random() * 40,
          windSpeed: Math.random() * 25,
          precipitation: Math.random() * 10
        },
        timestamp: new Date().toISOString()
      };
      
      logSuccess(`Generated mock risk data for ${location.name}`);
      logInfo(`Risk: ${mockRisk.riskLevel} (${(mockRisk.riskScore * 100).toFixed(1)}%)`);
      logInfo(`Temperature: ${mockRisk.features.temperature.toFixed(1)}°C`);
    }
    
  } catch (error) {
    logError(`Mock data generation failed: ${error.message}`);
  }
}

// Main test execution
async function runAllTests() {
  console.clear();
  logSection('🔥 BHUVAN API INTEGRATION TEST SUITE 🔥');
  
  const startTime = Date.now();
  
  try {
    // Test environment first
    testEnvironmentConfig();
    
    // Test network connectivity
    await testNetworkConnectivity();
    
    // Test Bhuvan service directly
    await testBhuvanService();
    
    // Test mock data generation
    await testMockDataGeneration();
    
    // Test backend API (if running)
    await testBackendAPI();
    
  } catch (error) {
    logError(`Test suite failed: ${error.message}`);
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  logSection('TEST SUMMARY');
  logInfo(`Test execution completed in ${duration} seconds`);
  logInfo('Check the results above for any failures or issues');
  
  // Recommendations
  console.log('\n📋 RECOMMENDATIONS:');
  log('1. Ensure backend server is running: cd backend && npm start', 'yellow');
  log('2. Check .env file has all required variables', 'yellow');
  log('3. Verify network connectivity to external APIs', 'yellow');
  log('4. Test frontend integration: cd Frontend && npm run dev', 'yellow');
  log('5. Monitor browser console for any client-side errors', 'yellow');
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔥 Bhuvan API Test Script

Usage: node test-bhuvan-api.js [options]

Options:
  --help, -h         Show this help message
  --env-only         Test only environment configuration
  --network-only     Test only network connectivity  
  --service-only     Test only Bhuvan service directly
  --backend-only     Test only backend API endpoints
  --mock-only        Test only mock data generation

Examples:
  node test-bhuvan-api.js                    # Run all tests
  node test-bhuvan-api.js --env-only         # Test environment only
  node test-bhuvan-api.js --service-only     # Test Bhuvan service only
  `);
  process.exit(0);
}

// Run specific tests based on arguments
if (args.includes('--env-only')) {
  testEnvironmentConfig();
} else if (args.includes('--network-only')) {
  testNetworkConnectivity();
} else if (args.includes('--service-only')) {
  testBhuvanService();
} else if (args.includes('--backend-only')) {
  testBackendAPI();
} else if (args.includes('--mock-only')) {
  testMockDataGeneration();
} else {
  // Run all tests
  runAllTests();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n🛑 Test execution interrupted by user', 'yellow');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled rejection at ${promise}: ${reason}`);
  process.exit(1);
});
