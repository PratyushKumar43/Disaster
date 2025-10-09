const mongoose = require('mongoose');
const Department = require('./src/models/Department');
require('dotenv').config();

// Sample departments data with all required fields
const departments = [
  {
    name: 'Fire Department',
    code: 'FIRE001',
    type: 'fire',
    description: 'Emergency fire response and rescue operations',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400001',
    isActive: true
  },
  {
    name: 'Police Department',
    code: 'POLICE01',
    type: 'police',
    description: 'Law enforcement and emergency response',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400002',
    isActive: true
  },
  {
    name: 'Medical Emergency',
    code: 'MED001',
    type: 'medical',
    description: 'Medical emergency services',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400003',
    isActive: true
  },
  {
    name: 'Rescue Operations',
    code: 'RESCUE01',
    type: 'rescue',
    description: 'Emergency rescue operations',
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400004',
    isActive: true
  }
];

async function seedAndCheckDepartments() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Clear existing departments
    console.log('🗑️ Clearing existing departments...');
    await Department.deleteMany({});

    // Create departments one by one to catch any errors
    console.log('🌱 Creating departments...');
    const createdDepartments = [];
    
    for (const deptData of departments) {
      try {
        const dept = new Department(deptData);
        const saved = await dept.save();
        createdDepartments.push(saved);
        console.log(`✅ Created: ${saved.name} (${saved.code}) - ID: ${saved._id}`);
      } catch (error) {
        console.error(`❌ Failed to create ${deptData.name}:`, error.message);
      }
    }

    // Verify departments were saved
    console.log('\n📋 Verifying departments in database...');
    const allDepts = await Department.find({}).select('name code _id type');
    console.log(`✅ Total departments in database: ${allDepts.length}`);
    
    if (allDepts.length > 0) {
      console.log('\n📄 Department List with ObjectIds:');
      allDepts.forEach((dept, index) => {
        console.log(`${index + 1}. Name: ${dept.name}`);
        console.log(`   Code: ${dept.code}`);
        console.log(`   Type: ${dept.type}`);
        console.log(`   ObjectId: ${dept._id}`);
        console.log('   ---');
      });
    }

    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedAndCheckDepartments();