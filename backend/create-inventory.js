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

async function createInventoryItems() {
  try {
    log('📦 Creating Inventory Items in MongoDB Atlas', 'cyan');
    log('='.repeat(50), 'cyan');
    
    // Connect to database
    log('\n🔗 Connecting to database...', 'blue');
    await mongoose.connect(ATLAS_URL);
    log('✅ Connected successfully!', 'green');
    
    // Check available departments
    const departments = await Department.find({ isActive: true });
    log(`\n🏢 Found ${departments.length} active departments:`, 'blue');
    
    if (departments.length === 0) {
      log('❌ No departments found! Please run migration first.', 'red');
      return;
    }
    
    departments.slice(0, 5).forEach((dept, index) => {
      log(`   ${index + 1}. ${dept.name} (${dept.code}) - ${dept.type}`, 'blue');
    });
    
    // Create sample inventory items
    log('\n📦 Creating inventory items...', 'cyan');
    
    const inventoryItems = [
      {
        itemName: 'Emergency Biscuits',
        itemCode: 'BISC001',
        category: 'food_supplies',
        description: 'High-energy emergency biscuits for disaster relief',
        quantity: {
          current: 100,
          reserved: 5,
          minimum: 20,
          maximum: 200
        },
        unit: 'packets',
        location: {
          department: departments[0]._id,
          warehouse: 'Food Storage Warehouse',
          section: 'Dry Foods',
          rack: 'R01',
          shelf: 'S03'
        },
        status: 'available',
        cost: {
          unitPrice: 25,
          currency: 'INR'
        },
        supplier: {
          name: 'Emergency Foods Ltd',
          contact: '+919876543210',
          email: 'supply@emergencyfoods.com'
        }
      },
      {
        itemName: 'First Aid Kit - Basic',
        itemCode: 'MED001',
        category: 'medical',
        description: 'Basic first aid kit with bandages, antiseptic, and medicines',
        quantity: {
          current: 50,
          reserved: 2,
          minimum: 10,
          maximum: 100
        },
        unit: 'pieces',
        location: {
          department: departments[1] ? departments[1]._id : departments[0]._id,
          warehouse: 'Medical Supply Warehouse',
          section: 'First Aid',
          rack: 'R02',
          shelf: 'S01'
        },
        status: 'available',
        cost: {
          unitPrice: 500,
          currency: 'INR'
        }
      },
      {
        itemName: 'Water Purification Tablets',
        itemCode: 'WAT001',
        category: 'water_supplies',
        description: 'Water purification tablets for emergency water treatment',
        quantity: {
          current: 500,
          reserved: 0,
          minimum: 100,
          maximum: 1000
        },
        unit: 'packets',
        location: {
          department: departments[2] ? departments[2]._id : departments[0]._id,
          warehouse: 'Water Treatment Center',
          section: 'Purification',
          rack: 'R03',
          shelf: 'S02'
        },
        status: 'available',
        cost: {
          unitPrice: 10,
          currency: 'INR'
        }
      },
      {
        itemName: 'Emergency Blankets',
        itemCode: 'SHE001',
        category: 'shelter_materials',
        description: 'Thermal emergency blankets for disaster relief and shelter',
        quantity: {
          current: 200,
          reserved: 10,
          minimum: 50,
          maximum: 500
        },
        unit: 'pieces',
        location: {
          department: departments[3] ? departments[3]._id : departments[0]._id,
          warehouse: 'Shelter Supplies',
          section: 'Blankets & Bedding',
          rack: 'R04',
          shelf: 'S01'
        },
        status: 'available',
        cost: {
          unitPrice: 150,
          currency: 'INR'
        }
      },
      {
        itemName: 'Portable Radio Communication Device',
        itemCode: 'COMM001',
        category: 'communication',
        description: 'Portable radio for emergency communication and coordination',
        quantity: {
          current: 25,
          reserved: 3,
          minimum: 5,
          maximum: 50
        },
        unit: 'pieces',
        location: {
          department: departments[4] ? departments[4]._id : departments[0]._id,
          warehouse: 'Communication Equipment',
          section: 'Radio Devices',
          rack: 'R05',
          shelf: 'S01'
        },
        status: 'available',
        cost: {
          unitPrice: 2500,
          currency: 'INR'
        }
      },
      {
        itemName: 'Emergency Food Rations',
        itemCode: 'FOOD002',
        category: 'food_supplies',
        description: 'Ready-to-eat emergency food rations for disaster victims',
        quantity: {
          current: 300,
          reserved: 15,
          minimum: 75,
          maximum: 600
        },
        unit: 'packets',
        location: {
          department: departments[0]._id,
          warehouse: 'Food Storage Warehouse',
          section: 'Ready Meals',
          rack: 'R02',
          shelf: 'S01'
        },
        status: 'available',
        cost: {
          unitPrice: 80,
          currency: 'INR'
        }
      }
    ];
    
    // Insert inventory items one by one with validation
    const createdItems = [];
    
    for (let i = 0; i < inventoryItems.length; i++) {
      try {
        const item = new Inventory(inventoryItems[i]);
        const savedItem = await item.save();
        createdItems.push(savedItem);
        
        log(`   ✅ Created: ${savedItem.itemName} (${savedItem.itemCode})`, 'green');
        log(`      📍 ID: ${savedItem._id}`, 'blue');
        log(`      🏢 Department: ${savedItem.location.department}`, 'blue');
        log(`      📦 Quantity: ${savedItem.quantity.current} ${savedItem.unit}`, 'blue');
        
      } catch (error) {
        log(`   ❌ Failed to create ${inventoryItems[i].itemName}: ${error.message}`, 'red');
      }
    }
    
    log(`\n🎉 Successfully created ${createdItems.length} inventory items!`, 'green');
    
    // Verify the items were saved
    log('\n🔍 Verifying saved items...', 'cyan');
    const totalCount = await Inventory.countDocuments();
    log(`   📊 Total inventory items in database: ${totalCount}`, 'blue');
    
    // Show inventory summary
    if (totalCount > 0) {
      const allItems = await Inventory.find()
        .populate('location.department', 'name code')
        .sort({ createdAt: -1 });
      
      log('\n📋 Current Inventory Summary:', 'cyan');
      allItems.forEach((item, index) => {
        const dept = item.location.department;
        log(`   ${index + 1}. ${item.itemName} (${item.itemCode})`, 'blue');
        log(`      🏢 Department: ${dept ? dept.name : 'Unknown'}`, 'reset');
        log(`      📦 Quantity: ${item.quantity.current}/${item.quantity.maximum} ${item.unit}`, 'reset');
        log(`      🔄 Status: ${item.status}`, 'reset');
      });
    }
    
    log('\n💡 Next Steps:', 'yellow');
    log('   1. Run: node fetch-inventory.js to see all items', 'yellow');
    log('   2. Use these item IDs in your application', 'yellow');
    log('   3. Check your frontend to see if it displays the items', 'yellow');
    
  } catch (error) {
    log('\n❌ Error creating inventory items:', 'red');
    log(`Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('\n📦 Database connection closed', 'blue');
    }
  }
}

// Function to create a specific biscuits item like the one mentioned
async function createBiscuitsItem() {
  try {
    log('🍪 Creating Biscuits Item', 'cyan');
    await mongoose.connect(ATLAS_URL);
    
    const departments = await Department.find({ isActive: true }).limit(1);
    if (departments.length === 0) {
      log('❌ No departments found!', 'red');
      return;
    }
    
    const biscuitsItem = new Inventory({
      itemName: 'Biscuits',
      itemCode: 'BISC002',
      category: 'food_supplies',
      description: 'Emergency biscuits for disaster relief operations',
      quantity: {
        current: 150,
        reserved: 0,
        minimum: 30,
        maximum: 300
      },
      unit: 'packets',
      location: {
        department: departments[0]._id,
        warehouse: 'Emergency Food Storage',
        section: 'Packaged Foods'
      },
      status: 'available',
      cost: {
        unitPrice: 20,
        currency: 'INR'
      }
    });
    
    const savedItem = await biscuitsItem.save();
    log(`✅ Biscuits item created successfully!`, 'green');
    log(`   📍 ID: ${savedItem._id}`, 'blue');
    log(`   🏢 Department ID: ${savedItem.location.department}`, 'blue');
    log(`   📦 Quantity: ${savedItem.quantity.current} ${savedItem.unit}`, 'blue');
    
    // Verify it can be found
    const foundItem = await Inventory.findById(savedItem._id);
    log(`   🔍 Verification: ${foundItem ? 'Item can be found ✅' : 'Item NOT found ❌'}`, foundItem ? 'green' : 'red');
    
  } catch (error) {
    log(`❌ Error creating biscuits item: ${error.message}`, 'red');
  }
}

// Run based on command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--biscuits')) {
    createBiscuitsItem().catch(console.error);
  } else {
    createInventoryItems().catch(console.error);
  }
}

module.exports = { createInventoryItems, createBiscuitsItem };

