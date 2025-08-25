const mongoose = require('mongoose');
const Department = require('./src/models/Department');
const CONSTANTS = require('./src/config/constants');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/disaster-management');
    console.log('📦 MongoDB Connected for seeding departments...');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample departments data
const sampleDepartments = [
  // Emergency Services
  {
    name: 'Fire Department',
    code: 'FIRE001',
    type: 'fire',
    description: 'Emergency fire response and rescue operations',
    contactInfo: {
      email: 'fire@emergency.gov',
      phone: '+911234567890',
      address: 'Central Fire Station, Emergency Complex'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400001',
    isActive: true,
    capacity: {
      totalStaff: 150,
      currentStaff: 120,
      totalVehicles: 25,
      operationalVehicles: 20
    },
    specializations: ['Fire Fighting', 'Rescue Operations', 'Hazmat Response'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },
  {
    name: 'Police Department',
    code: 'POLICE01',
    type: 'police',
    description: 'Law enforcement and emergency response',
    contactInfo: {
      email: 'police@emergency.gov',
      phone: '+911234567890',
      address: 'Central Police Station, City Center'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400002',
    isActive: true,
    capacity: {
      totalStaff: 300,
      currentStaff: 280,
      totalVehicles: 50,
      operationalVehicles: 45
    },
    specializations: ['Traffic Control', 'Emergency Response', 'Crime Investigation'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },
  {
    name: 'Ambulance Services',
    code: 'AMB001',
    type: 'medical',
    description: 'Emergency medical transportation and first aid',
    contactInfo: {
      email: 'ambulance@health.gov',
      phone: '+911234567891',
      address: 'Emergency Medical Center'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400003',
    isActive: true,
    capacity: {
      totalStaff: 80,
      currentStaff: 75,
      totalVehicles: 30,
      operationalVehicles: 28
    },
    specializations: ['Emergency Medical Services', 'Patient Transport', 'First Aid'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },

  // Medical Services
  {
    name: 'Municipal Hospital',
    code: 'HOSP001',
    type: 'medical',
    description: 'Primary healthcare and emergency medical services',
    contactInfo: {
      email: 'admin@municipalhospital.gov',
      phone: '+912212345678',
      address: 'Municipal Hospital, Healthcare District'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400010',
    isActive: true,
    capacity: {
      totalStaff: 500,
      currentStaff: 450,
      totalBeds: 200,
      availableBeds: 150,
      icuBeds: 20,
      ventilators: 15
    },
    specializations: ['General Medicine', 'Emergency Care', 'Surgery', 'ICU'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },
  {
    name: 'Blood Bank Center',
    code: 'BLOOD01',
    type: 'medical',
    description: 'Blood collection, storage and distribution center',
    contactInfo: {
      email: 'bloodbank@health.gov',
      phone: '+912287654321',
      address: 'Regional Blood Bank, Medical Complex'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400011',
    isActive: true,
    capacity: {
      totalStaff: 50,
      currentStaff: 45,
      storageCapacity: 1000,
      currentStock: 750
    },
    specializations: ['Blood Collection', 'Blood Testing', 'Blood Storage', 'Emergency Supply'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },

  // Relief Services
  {
    name: 'Food Distribution Center',
    code: 'FOOD001',
    type: 'rescue',
    description: 'Emergency food distribution and relief supplies',
    contactInfo: {
      email: 'food@relief.gov',
      phone: '+912211223344',
      address: 'Relief Distribution Center, Warehouse District'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400020',
    isActive: true,
    capacity: {
      totalStaff: 100,
      currentStaff: 85,
      storageCapacity: 5000,
      currentStock: 3500,
      dailyCapacity: 2000
    },
    specializations: ['Food Distribution', 'Emergency Supplies', 'Logistics'],
    operatingHours: {
      isAlwaysOpen: false,
      openTime: '06:00',
      closeTime: '22:00'
    }
  },
  {
    name: 'Temporary Shelter Management',
    code: 'SHELTER1',
    type: 'rescue',
    description: 'Emergency shelter and accommodation services',
    contactInfo: {
      email: 'shelter@relief.gov',
      phone: '+912255667788',
      address: 'Emergency Shelter Complex, Relief Zone'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400021',
    isActive: true,
    capacity: {
      totalStaff: 60,
      currentStaff: 55,
      totalCapacity: 1000,
      currentOccupancy: 200,
      familyUnits: 150,
      individualBeds: 700
    },
    specializations: ['Emergency Shelter', 'Family Accommodation', 'Basic Amenities'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },

  // Administrative
  {
    name: 'Disaster Management Cell',
    code: 'DMC001',
    type: 'other',
    description: 'Central coordination for disaster management activities',
    contactInfo: {
      email: 'dmc@disaster.gov',
      phone: '+912299887766',
      address: 'Disaster Management Headquarters, Government Complex'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400030',
    isActive: true,
    capacity: {
      totalStaff: 80,
      currentStaff: 75
    },
    specializations: ['Disaster Coordination', 'Resource Planning', 'Communication Hub'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },
  {
    name: 'Emergency Communication Center',
    code: 'COMM001',
    type: 'other',
    description: 'Emergency communication and coordination hub',
    contactInfo: {
      email: 'comm@emergency.gov',
      phone: '+912244556677',
      address: 'Communication Center, Emergency Headquarters'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400031',
    isActive: true,
    capacity: {
      totalStaff: 40,
      currentStaff: 38,
      communicationLines: 50,
      activeLines: 48
    },
    specializations: ['Emergency Communication', 'Coordination', 'Information Management'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },

  // Support Services
  {
    name: 'Transport Coordination',
    code: 'TRANS01',
    type: 'other',
    description: 'Emergency transportation and logistics coordination',
    contactInfo: {
      email: 'transport@support.gov',
      phone: '+912233445566',
      address: 'Transport Hub, Logistics Center'
    },
    state: 'Maharashtra',
    district: 'Mumbai',
    city: 'Mumbai',
    pincode: '400040',
    isActive: true,
    capacity: {
      totalStaff: 120,
      currentStaff: 110,
      totalVehicles: 100,
      operationalVehicles: 90,
      heavyVehicles: 30,
      lightVehicles: 60
    },
    specializations: ['Emergency Transport', 'Logistics', 'Heavy Equipment'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },

  // Additional departments in different states
  {
    name: 'Delhi Emergency Services',
    code: 'DES001',
    type: 'police',
    description: 'Integrated emergency services for Delhi region',
    contactInfo: {
      email: 'emergency@delhi.gov',
      phone: '+911112345678',
      address: 'Emergency Services Complex, New Delhi'
    },
    state: 'Delhi',
    district: 'New Delhi',
    city: 'New Delhi',
    pincode: '110001',
    isActive: true,
    capacity: {
      totalStaff: 400,
      currentStaff: 380,
      totalVehicles: 80,
      operationalVehicles: 75
    },
    specializations: ['Multi-service Emergency Response', 'Urban Disaster Management'],
    operatingHours: {
      isAlwaysOpen: true
    }
  },
  {
    name: 'Bangalore Medical Emergency',
    code: 'BME001',
    type: 'medical',
    description: 'Medical emergency services for Bangalore',
    contactInfo: {
      email: 'medical@bangalore.gov',
      phone: '+918087654321',
      address: 'Medical Emergency Center, Bangalore'
    },
    state: 'Karnataka',
    district: 'Bangalore Urban',
    city: 'Bangalore',
    pincode: '560001',
    isActive: true,
    capacity: {
      totalStaff: 250,
      currentStaff: 230,
      totalBeds: 150,
      availableBeds: 100,
      ambulances: 25
    },
    specializations: ['Emergency Medicine', 'Trauma Care', 'Critical Care'],
    operatingHours: {
      isAlwaysOpen: true
    }
  }
];

// Seed departments function
const seedDepartments = async () => {
  try {
    console.log('🌱 Starting department seeding...');
    
    // Clear existing departments (optional - comment out if you want to keep existing data)
    await Department.deleteMany({});
    console.log('🗑️  Cleared existing departments');
    
    // Insert sample departments
    const createdDepartments = await Department.insertMany(sampleDepartments);
    console.log(`✅ Successfully created ${createdDepartments.length} departments:`);
    
    createdDepartments.forEach(dept => {
      console.log(`   📋 ${dept.name} (${dept.code}) - ${dept.type}`);
    });
    
    console.log('\n🎉 Department seeding completed successfully!');
    console.log(`📊 Total departments in database: ${await Department.countDocuments()}`);
    
  } catch (error) {
    console.error('❌ Error seeding departments:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the seeding script
const runSeed = async () => {
  console.log('🚀 Starting Department Seeding Script');
  console.log('=====================================\n');
  
  await connectDB();
  await seedDepartments();
  
  console.log('\n=====================================');
  console.log('✨ Seeding script completed!');
  process.exit(0);
};

// Execute if running directly
if (require.main === module) {
  runSeed().catch(error => {
    console.error('💥 Seeding script failed:', error);
    process.exit(1);
  });
}

module.exports = { seedDepartments, sampleDepartments };

