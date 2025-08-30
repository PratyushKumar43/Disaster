const mongoose = require('mongoose');
const Inventory = require('./src/models/Inventory');
const Department = require('./src/models/Department');

// MongoDB Atlas connection string
const ATLAS_URL = 'mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/disaster-management?retryWrites=true&w=majority';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function debugInventory() {
  try {
    log('🔍 Debugging Inventory Issue', 'cyan');
    log('='.repeat(50), 'cyan');
    
    // Connect to database
    log('\n🔗 Connecting to database...', 'blue');
    await mongoose.connect(ATLAS_URL);
    log('✅ Connected successfully!', 'green');
    
    // Check the specific item by ID
    const itemId = '68afffbb1e8ace20f9121461';
    const deptId = '68affb2758269db1e74db474';
    
    log(`\n🔍 Looking for specific item: ${itemId}`, 'blue');
    
    try {
      const specificItem = await Inventory.findById(itemId);
      if (specificItem) {
        log('✅ Found the specific item!', 'green');
        log(`   📝 Name: ${specificItem.itemName}`, 'blue');
        log(`   📂 Code: ${specificItem.itemCode}`, 'blue');
        log(`   📊 Category: ${specificItem.category}`, 'blue');
        log(`   📦 Quantity: ${specificItem.quantity?.current || 'N/A'}`, 'blue');
        log(`   🏢 Department ID: ${specificItem.location?.department}`, 'blue');
        log(`   🗑️  Is Deleted: ${specificItem.isDeleted}`, 'blue');
        log(`   🔄 Status: ${specificItem.status}`, 'blue');
        log(`   📅 Created: ${specificItem.createdAt}`, 'blue');
      } else {
        log('❌ Specific item not found by ID', 'red');
      }
    } catch (idError) {
      log(`❌ Error finding item by ID: ${idError.message}`, 'red');
    }
    
    // Check the specific department
    log(`\n🔍 Looking for department: ${deptId}`, 'blue');
    
    try {
      const specificDept = await Department.findById(deptId);
      if (specificDept) {
        log('✅ Found the department!', 'green');
        log(`   📝 Name: ${specificDept.name}`, 'blue');
        log(`   📂 Code: ${specificDept.code}`, 'blue');
        log(`   🔄 Type: ${specificDept.type}`, 'blue');
        log(`   ✅ Active: ${specificDept.isActive}`, 'blue');
      } else {
        log('❌ Department not found by ID', 'red');
      }
    } catch (deptError) {
      log(`❌ Error finding department by ID: ${deptError.message}`, 'red');
    }
    
    // Get total counts using different methods
    log('\n📊 Database Counts:', 'cyan');
    
    const totalInventory = await Inventory.countDocuments();
    log(`   📦 Total Inventory (countDocuments): ${totalInventory}`, 'blue');
    
    const totalWithoutDeleted = await Inventory.countDocuments({ isDeleted: { $ne: true } });
    log(`   📦 Non-deleted Inventory: ${totalWithoutDeleted}`, 'blue');
    
    const totalDepartments = await Department.countDocuments();
    log(`   🏢 Total Departments: ${totalDepartments}`, 'blue');
    
    // Check for items with partial matches
    log('\n🔍 Searching for Biscuits items:', 'blue');
    const biscuitItems = await Inventory.find({ 
      itemName: { $regex: /biscuit/i } 
    });
    
    if (biscuitItems.length > 0) {
      log(`✅ Found ${biscuitItems.length} biscuit items:`, 'green');
      biscuitItems.forEach((item, index) => {
        log(`   ${index + 1}. ${item.itemName} (${item._id})`, 'blue');
        log(`      Department: ${item.location?.department}`, 'blue');
        log(`      Deleted: ${item.isDeleted}`, 'blue');
        log(`      Status: ${item.status}`, 'blue');
      });
    } else {
      log('❌ No biscuit items found with regex search', 'red');
    }
    
    // Check all inventory items (raw query)
    log('\n📋 Raw inventory query (first 10):', 'blue');
    const allItems = await Inventory.find({}).limit(10);
    
    if (allItems.length > 0) {
      log(`✅ Found ${allItems.length} items in raw query:`, 'green');
      allItems.forEach((item, index) => {
        log(`   ${index + 1}. ${item.itemName || 'No Name'} (${item._id})`, 'blue');
        log(`      Code: ${item.itemCode || 'No Code'}`, 'blue');
        log(`      Category: ${item.category || 'No Category'}`, 'blue');
        log(`      Deleted: ${item.isDeleted}`, 'blue');
      });
    } else {
      log('❌ No items found in raw query', 'red');
    }
    
    // Check MongoDB collections directly
    log('\n🗄️  Checking collections directly:', 'blue');
    const collections = await mongoose.connection.db.listCollections().toArray();
    log(`   📁 Available collections: ${collections.map(c => c.name).join(', ')}`, 'blue');
    
    // Direct MongoDB query
    const directInventoryCount = await mongoose.connection.db.collection('inventories').countDocuments();
    log(`   📦 Direct inventory count: ${directInventoryCount}`, 'blue');
    
    if (directInventoryCount > 0) {
      const directItems = await mongoose.connection.db.collection('inventories').find({}).limit(5).toArray();
      log(`   📋 Direct query results (first 5):`, 'blue');
      directItems.forEach((item, index) => {
        log(`      ${index + 1}. ${item.itemName || 'No Name'} (${item._id})`, 'blue');
      });
    }
    
    // Check for the specific item in different ways
    log('\n🔍 Multiple search strategies for your item:', 'cyan');
    
    // Try finding by partial ID
    try {
      const partialIdSearch = await Inventory.find({ 
        _id: { $regex: /68afffbb1e8ace20f9121461/i } 
      });
      log(`   🔗 Partial ID search: ${partialIdSearch.length} results`, 'blue');
    } catch (e) {
      log(`   ❌ Partial ID search error: ${e.message}`, 'red');
    }
    
    // Try exact ObjectId
    try {
      const objectIdSearch = await Inventory.findById(new mongoose.Types.ObjectId(itemId));
      log(`   🔗 ObjectId search: ${objectIdSearch ? 'Found' : 'Not found'}`, objectIdSearch ? 'green' : 'red');
    } catch (e) {
      log(`   ❌ ObjectId search error: ${e.message}`, 'red');
    }
    
    // Search by department
    try {
      const deptSearch = await Inventory.find({ 
        'location.department': deptId 
      });
      log(`   🏢 Department search: ${deptSearch.length} items`, 'blue');
    } catch (e) {
      log(`   ❌ Department search error: ${e.message}`, 'red');
    }
    
    log('\n🎯 Recommendations:', 'yellow');
    log('   1. Check if the item was created in a different database', 'yellow');
    log('   2. Verify the connection URL points to the correct cluster', 'yellow');
    log('   3. Check if there are multiple databases with similar names', 'yellow');
    log('   4. Verify the item wasn\'t soft-deleted (isDeleted: true)', 'yellow');
    
  } catch (error) {
    log('\n❌ Error during debugging:', 'red');
    log(`Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('\n📦 Database connection closed', 'blue');
    }
  }
}

// Function to create a test item
async function createTestItem() {
  try {
    log('\n🧪 Creating test item...', 'cyan');
    await mongoose.connect(ATLAS_URL);
    
    // Get a department first
    const dept = await Department.findOne();
    if (!dept) {
      log('❌ No departments found. Creating one first...', 'red');
      const testDept = new Department({
        name: 'Test Department',
        code: 'TEST001',
        type: 'other',
        state: 'Maharashtra',
        district: 'Mumbai',
        isActive: true
      });
      await testDept.save();
      log('✅ Test department created', 'green');
    }
    
    const department = await Department.findOne();
    
    const testItem = new Inventory({
      itemName: 'Test Biscuits',
      itemCode: 'TEST001',
      category: 'food_supplies',
      description: 'Test biscuits for debugging',
      quantity: {
        current: 100,
        reserved: 0,
        minimum: 10,
        maximum: 200
      },
      unit: 'packets',
      location: {
        department: department._id,
        warehouse: 'Test Warehouse',
        section: 'A1'
      },
      status: 'available'
    });
    
    const savedItem = await testItem.save();
    log(`✅ Test item created with ID: ${savedItem._id}`, 'green');
    
    // Immediately try to find it
    const foundItem = await Inventory.findById(savedItem._id);
    log(`🔍 Can find test item: ${foundItem ? 'YES' : 'NO'}`, foundItem ? 'green' : 'red');
    
  } catch (error) {
    log(`❌ Error creating test item: ${error.message}`, 'red');
  }
}

// Run debugging
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--create-test')) {
    createTestItem().catch(console.error);
  } else {
    debugInventory().catch(console.error);
  }
}

module.exports = { debugInventory, createTestItem };

