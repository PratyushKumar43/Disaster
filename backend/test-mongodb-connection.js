const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDBConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URL?.replace(/:[^:@]*@/, ':***@'));
    
    const conn = await mongoose.connect(
      process.env.MONGODB_URL || 'mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/disaster-management?retryWrites=true&w=majority&appName=Cluster0'
    );
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📍 Host:', conn.connection.host);
    console.log('🗄️  Database:', conn.connection.name);
    console.log('🔗 Connection State:', conn.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available Collections:', collections.map(c => c.name));
    
    // Close connection
    await mongoose.connection.close();
    console.log('🔐 Connection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    if (error.codeName) {
      console.error('Error Code Name:', error.codeName);
    }
  }
}

testMongoDBConnection();