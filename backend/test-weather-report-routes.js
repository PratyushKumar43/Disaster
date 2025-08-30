const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5000/api/v1';
const TEST_LOCATION = {
  latitude: 28.6139, // New Delhi
  longitude: 77.2090,
  location_name: 'New Delhi',
  state: 'Delhi',
  district: 'Central Delhi'
};

console.log('🧪 Testing Weather Report Routes...\n');

async function testReportGeneration() {
  try {
    console.log('1. Testing report generation (JSON format)...');
    
    const generateResponse = await axios.get(`${API_BASE_URL}/weather/reports/generate`, {
      params: {
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        format: 'json',
        language: 'en',
        includeAlerts: true,
        includeForecast: true,
        forecastDays: 7
      }
    });

    console.log('✅ Report generation successful');
    console.log(`   Report data keys: ${Object.keys(generateResponse.data.data).join(', ')}`);
    
    return generateResponse.data.data;
  } catch (error) {
    console.error('❌ Report generation failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testReportSaving(reportData) {
  try {
    console.log('\n2. Testing save report to database...');
    
    const saveResponse = await axios.post(`${API_BASE_URL}/weather/reports/save`, {
      latitude: TEST_LOCATION.latitude,
      longitude: TEST_LOCATION.longitude,
      location_name: TEST_LOCATION.location_name,
      state: TEST_LOCATION.state,
      district: TEST_LOCATION.district,
      reportData: reportData,
      format: 'json',
      language: 'en',
      includeAlerts: true,
      includeForecast: true,
      forecastDays: 7,
      title: 'Test Weather Report'
    });

    console.log('✅ Report saved successfully');
    console.log(`   Report ID: ${saveResponse.data.data.reportId}`);
    console.log(`   Title: ${saveResponse.data.data.title}`);
    
    return saveResponse.data.data.reportId;
  } catch (error) {
    console.error('❌ Report saving failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testGetSavedReports() {
  try {
    console.log('\n3. Testing get saved reports...');
    
    // First try without location filter
    const response = await axios.get(`${API_BASE_URL}/weather/reports/saved`, {
      params: {
        page: 1,
        limit: 5
      }
    });

    console.log('✅ Retrieved saved reports');
    console.log(`   Total reports: ${response.data.pagination.totalItems}`);
    console.log(`   Reports in current page: ${response.data.data.length}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Getting saved reports failed:', error.response?.data?.message || error.message);
    console.error('   Full error:', error.response?.data);
    throw error;
  }
}

async function testGetSpecificReport(reportId) {
  try {
    console.log('\n4. Testing get specific saved report...');
    
    const response = await axios.get(`${API_BASE_URL}/weather/reports/saved/${reportId}`);

    console.log('✅ Retrieved specific report');
    console.log(`   Report title: ${response.data.data.title}`);
    console.log(`   Location: ${response.data.data.location.name}`);
    console.log(`   Access count: ${response.data.data.accessCount}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Getting specific report failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testReportMetadata() {
  try {
    console.log('\n5. Testing report metadata...');
    
    const response = await axios.get(`${API_BASE_URL}/weather/reports/metadata`, {
      params: {
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude
      }
    });

    console.log('✅ Retrieved report metadata');
    console.log(`   Data available: ${response.data.data.dataAvailable}`);
    console.log(`   Active alerts: ${response.data.data.activeAlerts}`);
    console.log(`   Recent reports: ${response.data.data.recentReports}`);
    console.log(`   Supported formats: ${response.data.data.supportedFormats.join(', ')}`);
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Getting report metadata failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testDeleteReport(reportId) {
  try {
    console.log('\n6. Testing delete saved report...');
    
    const response = await axios.delete(`${API_BASE_URL}/weather/reports/saved/${reportId}`);

    console.log('✅ Report deleted successfully');
    console.log(`   Message: ${response.data.message}`);
    
    return true;
  } catch (error) {
    console.error('❌ Deleting report failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testPDFGeneration() {
  try {
    console.log('\n7. Testing PDF report generation...');
    
    const response = await axios.get(`${API_BASE_URL}/weather/reports/generate`, {
      params: {
        latitude: TEST_LOCATION.latitude,
        longitude: TEST_LOCATION.longitude,
        format: 'pdf',
        language: 'en',
        includeAlerts: true,
        includeForecast: true,
        forecastDays: 5
      },
      responseType: 'blob'
    });

    console.log('✅ PDF generation successful');
    console.log(`   Content type: ${response.headers['content-type']}`);
    console.log(`   File size: ${response.data.size} bytes`);
    
    return true;
  } catch (error) {
    console.error('❌ PDF generation failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function runTests() {
  let reportId = null;
  
  try {
    // Test 1: Generate report
    const reportData = await testReportGeneration();
    
    // Test 2: Save report
    reportId = await testReportSaving(reportData);
    
    // Test 3: Get saved reports
    await testGetSavedReports();
    
    // Test 4: Get specific report
    await testGetSpecificReport(reportId);
    
    // Test 5: Get metadata
    await testReportMetadata();
    
    // Test 6: PDF generation
    await testPDFGeneration();
    
    // Test 7: Clean up - delete test report
    if (reportId) {
      await testDeleteReport(reportId);
    }
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    
    // Cleanup even if tests failed
    if (reportId) {
      try {
        await testDeleteReport(reportId);
        console.log('🧹 Cleanup completed');
      } catch (cleanupError) {
        console.error('🚨 Cleanup failed:', cleanupError.message);
      }
    }
    
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`);
    console.log('✅ Server is running\n');
    return true;
  } catch (error) {
    console.error('❌ Server is not running. Please start the backend server first.');
    console.error('   Run: npm run dev (from backend directory)\n');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Weather Report Routes Test Suite');
  console.log('=====================================');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await runTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  testReportGeneration,
  testReportSaving,
  testGetSavedReports,
  testGetSpecificReport,
  testReportMetadata,
  testDeleteReport,
  testPDFGeneration
};
