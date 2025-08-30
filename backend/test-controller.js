const mongoose = require('mongoose');
const Department = require('./src/models/Department');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/disaster-management');
    console.log('📦 MongoDB Connected for testing...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test the department query
const testDepartmentQuery = async () => {
  try {
    console.log('🧪 Testing Department Controller Logic');
    console.log('=====================================\n');

    // Test 1: Direct model query (what we know works)
    console.log('1️⃣ Direct Model Query:');
    const directResult = await Department.find({});
    console.log(`   Found ${directResult.length} departments directly\n`);

    // Test 2: Pagination query (what the controller uses)
    console.log('2️⃣ Pagination Query (Controller Logic):');
    const filter = {};
    const options = {
      page: 1,
      limit: 20,
      sort: { name: 1 },
      populate: [
        {
          path: 'parentDepartment',
          select: 'name code type'
        }
      ]
    };

    console.log('   Filter:', JSON.stringify(filter));
    console.log('   Options:', JSON.stringify(options, null, 2));
    
    const paginationResult = await Department.paginate(filter, options);
    console.log(`   Paginated docs: ${paginationResult.docs.length}`);
    console.log(`   Total docs: ${paginationResult.totalDocs}`);
    console.log(`   Total pages: ${paginationResult.totalPages}\n`);

    if (paginationResult.docs.length > 0) {
      console.log('   Sample docs:');
      paginationResult.docs.slice(0, 3).forEach(dept => {
        console.log(`      • ${dept.name} (${dept.code}) - ${dept.type}`);
      });
    } else {
      console.log('   ❌ No docs returned by pagination!');
    }
    console.log();

    // Test 3: Check if populate is causing issues
    console.log('3️⃣ Pagination without populate:');
    const optionsNoPopulate = {
      page: 1,
      limit: 20,
      sort: { name: 1 }
    };
    
    const resultNoPopulate = await Department.paginate(filter, optionsNoPopulate);
    console.log(`   Docs without populate: ${resultNoPopulate.docs.length}`);
    console.log(`   Total without populate: ${resultNoPopulate.totalDocs}\n`);

    // Test 4: Check if isActive filter works
    console.log('4️⃣ Testing isActive filter:');
    const activeFilter = { isActive: true };
    const activeResult = await Department.paginate(activeFilter, optionsNoPopulate);
    console.log(`   Active departments: ${activeResult.docs.length}`);
    console.log(`   Active total: ${activeResult.totalDocs}\n`);

    // Test 5: Check raw query structure
    console.log('5️⃣ Check document structure:');
    const sampleDoc = await Department.findOne({});
    if (sampleDoc) {
      console.log('   Sample document fields:');
      console.log(`      _id: ${sampleDoc._id}`);
      console.log(`      name: ${sampleDoc.name}`);
      console.log(`      code: ${sampleDoc.code}`);
      console.log(`      type: ${sampleDoc.type}`);
      console.log(`      isActive: ${sampleDoc.isActive}`);
      console.log(`      parentDepartment: ${sampleDoc.parentDepartment}`);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

// Run test
connectDB().then(() => {
  testDepartmentQuery().then(() => {
    console.log('\n=====================================');
    console.log('✅ Test completed!');
    process.exit(0);
  });
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});







