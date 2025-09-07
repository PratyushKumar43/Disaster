require('dotenv').config();
const earthEngineConfig = require('./src/config/simpleEarthEngine');

async function testSimpleEarthEngine() {
    console.log('🧪 Testing Simplified Earth Engine Configuration...');
    
    const status = earthEngineConfig.getStatus();
    console.log('📊 Earth Engine Status:', status);
    
    const initResult = await earthEngineConfig.initialize();
    console.log(`✅ Initialization result: ${initResult}`);
    
    // Test feature extraction (always works with synthetic data)
    try {
        const bounds = {
            north: 28.7,
            south: 28.5,
            east: 77.3,
            west: 77.1
        };
        
        console.log('🛰️  Testing feature extraction...');
        const features = await earthEngineConfig.extractFeatures(bounds);
        console.log('📊 Sample features extracted:');
        Object.entries(features).forEach(([key, value]) => {
            console.log(`   ${key}: ${typeof value === 'number' ? value.toFixed(3) : value}`);
        });
        
        console.log('✅ Feature extraction successful!');
        
    } catch (error) {
        console.error('❌ Feature extraction failed:', error.message);
    }
}

testSimpleEarthEngine().catch(console.error);
