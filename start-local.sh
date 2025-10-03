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
pip install pyyaml  # Required for build_microservices.py
cd api-gateway && pip install -r requirements.txt && cd ..

# Build microservices if they don't exist
if [ ! -d "microservices/user-management" ]; then
    echo "🔧 Building microservices..."
    python3 build_microservices.py
fi

# Install microservice dependencies
cd microservices/user-management && pip install -r requirements.txt && cd ../..
cd microservices/payment-processing && pip install -r requirements.txt && cd ../..
cd microservices/inventory-system && pip install -r requirements.txt && cd ../..
cd microservices/notification-center && pip install -r requirements.txt && cd ../..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend && npm install && cd ..

echo "🔧 Starting services..."

# Start API Gateway
echo "  - Starting API Gateway on port 8004..."
cd api-gateway
source ../venv/bin/activate && PORT=8004 python3 app.py &
API_PID=$!
cd ..

# Start User Management
echo "  - Starting User Management on port 8001..."
cd microservices/user-management
source ../../venv/bin/activate && PORT=8001 python3 app.py &
USER_PID=$!
cd ../..

# Start Payment Processing
echo "  - Starting Payment Processing on port 8002..."
cd microservices/payment-processing
source ../../venv/bin/activate && PORT=8002 python3 app.py &
PAYMENT_PID=$!
cd ../..

# Start Inventory System
echo "  - Starting Inventory System on port 8003..."
cd microservices/inventory-system
source ../../venv/bin/activate && PORT=8003 python3 app.py &
INVENTORY_PID=$!
cd ../..

# Start Notification Center
echo "  - Starting Notification Center on port 8005..."
cd microservices/notification-center
source ../../venv/bin/activate && PORT=8005 python3 app.py &
NOTIFICATION_PID=$!
cd ../..

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
echo "   User Management: http://localhost:8001"
echo "   Payment Processing: http://localhost:8002"
echo "   Inventory System: http://localhost:8003"
echo "   Notification Center: http://localhost:8005"
echo ""
echo "🛑 To stop all services, press Ctrl+C"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $API_PID $USER_PID $PAYMENT_PID $INVENTORY_PID $NOTIFICATION_PID $FRONTEND_PID 2>/dev/null || true
    echo "✅ All services stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
