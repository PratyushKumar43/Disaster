const axios = require('axios');

const testWeatherAPI = async () => {
  try {
    console.log('Testing Weather API endpoints...\n');
    
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Server health:', healthResponse.data.message);
    
    // Test weather service health
    console.log('\n2. Testing weather service health...');
    const weatherHealthResponse = await axios.get('http://localhost:5000/api/v1/weather/health');
    console.log('✅ Weather service health:', weatherHealthResponse.data.message);
    
    // Test current weather (with sample coordinates - Delhi)
    console.log('\n3. Testing current weather endpoint...');
    const currentWeatherResponse = await axios.get('http://localhost:5000/api/v1/weather/current', {
      params: {
        latitude: 28.6139,
        longitude: 77.2090,
        location_name: 'Delhi',
        state: 'Delhi'
      }
    });
    console.log('✅ Current weather retrieved successfully');
    console.log('   Location:', currentWeatherResponse.data.data.weather.location.name);
    console.log('   Temperature:', currentWeatherResponse.data.data.weather.current.temperature + '°C');
    
    // Test weather forecast
    console.log('\n4. Testing weather forecast endpoint...');
    const forecastResponse = await axios.get('http://localhost:5000/api/v1/weather/forecast', {
      params: {
        latitude: 28.6139,
        longitude: 77.2090,
        days: 5
      }
    });
    console.log('✅ Weather forecast retrieved successfully');
    console.log('   Forecast days:', forecastResponse.data.data.dailyForecast.length);
    
    // Test weather alerts
    console.log('\n5. Testing weather alerts endpoint...');
    const alertsResponse = await axios.get('http://localhost:5000/api/v1/weather/alerts', {
      params: {
        latitude: 28.6139,
        longitude: 77.2090
      }
    });
    console.log('✅ Weather alerts retrieved successfully');
    console.log('   Active alerts:', alertsResponse.data.data.alerts.length);
    
    // Test weather report generation (now that we have data)
    console.log('\n6. Testing weather report generation...');
    const reportResponse = await axios.get('http://localhost:5000/api/v1/weather/reports/generate', {
      params: {
        latitude: 28.6139,
        longitude: 77.2090,
        format: 'json',
        language: 'en'
      }
    });
    console.log('✅ Weather report generated successfully');
    console.log('   Report location:', reportResponse.data.data.location.name);
    
    // Test weather stats
    console.log('\n7. Testing weather stats endpoint...');
    const statsResponse = await axios.get('http://localhost:5000/api/v1/weather/stats');
    console.log('✅ Weather statistics retrieved successfully');
    console.log('   Total locations:', statsResponse.data.data.totalLocations);
    
    console.log('\n🎉 All weather API tests passed!');
    
  } catch (error) {
    console.error('❌ Weather API test failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    console.error('   URL:', error.config?.url);
    
    if (error.response?.data) {
      console.error('   Full response:', JSON.stringify(error.response.data, null, 2));
    }
    
    process.exit(1);
  }
};

// Run the test
testWeatherAPI();
