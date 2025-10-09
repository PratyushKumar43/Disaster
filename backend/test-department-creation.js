const mongoose = require('mongoose');
const Department = require('./src/models/Department');
require('dotenv').config();

async function testDepartmentCreation() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('Using connection string:', process.env.MONGODB_URL?.replace(/:[^:@]*@/, ':***@'));
    
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Try to create a simple department
    console.log('\n🔨 Creating test department...');
    const testDept = new Department({
      name: 'Test Fire Department',
      code: 'TEST001',
      type: 'fire',
      description: 'Test department for validation',
      state: 'Delhi',
      district: 'New Delhi',
      city: 'Delhi',
      pincode: '110001',
      isActive: true
    });

    const savedDept = await testDept.save();
    console.log('✅ Test department created successfully!');
    console.log('Department ID:', savedDept._id);
    console.log('Department Name:', savedDept.name);
    console.log('Department Code:', savedDept.code);

    // Now check all departments
    const allDepts = await Department.find({});
    console.log(`\n📋 Total departments in database: ${allDepts.length}`);
    
    allDepts.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (${dept.code}) - ID: ${dept._id}`);
    });

    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    if (error.errors) {
      console.error('Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`- ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
}

testDepartmentCreation();