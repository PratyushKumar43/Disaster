#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if all required files and configurations are present for successful deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment configuration...\n');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    console.log('✅ package.json found');
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Check if start script exists
        if (packageJson.scripts && packageJson.scripts.start) {
            console.log('✅ start script found:', packageJson.scripts.start);
        } else {
            console.log('❌ start script missing in package.json');
        }
        
        // Check main file
        if (packageJson.main) {
            const mainFile = path.join(__dirname, packageJson.main);
            if (fs.existsSync(mainFile)) {
                console.log('✅ main file found:', packageJson.main);
            } else {
                console.log('❌ main file not found:', packageJson.main);
            }
        }
        
    } catch (error) {
        console.log('❌ Error reading package.json:', error.message);
    }
} else {
    console.log('❌ package.json not found');
}

// Check if server.js exists
const serverJsPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverJsPath)) {
    console.log('✅ server.js found');
} else {
    console.log('❌ server.js not found');
}

// Check environment variables
const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URL',
    'JWT_SECRET'
];

console.log('\n📋 Environment Variables Check:');
requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
        console.log(`✅ ${envVar} is set`);
    } else {
        console.log(`⚠️  ${envVar} is not set (should be configured in deployment platform)`);
    }
});

// Check directory structure
console.log('\n📁 Directory Structure:');
const requiredDirs = ['src', 'src/models', 'src/routes', 'src/controllers'];
requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}/ exists`);
    } else {
        console.log(`❌ ${dir}/ not found`);
    }
});

console.log('\n🎯 Deployment Tips:');
console.log('1. Ensure Root Directory is set to "backend" in your deployment platform');
console.log('2. Set all required environment variables');
console.log('3. Use PORT from process.env.PORT');
console.log('4. Ensure MongoDB Atlas allows connections from 0.0.0.0/0');

console.log('\n✨ Verification complete!');
