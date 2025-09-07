require('dotenv').config();
const earthEngineConfig = require('./src/config/earthEngine');
const path = require('path');
const fs = require('fs');

async function testEarthEngineAuth() {
    console.log('🧪 Testing Earth Engine Authentication...');
    
    const keyPath = path.join(__dirname, 'earth-engine-471304-e4a741d53c6f.json');
    console.log(`📋 Key file path: ${keyPath}`);
    console.log(`📋 Key file exists: ${fs.existsSync(keyPath)}`);
    
    if (fs.existsSync(keyPath)) {
        try {
            const keyContent = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            console.log(`📋 Project ID in key: ${keyContent.project_id}`);
            console.log(`📋 Service account email: ${keyContent.client_email}`);
            console.log(`📋 Key type: ${keyContent.type}`);
        } catch (error) {
            console.error('❌ Error reading key file:', error.message);
        }
    }
    
    const status = earthEngineConfig.getStatus();
    console.log('📊 Earth Engine Status:', status);
    
    const initResult = await earthEngineConfig.initialize();
    console.log(`✅ Initialization result: ${initResult}`);
    
    if (initResult) {
        console.log('🌍 Earth Engine initialized successfully!');
        
        // Test basic functionality
        try {
            const bounds = {
                north: 28.7,
                south: 28.5,
                east: 77.3,
                west: 77.1
            };
            
            console.log('🛰️  Testing feature extraction...');
            const features = await earthEngineConfig.extractFeatures(bounds);
            console.log('📊 Sample features:', features);
            
        } catch (error) {
            console.error('❌ Feature extraction failed:', error.message);
        }
        
    } else {
        console.error('❌ Earth Engine initialization failed');
    }
}

testEarthEngineAuth().catch(console.error);
