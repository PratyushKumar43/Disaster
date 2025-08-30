const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Import all models
const Department = require('./src/models/Department');
const Inventory = require('./src/models/Inventory');
const User = require('./src/models/User');
const Transaction = require('./src/models/Transaction');
const Weather = require('./src/models/Weather');

// MongoDB Atlas connection string
const ATLAS_URL = 'mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/disaster-management?retryWrites=true&w=majority';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

class SimpleMigration {
  constructor() {
    this.migrationReport = {
      startTime: new Date(),
      endTime: null,
      collections: {},
      errors: [],
      success: false
    };
  }

  // Connect to MongoDB Atlas using simple mongoose.connect
  async connectToAtlas() {
    try {
      log('🔗 Connecting to MongoDB Atlas...', 'cyan');
      
      const options = {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0
      };
      
      await mongoose.connect(ATLAS_URL, options);
      
      log('✅ Connected to MongoDB Atlas successfully!', 'green');
      
      // Safely get connection info
      const connection = mongoose.connection;
      log(`📍 Connection State: ${connection.readyState} (1=connected)`, 'blue');
      log(`📍 Database: ${connection.db ? connection.db.databaseName : 'disaster-management'}`, 'blue');
      
      return connection;
    } catch (error) {
      log('❌ Failed to connect to MongoDB Atlas', 'red');
      log(`Error: ${error.message}`, 'red');
      
      if (error.message.includes('Authentication failed')) {
        log('\n💡 Authentication Error Solutions:', 'yellow');
        log('   1. Check your username and password in the connection string', 'yellow');
        log('   2. Ensure the user has proper database permissions', 'yellow');
        log('   3. Verify the user exists in MongoDB Atlas', 'yellow');
      } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
        log('\n💡 IP Whitelist Error Solutions:', 'yellow');
        log('   1. Add your current IP address to MongoDB Atlas whitelist', 'yellow');
        log('   2. Or add 0.0.0.0/0 to allow all IPs (not recommended for production)', 'yellow');
        log('   3. Check your network/firewall settings', 'yellow');
      }
      
      throw error;
    }
  }

  // Create indexes for all collections
  async createIndexes() {
    try {
      log('\n📚 Creating database indexes...', 'cyan');
      
      const models = [Department, Inventory, User, Transaction, Weather];

      for (const Model of models) {
        try {
          await Model.createIndexes();
          log(`   ✅ Created indexes for ${Model.modelName}`, 'green');
        } catch (error) {
          log(`   ❌ Failed to create indexes for ${Model.modelName}: ${error.message}`, 'red');
          this.migrationReport.errors.push({
            operation: 'createIndexes',
            collection: Model.modelName,
            error: error.message
          });
        }
      }
      
      log('📚 Index creation completed!', 'green');
    } catch (error) {
      log('❌ Error creating indexes', 'red');
      throw error;
    }
  }

  // Seed sample departments data
  async seedDepartments() {
    try {
      log('\n🌱 Seeding departments data...', 'cyan');
      
      // Check if departments already exist
      const existingCount = await Department.countDocuments();
      if (existingCount > 0) {
        log(`   ℹ️  Found ${existingCount} existing departments. Skipping seeding.`, 'yellow');
        return;
      }

      // Sample departments data (simplified)
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
      
      const createdDepartments = await Department.insertMany(sampleDepartments);
      log(`   ✅ Created ${createdDepartments.length} departments`, 'green');
      
      this.migrationReport.collections.departments = {
        migrated: createdDepartments.length,
        errors: 0
      };
      
      // Display sample departments
      log('\n📋 Departments created:', 'blue');
      createdDepartments.forEach(dept => {
        log(`   • ${dept.name} (${dept.code}) - ${dept.type}`, 'blue');
      });
      
    } catch (error) {
      log('❌ Error seeding departments', 'red');
      log(`Error: ${error.message}`, 'red');
      this.migrationReport.errors.push({
        operation: 'seedDepartments',
        error: error.message
      });
    }
  }

  // Create sample inventory data
  async createSampleInventory() {
    try {
      log('\n📦 Creating sample inventory data...', 'cyan');
      
      // Check if inventory already exists
      const existingCount = await Inventory.countDocuments();
      if (existingCount > 0) {
        log(`   ℹ️  Found ${existingCount} existing inventory items. Skipping creation.`, 'yellow');
        return;
      }

      // Get some departments for reference
      const departments = await Department.find().limit(3);
      if (departments.length === 0) {
        log('   ⚠️  No departments found. Cannot create inventory items.', 'yellow');
        return;
      }

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
      log(`   ✅ Created ${createdItems.length} sample inventory items`, 'green');
      
      this.migrationReport.collections.inventory = {
        migrated: createdItems.length,
        errors: 0
      };
      
      log('\n📦 Inventory items created:', 'blue');
      createdItems.forEach(item => {
        log(`   • ${item.itemName} (${item.itemCode}) - Qty: ${item.quantity.current}`, 'blue');
      });
      
    } catch (error) {
      log('❌ Error creating sample inventory', 'red');
      log(`Error: ${error.message}`, 'red');
      this.migrationReport.errors.push({
        operation: 'createSampleInventory',
        error: error.message
      });
    }
  }

  // Verify migration
  async verifyMigration() {
    try {
      log('\n🔍 Verifying migration...', 'cyan');
      
      const collections = ['departments', 'inventories', 'users', 'transactions', 'weathers'];
      const verification = {};
      
      for (const collectionName of collections) {
        try {
          const count = await mongoose.connection.db.collection(collectionName).countDocuments();
          verification[collectionName] = count;
          log(`   📊 ${collectionName}: ${count} documents`, 'blue');
        } catch (error) {
          verification[collectionName] = 'Error';
          log(`   ❌ ${collectionName}: Error counting documents`, 'red');
        }
      }
      
      // Test basic operations
      log('\n🧪 Testing basic operations...', 'cyan');
      
      const activeDepartments = await Department.find({ isActive: true }).limit(1);
      
      if (activeDepartments.length > 0) {
        log('   ✅ Successfully queried departments', 'green');
        log(`   📋 Sample: ${activeDepartments[0].name}`, 'blue');
      } else {
        log('   ⚠️  No active departments found', 'yellow');
      }
      
      return verification;
      
    } catch (error) {
      log('❌ Error during verification', 'red');
      log(`Error: ${error.message}`, 'red');
      throw error;
    }
  }

  // Generate migration report
  async generateReport() {
    this.migrationReport.endTime = new Date();
    const duration = (this.migrationReport.endTime - this.migrationReport.startTime) / 1000;
    
    log('\n📊 Migration Report', 'magenta');
    log('='.repeat(50), 'magenta');
    log(`Start Time: ${this.migrationReport.startTime.toISOString()}`, 'blue');
    log(`End Time: ${this.migrationReport.endTime.toISOString()}`, 'blue');
    log(`Duration: ${duration} seconds`, 'blue');
    log(`Success: ${this.migrationReport.errors.length === 0 ? 'Yes' : 'No'}`, 
         this.migrationReport.errors.length === 0 ? 'green' : 'red');
    
    log('\nCollections Migrated:', 'cyan');
    Object.entries(this.migrationReport.collections).forEach(([name, info]) => {
      log(`   ${name}: ${info.migrated} records`, 'blue');
    });
    
    if (this.migrationReport.errors.length > 0) {
      log('\nErrors:', 'red');
      this.migrationReport.errors.forEach((error, index) => {
        log(`   ${index + 1}. ${error.operation}: ${error.error}`, 'red');
      });
    }
    
    // Save report to file
    try {
      const reportPath = path.join(__dirname, 'migration-report.json');
      await fs.writeFile(reportPath, JSON.stringify(this.migrationReport, null, 2));
      log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
    } catch (error) {
      log('⚠️  Could not save report file', 'yellow');
    }
    
    log('='.repeat(50), 'magenta');
  }

  // Run complete migration
  async runMigration() {
    try {
      log('🚀 Starting MongoDB Atlas Migration (Fixed Version)', 'magenta');
      log('='.repeat(60), 'magenta');
      
      // Step 1: Connect to Atlas
      await this.connectToAtlas();
      
      // Step 2: Create indexes
      await this.createIndexes();
      
      // Step 3: Seed departments
      await this.seedDepartments();
      
      // Step 4: Create sample inventory
      await this.createSampleInventory();
      
      // Step 5: Verify migration
      await this.verifyMigration();
      
      this.migrationReport.success = true;
      log('\n🎉 Migration completed successfully!', 'green');
      log('\n💡 Next Steps:', 'cyan');
      log('   1. Your database is now set up in MongoDB Atlas', 'blue');
      log('   2. Start your backend server: npm start', 'blue');
      log('   3. Your app will automatically connect to Atlas', 'blue');
      
    } catch (error) {
      this.migrationReport.success = false;
      this.migrationReport.errors.push({
        operation: 'general',
        error: error.message
      });
      
      log('\n💥 Migration failed!', 'red');
      log(`Error: ${error.message}`, 'red');
      
    } finally {
      // Generate report
      await this.generateReport();
      
      // Close connection
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        log('\n📦 Database connection closed', 'blue');
      }
      
      log('\n✨ Migration process completed!', 'magenta');
      process.exit(this.migrationReport.success ? 0 : 1);
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const migration = new SimpleMigration();
  migration.runMigration().catch(error => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = SimpleMigration;
