const mongoose = require('mongoose');

// Your MongoDB Atlas connection string
const MONGODB_URL = 'mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/disaster-management?retryWrites=true&w=majority';

async function testConnection() {
  console.log('🔗 Testing MongoDB Atlas Connection...');
  console.log('=====================================\n');
  
  try {
    // Simple connection test
    console.log('⏳ Connecting...');
    await mongoose.connect(MONGODB_URL);
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📍 Connection State: ${mongoose.connection.readyState} (1=connected)`);
    
    // Test database operations
    console.log('\n🧪 Testing basic operations...');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   • ${col.name}`));
    
    // Test a simple write operation
    const testCollection = mongoose.connection.db.collection('connection_test');
    const testDoc = {
      timestamp: new Date(),
      message: 'Connection test successful',
      version: '1.0'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log(`\n✅ Test write successful: ${result.insertedId}`);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🗑️  Test document cleaned up');
    
    console.log('\n🎉 All tests passed! Your MongoDB Atlas connection is working perfectly.');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    
    // Provide specific help based on error type
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Authentication Error Solutions:');
      console.error('   1. Check your username and password in the connection string');
      console.error('   2. Make sure the user exists in MongoDB Atlas');
      console.error('   3. Verify the user has read/write permissions');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('\n💡 IP Whitelist Error Solutions:');
      console.error('   1. Go to MongoDB Atlas Dashboard');
      console.error('   2. Navigate to Network Access');
      console.error('   3. Add your current IP address to the whitelist');
      console.error('   4. Or add 0.0.0.0/0 to allow all IPs (for testing only)');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Network Error Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify the cluster URL is correct');
      console.error('   3. Check firewall settings');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
}

// Run the test
testConnection();
