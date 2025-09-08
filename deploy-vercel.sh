#!/bin/bash

# Vercel Deployment Fix Script
echo "🚀 Fixing Vercel Deployment for Disaster Management App"
echo "======================================================"

# Navigate to Frontend directory
cd Frontend

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clean cache and build
echo "🧹 Cleaning cache and building..."
npx next clean
npm run build

# Check for build errors
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod
    
    # Check deployment status
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Your app should now be accessible at your Vercel URL"
    else
        echo "❌ Deployment failed. Please check the logs above."
    fi
else
    echo "❌ Build failed. Please fix the build errors and try again."
fi

echo ""
echo "🔧 Troubleshooting Tips:"
echo "1. Make sure all dependencies are installed: npm install"
echo "2. Check for TypeScript errors: npm run type-check"
echo "3. Verify build works locally: npm run build"
echo "4. Check Vercel logs: vercel logs"
echo "5. Ensure environment variables are set in Vercel dashboard"
