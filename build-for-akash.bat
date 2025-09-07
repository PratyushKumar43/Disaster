@echo off
echo 🚀 Building Disaster Management App for Akash Network

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

echo 🔨 Building Docker image...
docker build -t pratyushkumar43/disaster-backend:latest .
if %errorlevel% neq 0 (
    echo ❌ Docker build failed
    pause
    exit /b 1
)

echo ✅ Docker image built successfully

REM Ask if user wants to push to Docker Hub
set /p push="Do you want to push the image to Docker Hub? (y/n): "
if /i "%push%"=="y" (
    echo 📤 Pushing image to Docker Hub...
    docker push pratyushkumar43/disaster-backend:latest
    if %errorlevel% neq 0 (
        echo ❌ Docker push failed. Make sure you're logged in with 'docker login'
        pause
        exit /b 1
    )
    echo ✅ Image pushed successfully
)

echo.
echo 🎉 Build process completed!
echo.
echo 📋 Next steps:
echo 1. Update environment variables in deploy-akash.yaml
echo 2. Test on Akash sandbox network first
echo 3. Deploy to Akash mainnet
echo.
echo 💡 Quick commands:
echo Test locally: docker run -p 10000:10000 pratyushkumar43/disaster-backend:latest
echo Deploy to Akash: Follow the guide in AKASH_DEPLOYMENT.md

pause
