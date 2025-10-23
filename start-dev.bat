@echo off
:: Batch script to run both backend and frontend concurrently
:: Usage: start-dev.bat

echo 🚀 Starting DisasterIQ Development Environment...
echo 📦 Backend will run on http://localhost:5000
echo 🌐 Frontend will run on http://localhost:3000
echo.

:: Start backend server in a new command window
echo 🔧 Starting Backend Server...
start "DisasterIQ Backend" /D "%~dp0backend" cmd /k "npm run dev"

:: Wait a moment for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend server in a new command window
echo ⚛️ Starting Frontend Server...
start "DisasterIQ Frontend" /D "%~dp0Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting in separate windows...
echo 📝 Close the command windows to stop the servers
echo.
pause