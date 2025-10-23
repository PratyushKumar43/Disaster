# PowerShell script to run both backend and frontend concurrently
# Usage: .\start-dev.ps1

Write-Host "🚀 Starting DisasterIQ Development Environment..." -ForegroundColor Green
Write-Host "📦 Backend will run on http://localhost:5000" -ForegroundColor Yellow
Write-Host "🌐 Frontend will run on http://localhost:3000" -ForegroundColor Yellow
Write-Host ""

# Function to run backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\PRATYUSH\Desktop\WEB Projects\disaster\backend"
    Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
    npm run dev
}

# Function to run frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\PRATYUSH\Desktop\WEB Projects\disaster\Frontend"
    Write-Host "⚛️ Starting Frontend Server..." -ForegroundColor Magenta
    npm run dev
}

Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host "📝 Press Ctrl+C to stop both servers" -ForegroundColor Red
Write-Host ""

# Wait for jobs and handle termination
try {
    # Keep script running and show job output
    while ($backendJob.State -eq "Running" -or $frontendJob.State -eq "Running") {
        Start-Sleep -Seconds 1
        
        # Receive output from jobs
        Receive-Job $backendJob -Keep | ForEach-Object { Write-Host "[BACKEND] $_" -ForegroundColor Blue }
        Receive-Job $frontendJob -Keep | ForEach-Object { Write-Host "[FRONTEND] $_" -ForegroundColor Green }
    }
}
finally {
    # Clean up jobs when script is terminated
    Write-Host ""
    Write-Host "🛑 Stopping servers..." -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✅ Servers stopped successfully!" -ForegroundColor Green
}