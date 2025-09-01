const mongoose = require('mongoose');
const { connectDB, logger } = require('./src/config/database');
const Department = require('./src/models/Department');

// Debug MongoDB connection
const debugConnection = async () => {
  try {
    console.log('🔍 Debugging Database Connection');
    console.log('=================================\n');
    
    // Connect using the same method as the server
    await connectDB();
    
    console.log('📍 Connection Details:');
    console.log(`   Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    console.log(`   Ready State: ${mongoose.connection.readyState} (1=connected)\n`);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available Collections:');
    collections.forEach(collection => {
      console.log(`   • ${collection.name}`);
    });
    console.log();
    
    // Count departments in this database
    const departmentCount = await Department.countDocuments();
    console.log(`📊 Departments in this database: ${departmentCount}`);
    
    if (departmentCount > 0) {
      const sampleDepts = await Department.find().limit(3).select('name code type');
      console.log('📋 Sample departments:');
      sampleDepts.forEach(dept => {
        console.log(`   • ${dept.name} (${dept.code}) - ${dept.type}`);
      });
    }
    
    // Check what filters might be affecting the query
    console.log('\n🔍 Testing Department Queries:');
    
    const allDepts = await Department.find({});
    console.log(`   All departments (no filter): ${allDepts.length}`);
    
    const activeDepts = await Department.find({ isActive: true });
    console.log(`   Active departments: ${activeDepts.length}`);
    
    const activeDepts2 = await Department.find({ isActive: 'true' });
    console.log(`   Active departments (string 'true'): ${activeDepts2.length}`);
    
    // Test pagination query
    console.log('\n🔍 Testing Pagination Query:');
    const paginatedResult = await Department.paginate({}, { page: 1, limit: 20 });
    console.log(`   Paginated total: ${paginatedResult.totalDocs}`);
    console.log(`   Paginated docs returned: ${paginatedResult.docs.length}`);
    
    const paginatedActiveResult = await Department.paginate({ isActive: true }, { page: 1, limit: 20 });
    console.log(`   Paginated active total: ${paginatedActiveResult.totalDocs}`);
    console.log(`   Paginated active docs returned: ${paginatedActiveResult.docs.length}`);
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

// Run debug
debugConnection().then(() => {
  console.log('\n=================================');
  console.log('✅ Debug completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Debug failed:', error);
  process.exit(1);
});









