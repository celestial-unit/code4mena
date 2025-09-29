#!/bin/bash

# Quick development start script
# Starts both backend and frontend without Docker for faster development

set -e

echo "🚀 Starting Code4Mena Legal Assistant (Development Mode)"
echo "======================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    print_warning "GEMINI_API_KEY not set. Please set it for Gemini Live API to work:"
    print_warning "export GEMINI_API_KEY=your_api_key_here"
fi

# Function to kill background processes on exit
cleanup() {
    print_status "Stopping services..."
    jobs -p | xargs -r kill
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
print_status "Starting Backend API (Gemini Live)..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
print_status "Starting Frontend (React Native Web)..."
npm run web &
FRONTEND_PID=$!

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 5

# Test backend
if curl -f http://localhost:8001/ > /dev/null 2>&1; then
    print_success "Backend is running at http://localhost:8001"
else
    print_warning "Backend may still be starting..."
fi

# Test frontend
if curl -f http://localhost:8081/ > /dev/null 2>&1; then
    print_success "Frontend is running at http://localhost:8081"
else
    print_warning "Frontend may still be starting..."
fi

echo ""
echo "🎉 Development servers are running!"
echo "=================================="
echo ""
echo "📱 Frontend: http://localhost:8081"
echo "🔧 Backend:  http://localhost:8001"
echo "📊 Health:   http://localhost:8001/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait