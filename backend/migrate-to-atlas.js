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

// Local MongoDB connection (if you have existing data)
const LOCAL_URL = 'mongodb://localhost:27017/disaster-management';

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

class DatabaseMigration {
  constructor() {
    this.localConnection = null;
    this.atlasConnection = null;
    this.migrationReport = {
      startTime: new Date(),
      endTime: null,
      collections: {},
      errors: [],
      success: false
    };
  }

  // Connect to MongoDB Atlas
  async connectToAtlas() {
    try {
      log('🔗 Connecting to MongoDB Atlas...', 'cyan');
      
      const options = {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        w: 'majority'
      };
      
      this.atlasConnection = await mongoose.createConnection(ATLAS_URL, options);
      
      log('✅ Connected to MongoDB Atlas successfully!', 'green');
      log(`📍 Database: ${this.atlasConnection.name}`, 'blue');
      log(`📍 Host: ${this.atlasConnection.host}`, 'blue');
      
      return this.atlasConnection;
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

  // Connect to local MongoDB (optional, for data migration)
  async connectToLocal() {
    try {
      log('🔗 Attempting to connect to local MongoDB...', 'cyan');
      
      const options = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      };
      
      this.localConnection = await mongoose.createConnection(LOCAL_URL, options);
      log('✅ Connected to local MongoDB successfully!', 'green');
      return this.localConnection;
    } catch (error) {
      log('⚠️  Could not connect to local MongoDB (this is optional)', 'yellow');
      log(`Reason: ${error.message}`, 'yellow');
      return null;
    }
  }

  // Create indexes for all collections
  async createIndexes() {
    try {
      log('\n📚 Creating database indexes...', 'cyan');
      
      const collections = [
        { name: 'departments', model: Department },
        { name: 'inventories', model: Inventory },
        { name: 'users', model: User },
        { name: 'transactions', model: Transaction },
        { name: 'weathers', model: Weather }
      ];

      for (const collection of collections) {
        try {
          const Model = this.atlasConnection.model(collection.model.modelName, collection.model.schema);
          await Model.createIndexes();
          log(`   ✅ Created indexes for ${collection.name}`, 'green');
        } catch (error) {
          log(`   ❌ Failed to create indexes for ${collection.name}: ${error.message}`, 'red');
          this.migrationReport.errors.push({
            operation: 'createIndexes',
            collection: collection.name,
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
      
      const AtlasDepartment = this.atlasConnection.model('Department', Department.schema);
      
      // Check if departments already exist
      const existingCount = await AtlasDepartment.countDocuments();
      if (existingCount > 0) {
        log(`   ℹ️  Found ${existingCount} existing departments. Skipping seeding.`, 'yellow');
        return;
      }

      // Import sample departments from seed file
      const { sampleDepartments } = require('./seed-departments');
      
      const createdDepartments = await AtlasDepartment.insertMany(sampleDepartments);
      log(`   ✅ Created ${createdDepartments.length} departments`, 'green');
      
      this.migrationReport.collections.departments = {
        migrated: createdDepartments.length,
        errors: 0
      };
      
      // Display sample departments
      log('\n📋 Sample departments created:', 'blue');
      createdDepartments.slice(0, 5).forEach(dept => {
        log(`   • ${dept.name} (${dept.code}) - ${dept.type}`, 'blue');
      });
      
      if (createdDepartments.length > 5) {
        log(`   ... and ${createdDepartments.length - 5} more`, 'blue');
      }
      
    } catch (error) {
      log('❌ Error seeding departments', 'red');
      log(`Error: ${error.message}`, 'red');
      this.migrationReport.errors.push({
        operation: 'seedDepartments',
        error: error.message
      });
    }
  }

  // Migrate data from local to Atlas (if local connection exists)
  async migrateExistingData() {
    if (!this.localConnection) {
      log('\n⚠️  No local connection available. Skipping data migration.', 'yellow');
      return;
    }

    try {
      log('\n🚛 Migrating existing data from local to Atlas...', 'cyan');
      
      const collections = [
        { name: 'departments', model: Department },
        { name: 'inventories', model: Inventory },
        { name: 'users', model: User },
        { name: 'transactions', model: Transaction },
        { name: 'weathers', model: Weather }
      ];

      for (const collection of collections) {
        try {
          const LocalModel = this.localConnection.model(collection.model.modelName, collection.model.schema);
          const AtlasModel = this.atlasConnection.model(collection.model.modelName, collection.model.schema);
          
          const localData = await LocalModel.find({});
          
          if (localData.length === 0) {
            log(`   ℹ️  No data found in local ${collection.name}`, 'yellow');
            continue;
          }
          
          // Clear existing data in Atlas collection
          await AtlasModel.deleteMany({});
          
          // Insert data in batches
          const batchSize = 100;
          let migrated = 0;
          
          for (let i = 0; i < localData.length; i += batchSize) {
            const batch = localData.slice(i, i + batchSize);
            await AtlasModel.insertMany(batch, { ordered: false });
            migrated += batch.length;
          }
          
          log(`   ✅ Migrated ${migrated} records from ${collection.name}`, 'green');
          
          this.migrationReport.collections[collection.name] = {
            migrated: migrated,
            errors: 0
          };
          
        } catch (error) {
          log(`   ❌ Failed to migrate ${collection.name}: ${error.message}`, 'red');
          this.migrationReport.errors.push({
            operation: 'migrateData',
            collection: collection.name,
            error: error.message
          });
        }
      }
      
    } catch (error) {
      log('❌ Error during data migration', 'red');
      throw error;
    }
  }

  // Create sample inventory data
  async createSampleInventory() {
    try {
      log('\n📦 Creating sample inventory data...', 'cyan');
      
      const AtlasInventory = this.atlasConnection.model('Inventory', Inventory.schema);
      const AtlasDepartment = this.atlasConnection.model('Department', Department.schema);
      
      // Check if inventory already exists
      const existingCount = await AtlasInventory.countDocuments();
      if (existingCount > 0) {
        log(`   ℹ️  Found ${existingCount} existing inventory items. Skipping creation.`, 'yellow');
        return;
      }

      // Get some departments for reference
      const departments = await AtlasDepartment.find().limit(5);
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
            section: 'A1',
            rack: 'R001',
            shelf: 'S01'
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

      const createdItems = await AtlasInventory.insertMany(sampleInventory);
      log(`   ✅ Created ${createdItems.length} sample inventory items`, 'green');
      
      this.migrationReport.collections.inventory = {
        migrated: createdItems.length,
        errors: 0
      };
      
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
          const count = await this.atlasConnection.db.collection(collectionName).countDocuments();
          verification[collectionName] = count;
          log(`   📊 ${collectionName}: ${count} documents`, 'blue');
        } catch (error) {
          verification[collectionName] = 'Error';
          log(`   ❌ ${collectionName}: ${error.message}`, 'red');
        }
      }
      
      // Test basic operations
      log('\n🧪 Testing basic operations...', 'cyan');
      
      const AtlasDepartment = this.atlasConnection.model('Department', Department.schema);
      const activeDepartments = await AtlasDepartment.find({ isActive: true }).limit(1);
      
      if (activeDepartments.length > 0) {
        log('   ✅ Successfully queried departments', 'green');
      } else {
        log('   ⚠️  No active departments found', 'yellow');
      }
      
      return verification;
      
    } catch (error) {
      log('❌ Error during verification', 'red');
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
      log('🚀 Starting MongoDB Atlas Migration', 'magenta');
      log('='.repeat(50), 'magenta');
      
      // Step 1: Connect to Atlas
      await this.connectToAtlas();
      
      // Step 2: Try to connect to local (optional)
      await this.connectToLocal();
      
      // Step 3: Create indexes
      await this.createIndexes();
      
      // Step 4: Migrate existing data (if local connection exists)
      await this.migrateExistingData();
      
      // Step 5: Seed departments if no data migrated
      await this.seedDepartments();
      
      // Step 6: Create sample inventory
      await this.createSampleInventory();
      
      // Step 7: Verify migration
      await this.verifyMigration();
      
      this.migrationReport.success = true;
      log('\n🎉 Migration completed successfully!', 'green');
      
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
      
      // Close connections
      if (this.localConnection) {
        await this.localConnection.close();
        log('\n📦 Local database connection closed', 'blue');
      }
      
      if (this.atlasConnection) {
        await this.atlasConnection.close();
        log('📦 Atlas database connection closed', 'blue');
      }
      
      log('\n✨ Migration process completed!', 'magenta');
      process.exit(this.migrationReport.success ? 0 : 1);
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  const migration = new DatabaseMigration();
  migration.runMigration().catch(error => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = DatabaseMigration;
