#!/bin/bash

# Local Development Script
# This script starts all services locally for development

set -e

echo "🚀 Starting Upsun Demo Application locally..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install it first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Create and activate virtual environment
echo "📦 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd api-gateway && pip install -r requirements.txt && cd ..
cd cpu-worker && pip install -r requirements.txt && cd ..
cd memory-worker && pip install -r requirements.txt && cd ..
cd network-simulator && pip install -r requirements.txt && cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend && npm install && cd ..

echo "🔧 Starting services..."

# Start API Gateway
echo "  - Starting API Gateway on port 8004..."
cd api-gateway
source ../venv/bin/activate && python app.py &
API_PID=$!
cd ..

# Start CPU Worker
echo "  - Starting CPU Worker on port 8001..."
cd cpu-worker
source ../venv/bin/activate && python app.py &
CPU_PID=$!
cd ..

# Start Memory Worker
echo "  - Starting Memory Worker on port 8002..."
cd memory-worker
source ../venv/bin/activate && python app.py &
MEMORY_PID=$!
cd ..

# Start Network Simulator
echo "  - Starting Network Simulator on port 8003..."
cd network-simulator
source ../venv/bin/activate && python app.py &
NETWORK_PID=$!
cd ..

# Wait a moment for services to start
sleep 3

# Start Frontend
echo "  - Starting Frontend on port 3000..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo ""
echo "🌐 Your application is now available at:"
echo "   Frontend: http://localhost:3000"
echo "   API Gateway: http://localhost:8004"
echo "   CPU Worker: http://localhost:8001"
echo "   Memory Worker: http://localhost:8002"
echo "   Network Simulator: http://localhost:8003"
echo ""
echo "🛑 To stop all services, press Ctrl+C"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $API_PID $CPU_PID $MEMORY_PID $NETWORK_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
