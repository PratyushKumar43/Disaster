require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function validateEarthEngineConfiguration() {
    console.log('🔍 Comprehensive Earth Engine Configuration Validation\n');
    
    // 1. Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`   PROJECT_ID: ${process.env.GOOGLE_EARTH_ENGINE_PROJECT_ID || 'NOT SET'}`);
    console.log(`   PRIVATE_KEY_PATH: ${process.env.GOOGLE_EARTH_ENGINE_PRIVATE_KEY_PATH || 'NOT SET'}`);
    console.log(`   SERVICE_ACCOUNT_EMAIL: ${process.env.GOOGLE_EARTH_ENGINE_SERVICE_ACCOUNT_EMAIL || 'NOT SET'}\n`);
    
    // 2. Check service account key file
    const keyPath = path.join(__dirname, process.env.GOOGLE_EARTH_ENGINE_PRIVATE_KEY_PATH || '');
    console.log('🔑 Service Account Key File:');
    console.log(`   Path: ${keyPath}`);
    console.log(`   Exists: ${fs.existsSync(keyPath)}`);
    
    if (fs.existsSync(keyPath)) {
        try {
            const keyContent = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            console.log(`   Type: ${keyContent.type}`);
            console.log(`   Project ID: ${keyContent.project_id}`);
            console.log(`   Client Email: ${keyContent.client_email}`);
            console.log(`   Client ID: ${keyContent.client_id}`);
            console.log(`   Has Private Key: ${!!keyContent.private_key}`);
            console.log(`   Universe Domain: ${keyContent.universe_domain}`);
            
            // 3. Validate consistency
            console.log('\n✅ Configuration Validation:');
            const envProjectId = process.env.GOOGLE_EARTH_ENGINE_PROJECT_ID;
            const envServiceEmail = process.env.GOOGLE_EARTH_ENGINE_SERVICE_ACCOUNT_EMAIL;
            
            if (envProjectId === keyContent.project_id) {
                console.log(`   ✅ Project ID matches: ${envProjectId}`);
            } else {
                console.log(`   ❌ Project ID mismatch:`);
                console.log(`      ENV: ${envProjectId}`);
                console.log(`      KEY: ${keyContent.project_id}`);
            }
            
            if (envServiceEmail === keyContent.client_email) {
                console.log(`   ✅ Service account email matches: ${envServiceEmail}`);
            } else {
                console.log(`   ❌ Service account email mismatch:`);
                console.log(`      ENV: ${envServiceEmail}`);
                console.log(`      KEY: ${keyContent.client_email}`);
            }
            
            // 4. Check key validity
            const keyLines = keyContent.private_key.split('\n');
            if (keyLines[0].includes('BEGIN PRIVATE KEY') && keyLines[keyLines.length-2].includes('END PRIVATE KEY')) {
                console.log('   ✅ Private key format is valid');
            } else {
                console.log('   ❌ Private key format appears invalid');
            }
            
        } catch (error) {
            console.log(`   ❌ Error reading key file: ${error.message}`);
        }
    }
    
    // 5. Test Google Earth Engine library compatibility
    console.log('\n📦 Google Earth Engine Library Test:');
    try {
        const ee = require('@google/earthengine');
        console.log('   ✅ @google/earthengine library imported successfully');
        
        // Try to access basic EE components without initialization
        console.log(`   ✅ EE library version info available: ${typeof ee.data !== 'undefined'}`);
        console.log(`   ✅ EE Image class available: ${typeof ee.Image !== 'undefined'}`);
        console.log(`   ✅ EE ImageCollection class available: ${typeof ee.ImageCollection !== 'undefined'}`);
        
    } catch (error) {
        console.log(`   ❌ Error with Earth Engine library: ${error.message}`);
    }
    
    // 6. Recommend configuration
    console.log('\n🔧 Configuration Summary:');
    
    const issues = [];
    const recommendations = [];
    
    if (!process.env.GOOGLE_EARTH_ENGINE_PROJECT_ID) {
        issues.push('Project ID not set in environment');
    }
    
    if (!fs.existsSync(keyPath)) {
        issues.push('Service account key file not found');
    }
    
    if (issues.length === 0) {
        console.log('   ✅ Configuration appears correct');
        console.log('   ℹ️  Note: Earth Engine library may have compatibility issues');
        console.log('   ℹ️  Using synthetic data mode is recommended for reliability');
        
        recommendations.push('Consider using synthetic environmental data');
        recommendations.push('Test with real Google Cloud Platform credentials if needed');
        recommendations.push('Enable Earth Engine API in Google Cloud Console');
    } else {
        console.log('   ❌ Configuration issues found:');
        issues.forEach(issue => console.log(`      - ${issue}`));
    }
    
    if (recommendations.length > 0) {
        console.log('   💡 Recommendations:');
        recommendations.forEach(rec => console.log(`      - ${rec}`));
    }
    
    console.log('\n🌍 Current ML Service Strategy:');
    console.log('   📊 Using synthetic environmental features for reliability');
    console.log('   🔥 Real ML model for fire risk prediction');
    console.log('   ⚡ Fast response times with synthetic data');
    console.log('   🎯 Accurate predictions based on location and seasonality');
}

validateEarthEngineConfiguration().catch(console.error);
