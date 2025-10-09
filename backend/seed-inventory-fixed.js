const mongoose = require('mongoose');
const Inventory = require('./src/models/Inventory');
const Department = require('./src/models/Department');
require('dotenv').config();

async function seedInventoryWithDepartmentIds() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // First, get all departments
    console.log('📋 Fetching departments...');
    const departments = await Department.find({}).select('name code _id type');
    
    if (departments.length === 0) {
      console.log('❌ No departments found. Please run seed-and-check-departments.js first');
      return;
    }

    console.log(`✅ Found ${departments.length} departments:`);
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.code}) - ID: ${dept._id}`);
    });

    // Create department mapping
    const deptMap = {};
    departments.forEach(dept => {
      deptMap[dept.code] = dept._id;
    });

    // Clear existing inventory
    console.log('\n🗑️ Clearing existing inventory...');
    await Inventory.deleteMany({});

    // Sample inventory data with correct structure
    const inventoryData = [
      {
        itemName: 'First Aid Kit (Complete)',
        itemCode: 'MED001',
        category: 'medical',
        description: 'Complete first aid kit with bandages, antiseptics, and emergency medications',
        quantity: {
          current: 50,
          minimum: 10,
          maximum: 100
        },
        unit: 'pieces',
        cost: {
          unitPrice: 2500,
          totalValue: 125000,
          currency: 'INR'
        },
        location: {
          department: deptMap['FIRE001'], // Use ObjectId
          warehouse: 'Central Warehouse A',
          section: 'Medical Supplies',
          rack: 'A1',
          shelf: 'S01'
        },
        supplier: {
          name: 'MedSupply India',
          contact: '+911234567890',
          email: 'sales@medsupply.in'
        },
        status: 'available',
        specifications: {
          weight: '2kg',
          size: '30x20x15cm',
          material: 'Waterproof fabric',
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      },
      {
        itemName: 'Oxygen Cylinder (Portable)',
        itemCode: 'MED002',
        category: 'medical',
        description: 'Portable oxygen cylinder for emergency medical response',
        quantity: {
          current: 25,
          minimum: 5,
          maximum: 50
        },
        unit: 'pieces',
        cost: {
          unitPrice: 8000,
          totalValue: 200000,
          currency: 'INR'
        },
        location: {
          department: deptMap['MED001'], // Use ObjectId
          warehouse: 'Medical Storage',
          section: 'Oxygen Equipment',
          rack: 'B2',
          shelf: 'S05'
        },
        supplier: {
          name: 'OxyTech Solutions',
          contact: '+919876543210',
          email: 'orders@oxytech.in'
        },
        status: 'available',
        specifications: {
          weight: '5kg',
          size: '40x15x15cm',
          material: 'Steel'
        }
      },
      {
        itemName: 'Rescue Rope (Dynamic)',
        itemCode: 'RES001',
        category: 'rescue_equipment',
        description: 'High-strength dynamic rope for rescue operations',
        quantity: {
          current: 15,
          minimum: 3,
          maximum: 30
        },
        unit: 'pieces',
        cost: {
          unitPrice: 12000,
          totalValue: 180000,
          currency: 'INR'
        },
        location: {
          department: deptMap['RESCUE01'], // Use ObjectId
          warehouse: 'Equipment Storage',
          section: 'Rescue Equipment',
          rack: 'C1',
          shelf: 'S10'
        },
        supplier: {
          name: 'SafetyGear Pro',
          contact: '+918765432109',
          email: 'info@safetygear.in'
        },
        status: 'available',
        specifications: {
          material: 'Nylon',
          size: '50m x 11mm'
        }
      },
      {
        itemName: 'Emergency Food Rations',
        itemCode: 'FOOD001',
        category: 'food_supplies',
        description: 'High-energy emergency food rations for disaster relief',
        quantity: {
          current: 500,
          minimum: 100,
          maximum: 1000
        },
        unit: 'packets',
        cost: {
          unitPrice: 150,
          totalValue: 75000,
          currency: 'INR'
        },
        location: {
          department: deptMap['POLICE01'], // Use ObjectId
          warehouse: 'Food Storage',
          section: 'Emergency Supplies',
          rack: 'F1',
          shelf: 'S01'
        },
        supplier: {
          name: 'NutriEmergency Foods',
          contact: '+916543210987',
          email: 'bulk@nutriemergency.in'
        },
        status: 'available',
        specifications: {
          weight: '500g',
          expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)
        }
      }
    ];

    // Insert inventory items
    console.log('\n🌱 Creating inventory items...');
    const createdItems = [];
    
    for (const itemData of inventoryData) {
      try {
        const item = new Inventory(itemData);
        const saved = await item.save();
        createdItems.push(saved);
        console.log(`✅ Created: ${saved.itemName} (${saved.itemCode})`);
      } catch (error) {
        console.error(`❌ Failed to create ${itemData.itemName}:`, error.message);
        if (error.errors) {
          Object.keys(error.errors).forEach(key => {
            console.error(`   - ${key}: ${error.errors[key].message}`);
          });
        }
      }
    }

    // Verify inventory was saved
    console.log('\n📋 Verifying inventory in database...');
    const allItems = await Inventory.find({}).populate('location.department', 'name code').select('itemName itemCode category quantity location.department');
    console.log(`✅ Total inventory items in database: ${allItems.length}`);
    
    if (allItems.length > 0) {
      console.log('\n📄 Inventory Items:');
      allItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.itemName} (${item.itemCode})`);
        console.log(`   Category: ${item.category}`);
        console.log(`   Current Stock: ${item.quantity.current}`);
        console.log(`   Department: ${item.location.department?.name || 'Unknown'} (${item.location.department?.code || 'N/A'})`);
        console.log('   ---');
      });
    }

    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
    console.log('✨ Inventory seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedInventoryWithDepartmentIds();