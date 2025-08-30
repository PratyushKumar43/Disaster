const mongoose = require('mongoose');

// Import all models
const Department = require('./src/models/Department');
const Inventory = require('./src/models/Inventory');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');
const Weather = require('./src/models/Weather');

// MongoDB Atlas connection string
const ATLAS_URL = 'mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/disaster-management?retryWrites=true&w=majority';

// Color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function runMigration() {
  try {
    log('🚀 MongoDB Atlas Migration - Final Version', 'cyan');
    log('='.repeat(50), 'cyan');
    
    // Step 1: Connect
    log('\n🔗 Connecting to MongoDB Atlas...', 'cyan');
    await mongoose.connect(ATLAS_URL);
    log('✅ Connected successfully!', 'green');
    
    // Step 2: Test connection
    const db = mongoose.connection.db;
    log(`📍 Database: ${db.databaseName}`, 'blue');
    log(`📍 Connection State: ${mongoose.connection.readyState}`, 'blue');
    
    // Step 3: Create Indexes
    log('\n📚 Creating indexes...', 'cyan');
    try {
      await Department.createIndexes();
      log('   ✅ Department indexes created', 'green');
    } catch (e) {
      log('   ⚠️  Department indexes: ' + e.message, 'yellow');
    }
    
    try {
      await Inventory.createIndexes();
      log('   ✅ Inventory indexes created', 'green');
    } catch (e) {
      log('   ⚠️  Inventory indexes: ' + e.message, 'yellow');
    }
    
    // Step 4: Check existing data
    log('\n🔍 Checking existing data...', 'cyan');
    const deptCount = await Department.countDocuments();
    const invCount = await Inventory.countDocuments();
    
    log(`   📊 Departments: ${deptCount}`, 'blue');
    log(`   📊 Inventory: ${invCount}`, 'blue');
    
    // Step 5: Seed departments if empty
    if (deptCount === 0) {
      log('\n🌱 Seeding departments...', 'cyan');
      
      const sampleDepartments = [
        {
          name: 'Fire Department',
          code: 'FIRE001',
          type: 'fire',
          description: 'Emergency fire response and rescue operations',
          contactInfo: {
            email: 'fire@emergency.gov',
            phone: '+911234567890',
            address: 'Central Fire Station'
          },
          state: 'Maharashtra',
          district: 'Mumbai',
          isActive: true
        },
        {
          name: 'Police Department',
          code: 'POLICE01',
          type: 'police',
          description: 'Law enforcement and emergency response',
          contactInfo: {
            email: 'police@emergency.gov',
            phone: '+911234567890',
            address: 'Central Police Station'
          },
          state: 'Maharashtra',
          district: 'Mumbai',
          isActive: true
        },
        {
          name: 'Medical Emergency Services',
          code: 'MED001',
          type: 'medical',
          description: 'Emergency medical services and ambulance',
          contactInfo: {
            email: 'medical@emergency.gov',
            phone: '+911234567891',
            address: 'Emergency Medical Center'
          },
          state: 'Maharashtra',
          district: 'Mumbai',
          isActive: true
        },
        {
          name: 'Disaster Management Office',
          code: 'DMO001',
          type: 'other',
          description: 'Central disaster management coordination',
          contactInfo: {
            email: 'disaster@gov.in',
            phone: '+911234567892',
            address: 'Disaster Management HQ'
          },
          state: 'Maharashtra',
          district: 'Mumbai',
          isActive: true
        },
        {
          name: 'Relief Distribution Center',
          code: 'RELIEF01',
          type: 'rescue',
          description: 'Emergency relief supplies distribution',
          contactInfo: {
            email: 'relief@emergency.gov',
            phone: '+911234567893',
            address: 'Relief Center Complex'
          },
          state: 'Delhi',
          district: 'New Delhi',
          isActive: true
        }
      ];
      
      const created = await Department.insertMany(sampleDepartments);
      log(`   ✅ Created ${created.length} departments`, 'green');
      
      created.forEach(dept => {
        log(`      • ${dept.name} (${dept.code})`, 'blue');
      });
    } else {
      log('   ℹ️  Departments already exist, skipping seeding', 'yellow');
    }
    
    // Step 6: Seed inventory if empty
    if (invCount === 0) {
      log('\n📦 Creating sample inventory...', 'cyan');
      
      const departments = await Department.find().limit(3);
      if (departments.length > 0) {
        const sampleInventory = [
          {
            itemName: 'Emergency First Aid Kit',
            itemCode: 'MED001',
            category: 'medical',
            description: 'Complete first aid kit for emergency medical assistance',
            quantity: { current: 50, reserved: 5, minimum: 10, maximum: 100 },
            unit: 'pieces',
            location: {
              department: departments[0]._id,
              warehouse: 'Main Medical Storage',
              section: 'A1'
            },
            status: 'available'
          },
          {
            itemName: 'Water Purification Tablets',
            itemCode: 'WAT001',
            category: 'water_supplies',
            description: 'Water purification tablets for emergency water treatment',
            quantity: { current: 500, reserved: 0, minimum: 100, maximum: 1000 },
            unit: 'packets',
            location: {
              department: departments[1]._id,
              warehouse: 'Water Supply Depot',
              section: 'B2'
            },
            status: 'available'
          },
          {
            itemName: 'Emergency Blankets',
            itemCode: 'SHE001',
            category: 'shelter_materials',
            description: 'Thermal emergency blankets for disaster relief',
            quantity: { current: 200, reserved: 10, minimum: 50, maximum: 500 },
            unit: 'pieces',
            location: {
              department: departments[2]._id,
              warehouse: 'Shelter Supplies',
              section: 'C1'
            },
            status: 'available'
          }
        ];
        
        const createdItems = await Inventory.insertMany(sampleInventory);
        log(`   ✅ Created ${createdItems.length} inventory items`, 'green');
        
        createdItems.forEach(item => {
          log(`      • ${item.itemName} (${item.itemCode}) - Qty: ${item.quantity.current}`, 'blue');
        });
      }
    } else {
      log('   ℹ️  Inventory already exists, skipping creation', 'yellow');
    }
    
    // Step 7: Final verification
    log('\n🔍 Final verification...', 'cyan');
    const finalDeptCount = await Department.countDocuments();
    const finalInvCount = await Inventory.countDocuments();
    const collections = await db.listCollections().toArray();
    
    log(`   📊 Total Departments: ${finalDeptCount}`, 'blue');
    log(`   📊 Total Inventory: ${finalInvCount}`, 'blue');
    log(`   📊 Total Collections: ${collections.length}`, 'blue');
    
    // Step 8: Test a query
    const activeDepts = await Department.find({ isActive: true }).limit(1);
    if (activeDepts.length > 0) {
      log(`   ✅ Query test passed: ${activeDepts[0].name}`, 'green');
    }
    
    log('\n🎉 Migration completed successfully!', 'green');
    log('\n💡 Next Steps:', 'cyan');
    log('   1. Your MongoDB Atlas database is ready!', 'blue');
    log('   2. Start your backend: npm start', 'blue');
    log('   3. Your app will connect to Atlas automatically', 'blue');
    log('   4. Check Atlas dashboard to see your data', 'blue');
    
  } catch (error) {
    log('\n❌ Migration failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      log('\n💡 IP Whitelist Solution:', 'yellow');
      log('   1. Go to MongoDB Atlas Dashboard', 'yellow');
      log('   2. Navigate to Network Access', 'yellow');
      log('   3. Add your current IP address', 'yellow');
      log('   4. Wait 1-2 minutes and try again', 'yellow');
    }
    
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log('\n📦 Connection closed', 'blue');
    }
  }
}

// Run migration
if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = runMigration;
