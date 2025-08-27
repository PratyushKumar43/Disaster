const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test function
const testAPI = async () => {
  console.log('🧪 Testing API Endpoints');
  console.log('========================\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`   ✅ Health: ${healthResponse.data.message}`);
    console.log(`   📊 Environment: ${healthResponse.data.environment}`);
    console.log(`   ⏱️ Uptime: ${healthResponse.data.uptime}s\n`);

    // Test 2: Departments without filter
    console.log('2️⃣ Testing Departments Endpoint (no filter)...');
    const deptResponse = await axios.get(`${BASE_URL}/api/v1/departments`);
    console.log(`   📋 Departments found: ${deptResponse.data.pagination.totalItems}`);
    console.log(`   📄 Current page: ${deptResponse.data.pagination.currentPage}`);
    console.log(`   📈 Total pages: ${deptResponse.data.pagination.totalPages}\n`);

    // Test 3: Departments with isActive filter
    console.log('3️⃣ Testing Departments Endpoint (isActive=true)...');
    const activeDeptResponse = await axios.get(`${BASE_URL}/api/v1/departments?isActive=true`);
    console.log(`   📋 Active departments found: ${activeDeptResponse.data.pagination.totalItems}`);
    
    if (activeDeptResponse.data.data.length > 0) {
      console.log('   📋 Sample departments:');
      activeDeptResponse.data.data.slice(0, 3).forEach(dept => {
        console.log(`      • ${dept.name} (${dept.code}) - ${dept.type}`);
      });
    } else {
      console.log('   ❌ No departments returned');
    }
    console.log();

    // Test 4: Inventory endpoint
    console.log('4️⃣ Testing Inventory Endpoint...');
    const inventoryResponse = await axios.get(`${BASE_URL}/api/v1/inventory`);
    console.log(`   📦 Inventory items found: ${inventoryResponse.data.pagination.totalItems}`);
    console.log(`   📄 Current page: ${inventoryResponse.data.pagination.currentPage}\n`);

    // Test 5: Inventory dashboard stats
    console.log('5️⃣ Testing Inventory Dashboard Stats...');
    const statsResponse = await axios.get(`${BASE_URL}/api/v1/inventory/dashboard/stats`);
    console.log(`   📊 Stats retrieved successfully: ${statsResponse.data.success}`);
    if (statsResponse.data.data) {
      console.log(`   📈 Total items: ${statsResponse.data.data.totalItems || 'N/A'}`);
      console.log(`   📉 Low stock: ${statsResponse.data.data.lowStockItems || 'N/A'}`);
    }
    console.log();

    // Test 6: Transactions endpoint
    console.log('6️⃣ Testing Transactions Endpoint...');
    const transactionsResponse = await axios.get(`${BASE_URL}/api/v1/transactions`);
    console.log(`   📋 Transactions found: ${transactionsResponse.data.pagination.totalItems}`);
    console.log(`   📄 Current page: ${transactionsResponse.data.pagination.currentPage}\n`);

  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    if (error.response) {
      console.error('   📄 Status:', error.response.status);
      console.error('   📋 Response:', error.response.data);
    }
  }
};

// Run the test
testAPI().then(() => {
  console.log('========================');
  console.log('✅ API testing completed!');
}).catch(error => {
  console.error('💥 Test script failed:', error);
});





