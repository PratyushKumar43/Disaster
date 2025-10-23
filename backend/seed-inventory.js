const mongoose = require('mongoose');
const Inventory = require('./src/models/Inventory');
const Department = require('./src/models/Department');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('📦 MongoDB Connected for seeding inventory...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample inventory data
const sampleInventory = [
  // Medical Supplies
  {
    itemName: 'First Aid Kit (Complete)',
    itemCode: 'MED-001',
    category: 'medical',
    description: 'Complete first aid kit with bandages, antiseptics, and emergency medications',
    currentStock: 50,
    minimumStock: 10,
    maximumStock: 100,
    unitPrice: 2500,
    supplier: {
      name: 'MedSupply India',
      contactNumber: '+911234567890',
      email: 'sales@medsupply.in'
    },
    location: {
      warehouse: 'Central Warehouse A',
      zone: 'Zone-1',
      shelf: 'A-01',
      department: 'FIRE001'
    },
    status: 'active',
    specifications: {
      weight: '2kg',
      dimensions: '30x20x15cm',
      material: 'Waterproof fabric'
    },
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    lastUpdated: new Date()
  },
  {
    itemName: 'Oxygen Cylinder (Portable)',
    itemCode: 'MED-002',
    category: 'medical',
    description: 'Portable oxygen cylinder for emergency medical response',
    currentStock: 25,
    minimumStock: 5,
    maximumStock: 50,
    unitPrice: 8000,
    supplier: {
      name: 'OxyTech Solutions',
      contactNumber: '+919876543210',
      email: 'orders@oxytech.in'
    },
    location: {
      warehouse: 'Central Warehouse A',
      zone: 'Zone-2',
      shelf: 'B-05',
      department: 'FIRE001'
    },
    status: 'active',
    specifications: {
      weight: '5kg',
      dimensions: '40x15x15cm',
      capacity: '5L',
      pressure: '200bar'
    },
    expiryDate: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 years from now
    lastUpdated: new Date()
  },
  
  // Rescue Equipment
  {
    itemName: 'Rescue Rope (Dynamic)',
    itemCode: 'RES-001',
    category: 'rescue_equipment',
    description: 'High-strength dynamic rope for rescue operations',
    currentStock: 15,
    minimumStock: 3,
    maximumStock: 30,
    unitPrice: 12000,
    supplier: {
      name: 'SafetyGear Pro',
      contactNumber: '+918765432109',
      email: 'info@safetygear.in'
    },
    location: {
      warehouse: 'Equipment Storage B',
      zone: 'Zone-1',
      shelf: 'C-10',
      department: 'FIRE001'
    },
    status: 'active',
    specifications: {
      length: '50m',
      diameter: '11mm',
      material: 'Nylon',
      tensileStrength: '2400kg'
    },
    lastUpdated: new Date()
  },
  {
    itemName: 'Hydraulic Rescue Tools',
    itemCode: 'RES-002',
    category: 'rescue_equipment',
    description: 'Hydraulic cutters and spreaders for vehicle rescue',
    currentStock: 8,
    minimumStock: 2,
    maximumStock: 15,
    unitPrice: 150000,
    supplier: {
      name: 'HydroRescue Systems',
      contactNumber: '+917654321098',
      email: 'sales@hydrorescue.in'
    },
    location: {
      warehouse: 'Equipment Storage B',
      zone: 'Zone-3',
      shelf: 'D-01',
      department: 'FIRE001'
    },
    status: 'active',
    specifications: {
      weight: '25kg',
      maxCuttingForce: '80 tons',
      maxSpreadingForce: '50 tons',
      powerSource: 'Hydraulic'
    },
    lastUpdated: new Date()
  },

  // Food Supplies
  {
    itemName: 'Emergency Food Rations (Ready-to-Eat)',
    itemCode: 'FOOD-001',
    category: 'food_supplies',
    description: 'High-energy emergency food rations for disaster relief',
    currentStock: 500,
    minimumStock: 100,
    maximumStock: 1000,
    unitPrice: 150,
    supplier: {
      name: 'NutriEmergency Foods',
      contactNumber: '+916543210987',
      email: 'bulk@nutriemergency.in'
    },
    location: {
      warehouse: 'Food Storage C',
      zone: 'Zone-1',
      shelf: 'F-01',
      department: 'RELIEF01'
    },
    status: 'active',
    specifications: {
      weight: '500g',
      calories: '2400kcal',
      shelfLife: '5 years',
      packaging: 'Vacuum sealed'
    },
    expiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // 3 years from now
    lastUpdated: new Date()
  },

  // Water Supplies
  {
    itemName: 'Water Purification Tablets',
    itemCode: 'WATER-001',
    category: 'water_supplies',
    description: 'Water purification tablets for emergency water treatment',
    currentStock: 1000,
    minimumStock: 200,
    maximumStock: 2000,
    unitPrice: 5,
    supplier: {
      name: 'AquaPure Technologies',
      contactNumber: '+915432109876',
      email: 'orders@aquapure.in'
    },
    location: {
      warehouse: 'Supply Storage D',
      zone: 'Zone-1',
      shelf: 'W-01',
      department: 'RELIEF01'
    },
    status: 'active',
    specifications: {
      weight: '1g',
      treatmentCapacity: '1L per tablet',
      activeIngredient: 'Sodium Dichloroisocyanurate'
    },
    expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000), // 2 years from now
    lastUpdated: new Date()
  },

  // Shelter Materials
  {
    itemName: 'Emergency Tents (Family Size)',
    itemCode: 'SHELTER-001',
    category: 'shelter_materials',
    description: 'Waterproof family-size emergency tents for disaster relief',
    currentStock: 30,
    minimumStock: 10,
    maximumStock: 100,
    unitPrice: 8500,
    supplier: {
      name: 'ShelterTech India',
      contactNumber: '+914321098765',
      email: 'supplies@sheltertech.in'
    },
    location: {
      warehouse: 'Shelter Storage E',
      zone: 'Zone-1',
      shelf: 'S-01',
      department: 'RELIEF01'
    },
    status: 'active',
    specifications: {
      capacity: '6 persons',
      dimensions: '4m x 3m x 2m',
      weight: '12kg',
      material: 'Waterproof polyester',
      setupTime: '15 minutes'
    },
    lastUpdated: new Date()
  }
];

// Seed function
const seedInventory = async () => {
  try {
    await connectDB();
    
    // Clear existing inventory (optional)
    console.log('🗑️  Clearing existing inventory...');
    await Inventory.deleteMany({});
    
    // Insert sample inventory
    console.log('📦 Seeding inventory data...');
    const createdItems = await Inventory.insertMany(sampleInventory);
    
    console.log(`✅ Successfully seeded ${createdItems.length} inventory items:`);
    createdItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.itemName} (${item.itemCode}) - Stock: ${item.currentStock}`);
    });
    
    console.log('\n📊 Summary by Category:');
    const categories = {};
    createdItems.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} items`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
  } finally {
    console.log('🔌 Disconnecting from database...');
    await mongoose.disconnect();
    process.exit(0);
  }
};

// Run seeding if called directly
if (require.main === module) {
  console.log('🌱 Starting inventory seeding process...');
  seedInventory();
}

module.exports = { seedInventory, sampleInventory };
