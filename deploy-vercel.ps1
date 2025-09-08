# Vercel Deployment Fix Script for Windows PowerShell
Write-Host "🚀 Fixing Vercel Deployment for Disaster Management App" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

# Navigate to Frontend directory
Set-Location Frontend

# Check Node.js version
Write-Host "📋 Checking Node.js version..." -ForegroundColor Yellow
node --version
npm --version

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Clean cache and build
Write-Host "🧹 Cleaning cache and building..." -ForegroundColor Yellow
npx next clean
npm run build

# Check for build errors
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
    npx vercel --prod
    
    # Check deployment status
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host "🌐 Your app should now be accessible at your Vercel URL" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment failed. Please check the logs above." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build failed. Please fix the build errors and try again." -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Troubleshooting Tips:" -ForegroundColor Cyan
Write-Host "1. Make sure all dependencies are installed: npm install" -ForegroundColor White
Write-Host "2. Check for TypeScript errors: npm run type-check" -ForegroundColor White
Write-Host "3. Verify build works locally: npm run build" -ForegroundColor White
Write-Host "4. Check Vercel logs: vercel logs" -ForegroundColor White
Write-Host "5. Ensure environment variables are set in Vercel dashboard" -ForegroundColor White

# Return to root directory
Set-Location ..
