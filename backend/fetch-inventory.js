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

async function fetchInventory() {
  try {
    log('📦 Fetching Inventory from MongoDB Atlas', 'cyan');
    log('='.repeat(50), 'cyan');
    
    // Connect to database
    log('\n🔗 Connecting to database...', 'blue');
    await mongoose.connect(ATLAS_URL);
    log('✅ Connected successfully!', 'green');
    
    // Get total count
    const totalCount = await Inventory.countDocuments();
    log(`\n📊 Total Inventory Items: ${totalCount}`, 'magenta');
    
    if (totalCount === 0) {
      log('❌ No inventory items found in database', 'red');
      log('\n💡 Suggestions:', 'yellow');
      log('   1. Run migration script first: node final-migrate.js', 'yellow');
      log('   2. Or add inventory items manually', 'yellow');
      return;
    }
    
    // Fetch all inventory with department details
    log('\n🔍 Fetching inventory details...', 'blue');
    const inventoryItems = await Inventory.find()
      .populate('location.department', 'name code type')
      .populate('updatedBy', 'firstName lastName')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    log(`✅ Retrieved ${inventoryItems.length} inventory items`, 'green');
    
    // Display inventory summary
    log('\n📋 Inventory Summary:', 'cyan');
    log('-'.repeat(80), 'cyan');
    
    inventoryItems.forEach((item, index) => {
      const dept = item.location.department;
      const deptName = dept ? dept.name : 'Unknown Department';
      const stockStatus = getStockStatus(item);
      const statusColor = getStatusColor(stockStatus);
      
      log(`\n${index + 1}. ${item.itemName} (${item.itemCode})`, 'blue');
      log(`   📁 Category: ${item.category}`, 'reset');
      log(`   📍 Department: ${deptName}`, 'reset');
      log(`   📦 Warehouse: ${item.location.warehouse}`, 'reset');
      log(`   📊 Quantity: ${item.quantity.current}/${item.quantity.maximum} ${item.unit}`, 'reset');
      log(`   📈 Status: ${stockStatus}`, statusColor);
      log(`   🔄 Last Updated: ${item.lastUpdated ? item.lastUpdated.toLocaleDateString() : 'N/A'}`, 'reset');
      
      if (item.description) {
        log(`   📝 Description: ${item.description.substring(0, 60)}${item.description.length > 60 ? '...' : ''}`, 'reset');
      }
    });
    
    // Display statistics
    log('\n📈 Inventory Statistics:', 'cyan');
    log('-'.repeat(50), 'cyan');
    
    // By category
    const categoryStats = await Inventory.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity.current' } } },
      { $sort: { count: -1 } }
    ]);
    
    log('\n📂 By Category:', 'blue');
    categoryStats.forEach(stat => {
      log(`   • ${stat._id}: ${stat.count} items (${stat.totalQuantity} units total)`, 'reset');
    });
    
    // By status
    const statusStats = await Inventory.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    log('\n🔄 By Status:', 'blue');
    statusStats.forEach(stat => {
      log(`   • ${stat._id}: ${stat.count} items`, 'reset');
    });
    
    // Low stock items
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity.current', '$quantity.minimum'] }
    });
    
    if (lowStockItems.length > 0) {
      log('\n⚠️  Low Stock Alert:', 'yellow');
      lowStockItems.forEach(item => {
        log(`   • ${item.itemName}: ${item.quantity.current}/${item.quantity.minimum} ${item.unit}`, 'yellow');
      });
    }
    
    // Out of stock items
    const outOfStockItems = await Inventory.find({ 'quantity.current': 0 });
    
    if (outOfStockItems.length > 0) {
      log('\n❌ Out of Stock:', 'red');
      outOfStockItems.forEach(item => {
        log(`   • ${item.itemName} (${item.itemCode})`, 'red');
      });
    }
    
    log('\n🎉 Inventory fetch completed!', 'green');
    
  } catch (error) {
    log('\n❌ Error fetching inventory:', 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      log('\n💡 IP Whitelist Issue:', 'yellow');
      log('   Add your IP to MongoDB Atlas Network Access', 'yellow');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('\n📦 Database connection closed', 'blue');
    }
  }
}

// Helper function to determine stock status
function getStockStatus(item) {
  const current = item.quantity.current;
  const minimum = item.quantity.minimum;
  
  if (current === 0) return 'OUT_OF_STOCK';
  if (current <= minimum * 0.5) return 'CRITICAL';
  if (current <= minimum) return 'LOW_STOCK';
  return 'ADEQUATE';
}

// Helper function to get color for status
function getStatusColor(status) {
  switch (status) {
    case 'OUT_OF_STOCK': return 'red';
    case 'CRITICAL': return 'red';
    case 'LOW_STOCK': return 'yellow';
    case 'ADEQUATE': return 'green';
    default: return 'reset';
  }
}

// Additional function to fetch inventory by filters
async function fetchInventoryByFilters(filters = {}) {
  try {
    await mongoose.connect(ATLAS_URL);
    
    const query = { ...filters };
    const items = await Inventory.find(query)
      .populate('location.department', 'name code type')
      .sort({ createdAt: -1 });
    
    return items;
  } catch (error) {
    throw error;
  }
}

// Function to fetch inventory by department
async function fetchInventoryByDepartment(departmentId) {
  try {
    await mongoose.connect(ATLAS_URL);
    
    const items = await Inventory.find({ 'location.department': departmentId })
      .populate('location.department', 'name code type')
      .sort({ itemName: 1 });
    
    return items;
  } catch (error) {
    throw error;
  }
}

// Function to fetch inventory by category
async function fetchInventoryByCategory(category) {
  try {
    await mongoose.connect(ATLAS_URL);
    
    const items = await Inventory.find({ category: category })
      .populate('location.department', 'name code type')
      .sort({ itemName: 1 });
    
    return items;
  } catch (error) {
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fetchInventory().catch(console.error);
}

module.exports = {
  fetchInventory,
  fetchInventoryByFilters,
  fetchInventoryByDepartment,
  fetchInventoryByCategory
};

