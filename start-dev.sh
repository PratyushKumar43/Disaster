#!/bin/bash
# Bash script to run both backend and frontend concurrently
# Usage: ./start-dev.sh

echo "🚀 Starting DisasterIQ Development Environment..."
echo "📦 Backend will run on http://localhost:5000"
echo "🌐 Frontend will run on http://localhost:3000"
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    echo "✅ Servers stopped successfully!"
    exit 0
}

# Set trap to cleanup on script termination
trap cleanup SIGINT SIGTERM

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Start backend server
echo "🔧 Starting Backend Server..."
cd "$SCRIPT_DIR/backend"
npm run dev &
BACKEND_PID=$!

# Start frontend server
echo "⚛️ Starting Frontend Server..."
cd "$SCRIPT_DIR/Frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "📝 Press Ctrl+C to stop both servers"
echo ""

# Wait for background processes
wait