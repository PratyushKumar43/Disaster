const mongoose = require('mongoose');
const Department = require('./src/models/Department');
const Inventory = require('./src/models/Inventory');
require('dotenv').config();

async function checkAllData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Check all collections
    console.log('\n📋 Available Collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Check departments
    console.log('\n🏢 DEPARTMENTS:');
    console.log('=' .repeat(50));
    const departments = await Department.find({}).select('name code type _id state city');
    console.log(`Total departments: ${departments.length}`);
    
    if (departments.length > 0) {
      departments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name}`);
        console.log(`   Code: ${dept.code}`);
        console.log(`   Type: ${dept.type}`);
        console.log(`   Location: ${dept.city}, ${dept.state}`);
        console.log(`   ObjectId: ${dept._id}`);
        console.log('   ---');
      });
    }

    // Check inventory
    console.log('\n📦 INVENTORY:');
    console.log('=' .repeat(50));
    const inventory = await Inventory.find({})
      .populate('location.department', 'name code')
      .select('itemName itemCode category quantity unit status location cost');
    
    console.log(`Total inventory items: ${inventory.length}`);
    
    if (inventory.length > 0) {
      inventory.forEach((item, index) => {
        console.log(`${index + 1}. ${item.itemName} (${item.itemCode})`);
        console.log(`   Category: ${item.category}`);
        console.log(`   Current Stock: ${item.quantity.current} ${item.unit}`);
        console.log(`   Min/Max: ${item.quantity.minimum}/${item.quantity.maximum}`);
        console.log(`   Department: ${item.location.department?.name || 'Unknown'} (${item.location.department?.code || 'N/A'})`);
        console.log(`   Warehouse: ${item.location.warehouse}`);
        console.log(`   Status: ${item.status}`);
        console.log(`   Unit Price: ₹${item.cost?.unitPrice || 'N/A'}`);
        console.log('   ---');
      });
    }

    // Summary statistics
    console.log('\n📊 SUMMARY STATISTICS:');
    console.log('=' .repeat(50));
    
    // Department statistics
    const deptByType = await Department.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('Departments by type:');
    deptByType.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    // Inventory statistics
    const invByCategory = await Inventory.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalValue: { $sum: '$cost.totalValue' } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nInventory by category:');
    invByCategory.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} items (₹${stat.totalValue || 0})`);
    });

    // Low stock alerts
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity.current', '$quantity.minimum'] }
    }).select('itemName quantity');
    
    if (lowStockItems.length > 0) {
      console.log('\n⚠️  LOW STOCK ALERTS:');
      lowStockItems.forEach(item => {
        console.log(`   ${item.itemName}: ${item.quantity.current} (min: ${item.quantity.minimum})`);
      });
    } else {
      console.log('\n✅ No low stock alerts');
    }

    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllData();