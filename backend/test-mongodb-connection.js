const mongoose = require('mongoose');

// Your MongoDB connection string
const MONGODB_URL = 'mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/disaster-management?retryWrites=true&w=majority';

const testConnection = async () => {
  try {
    console.log('🔗 Testing MongoDB Connection');
    console.log('============================\n');
    
    console.log('📍 Connection URL:', MONGODB_URL);
    console.log('⏳ Attempting to connect...\n');
    
    // Configure mongoose options
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    };
    
    // Connect to MongoDB
    const connection = await mongoose.connect(MONGODB_URL, options);
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📍 Database Host: ${connection.connection.host}`);
    console.log(`📍 Database Name: ${connection.connection.db.databaseName}`);
    console.log(`📍 Connection State: ${connection.connection.readyState} (1=connected)`);
    console.log(`📍 MongoDB Version: ${await getMongoVersion()}`);
    
    // Test basic operations
    console.log('\n🔍 Testing Database Operations:');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Available Collections (${collections.length}):`);
    collections.forEach(collection => {
      console.log(`   • ${collection.name}`);
    });
    
    // Test if we can create a simple test document
    const testCollection = mongoose.connection.db.collection('connection_test');
    
    // Insert a test document
    const testDoc = {
      timestamp: new Date(),
      message: 'Connection test successful',
      version: '1.0'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`\n✅ Test Document Created: ${insertResult.insertedId}`);
    
    // Read the test document back
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`✅ Test Document Retrieved: ${foundDoc.message}`);
    
    // Clean up - delete the test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log(`🗑️  Test Document Cleaned Up`);
    
    // Test Department model if it exists
    try {
      const Department = require('./src/models/Department');
      const deptCount = await Department.countDocuments();
      console.log(`\n📊 Existing Departments in Database: ${deptCount}`);
      
      if (deptCount > 0) {
        const sampleDepts = await Department.find().limit(3).select('name code type isActive');
        console.log('📋 Sample Departments:');
        sampleDepts.forEach(dept => {
          console.log(`   • ${dept.name} (${dept.code}) - ${dept.type} - Active: ${dept.isActive}`);
        });
      }
    } catch (modelError) {
      console.log('ℹ️  Department model not found or error:', modelError.message);
    }
    
    console.log('\n🎉 All tests passed! MongoDB connection is working perfectly.');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('Error Details:', error.message);
    
    if (error.code) {
      console.error(`Error Code: ${error.code}`);
    }
    
    // Common error messages and solutions
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Authentication Error Solutions:');
      console.error('   1. Check your username and password');
      console.error('   2. Ensure the user has proper database permissions');
      console.error('   3. Check if IP address is whitelisted in MongoDB Atlas');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Network Error Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify the MongoDB cluster URL');
      console.error('   3. Check firewall settings');
    } else if (error.message.includes('ServerSelectionTimeoutError')) {
      console.error('\n💡 Timeout Error Solutions:');
      console.error('   1. Check if MongoDB Atlas cluster is running');
      console.error('   2. Verify network connectivity');
      console.error('   3. Check if your IP is whitelisted');
    }
    
    process.exit(1);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n📦 Database connection closed');
    }
  }
};

// Helper function to get MongoDB version
async function getMongoVersion() {
  try {
    const admin = mongoose.connection.db.admin();
    const info = await admin.serverStatus();
    return info.version;
  } catch (error) {
    return 'Unknown';
  }
}

// Add connection event listeners for debugging
mongoose.connection.on('connecting', () => {
  console.log('🔄 Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
  console.log('🔗 Connected to MongoDB');
});

mongoose.connection.on('disconnecting', () => {
  console.log('🔌 Disconnecting from MongoDB...');
});

mongoose.connection.on('disconnected', () => {
  console.log('❌ Disconnected from MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('💥 MongoDB connection error:', error.message);
});

// Run the test
if (require.main === module) {
  testConnection().catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
}

module.exports = { testConnection };
