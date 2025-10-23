const mongoose = require('mongoose');
const Department = require('./src/models/Department');
require('dotenv').config();

async function checkDepartments() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Check all collections first
    console.log('\n📋 Checking all collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    console.log('\n📋 Checking departments in database...');
    const departments = await Department.find({}).select('name code description _id type');
    
    if (departments.length === 0) {
      console.log('❌ No departments found in database');
      console.log('💡 You need to run the department seeding script first');
      
      // Try to check raw collection
      const rawDepts = await mongoose.connection.db.collection('departments').find({}).toArray();
      console.log('Raw departments collection count:', rawDepts.length);
      if (rawDepts.length > 0) {
        console.log('Sample raw department:', rawDepts[0]);
      }
    } else {
      console.log(`✅ Found ${departments.length} departments:`);
      console.log('\n📄 Department List:');
      departments.forEach((dept, index) => {
        console.log(`${index + 1}. Name: ${dept.name}`);
        console.log(`   Code: ${dept.code}`);
        console.log(`   Type: ${dept.type}`);
        console.log(`   ID: ${dept._id}`);
        console.log(`   Description: ${dept.description}`);
        console.log('   ---');
      });
    }

    await mongoose.connection.close();
    console.log('🔐 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDepartments();