const mongoose = require('mongoose');
const Department = require('./src/models/Department');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URL || 'mongodb://localhost:27017/disaster-management';
    console.log('🔗 Connecting to:', mongoURI);
    await mongoose.connect(mongoURI);
    console.log('📦 MongoDB Connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check database contents
const checkDatabase = async () => {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Count all departments
    const totalDepartments = await Department.countDocuments();
    console.log(`📊 Total departments in database: ${totalDepartments}`);
    
    if (totalDepartments > 0) {
      // Get first few departments
      const departments = await Department.find().limit(5).select('name code type isActive');
      console.log('\n📋 Sample departments:');
      departments.forEach(dept => {
        console.log(`   • ${dept.name} (${dept.code}) - Type: ${dept.type}, Active: ${dept.isActive}`);
      });
      
      // Count active departments
      const activeDepartments = await Department.countDocuments({ isActive: true });
      console.log(`\n✅ Active departments: ${activeDepartments}`);
      
      // Count by type
      const typeAggregation = await Department.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('\n📈 Departments by type:');
      typeAggregation.forEach(item => {
        console.log(`   • ${item._id}: ${item.count}`);
      });
    } else {
      console.log('❌ No departments found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
  }
};

// Run the check
const runCheck = async () => {
  console.log('🔍 Database Content Checker');
  console.log('===========================\n');
  
  await connectDB();
  await checkDatabase();
  
  console.log('\n===========================');
  console.log('✅ Check completed!');
  process.exit(0);
};

// Execute if running directly
if (require.main === module) {
  runCheck().catch(error => {
    console.error('💥 Check script failed:', error);
    process.exit(1);
  });
}

module.exports = { checkDatabase };
