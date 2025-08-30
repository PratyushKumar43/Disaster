const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testWeatherReports() {
  try {
    console.log('Testing weather report generation...');
    
    const lat = 22.2537491;
    const lon = 88.3620844;
    
    console.log(`\n1. Testing if server is running...`);
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✓ Server is running:', healthResponse.data.message);
    } catch (error) {
      console.log('✗ Server not responding:', error.message);
      console.log('Error details:', error.code);
      return;
    }
    
    console.log(`\n2. Testing current weather endpoint first...`);
    try {
      const weatherResponse = await axios.get(`${BASE_URL}/weather/current`, {
        params: { 
          latitude: lat, 
          longitude: lon,
          location_name: 'Kolkata',
          state: 'West Bengal'
        }
      });
      console.log('✓ Current weather fetch successful');
    } catch (error) {
      console.log('✗ Current weather fetch failed:', error.response?.data || error.message);
    }
    
    console.log(`\n3. Testing weather report generation...`);
    try {
      const reportResponse = await axios.get(`${BASE_URL}/weather/reports/generate`, {
        params: {
          latitude: lat,
          longitude: lon,
          format: 'json',
          type: 'comprehensive',
          includeAlerts: true,
          includeForecast: true,
          forecastDays: 1
        }
      });
      console.log('✓ Weather report generation successful');
      console.log('Report data keys:', Object.keys(reportResponse.data));
    } catch (error) {
      console.log('✗ Weather report generation failed:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      } else {
        console.log('Error:', error.message);
      }
    }
    
    console.log(`\n4. Testing Excel report generation...`);
    try {
      const excelResponse = await axios.get(`${BASE_URL}/weather/reports/generate`, {
        params: {
          latitude: lat,
          longitude: lon,
          format: 'excel',
          type: 'comprehensive',
          includeAlerts: false,
          includeForecast: true,
          forecastDays: 1
        },
        responseType: 'blob'
      });
      console.log('✓ Excel report generation successful');
    } catch (error) {
      console.log('✗ Excel report generation failed:');
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Status Text:', error.response.statusText);
      } else {
        console.log('Error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testWeatherReports();
