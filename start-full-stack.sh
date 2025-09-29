#!/bin/bash

# Code4Mena Legal Assistant - Full Stack Startup Script
# This script starts both the Gemini Live API backend and React Native frontend

set -e

echo "🚀 Starting Code4Mena Legal Assistant Full Stack..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Check for required environment variables
if [ -z "$GEMINI_API_KEY" ]; then
    print_warning "GEMINI_API_KEY not set. Gemini Live API features may not work."
    print_warning "Set it with: export GEMINI_API_KEY=your_api_key"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file..."
    cat > .env << EOF
# API Configuration
API_BASE_URL=http://localhost:8001
API_TIMEOUT=30000

# Feature Flags
ENABLE_3D_MASCOTS=true
ENABLE_VOICE_AI=true
ENABLE_OFFLINE_MODE=true

# Analytics (optional)
ANALYTICS_ENABLED=false
ANALYTICS_API_KEY=

# Debug Settings
DEBUG_MODE=true
LOG_LEVEL=info

# Gemini API Key (add your key here)
GEMINI_API_KEY=${GEMINI_API_KEY:-}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
EOF
    print_success ".env file created"
fi

# Stop any existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start services
print_status "Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
print_status "Waiting for services to be ready..."

# Wait for PostgreSQL
print_status "Waiting for PostgreSQL..."
timeout=60
while ! docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    sleep 2
    timeout=$((timeout - 2))
    if [ $timeout -le 0 ]; then
        print_error "PostgreSQL failed to start within 60 seconds"
        docker-compose logs postgres
        exit 1
    fi
done
print_success "PostgreSQL is ready"

# Wait for Redis
print_status "Waiting for Redis..."
timeout=30
while ! docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    sleep 2
    timeout=$((timeout - 2))
    if [ $timeout -le 0 ]; then
        print_error "Redis failed to start within 30 seconds"
        docker-compose logs redis
        exit 1
    fi
done
print_success "Redis is ready"

# Wait for Backend API
print_status "Waiting for Backend API..."
timeout=120
while ! curl -f http://localhost:8001/ > /dev/null 2>&1; do
    sleep 3
    timeout=$((timeout - 3))
    if [ $timeout -le 0 ]; then
        print_error "Backend API failed to start within 120 seconds"
        docker-compose logs backend
        exit 1
    fi
done
print_success "Backend API is ready"

# Test backend health
print_status "Testing backend health..."
health_response=$(curl -s http://localhost:8001/health || echo "failed")
if [[ $health_response == *"healthy"* ]]; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check shows some issues, but core services may still work"
    echo "Health response: $health_response"
fi

# Wait for Frontend
print_status "Waiting for Frontend..."
timeout=90
while ! curl -f http://localhost:8081/ > /dev/null 2>&1; do
    sleep 3
    timeout=$((timeout - 3))
    if [ $timeout -le 0 ]; then
        print_warning "Frontend may still be starting. Check logs if needed."
        break
    fi
done

if curl -f http://localhost:8081/ > /dev/null 2>&1; then
    print_success "Frontend is ready"
else
    print_warning "Frontend may still be starting"
fi

echo ""
echo "🎉 Code4Mena Legal Assistant is now running!"
echo "============================================="
echo ""
echo "📱 Frontend (React Native Web): http://localhost:8081"
echo "🔧 Backend API (Gemini Live):   http://localhost:8001"
echo "📊 API Health Check:            http://localhost:8001/health"
echo "📚 API Documentation:           http://localhost:8001/docs"
echo ""
echo "🔍 To test the integration:"
echo "   1. Open http://localhost:8081 in your browser"
echo "   2. Go to 'المحادثة القانونية' (Legal Chat)"
echo "   3. Ask a legal question in Arabic"
echo "   4. Your Gemini Live API will respond dynamically!"
echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker-compose logs -f [service_name]"
echo "   Stop services: docker-compose down"
echo "   Restart:       ./start-full-stack.sh"
echo ""

# Show service status
print_status "Service Status:"
docker-compose ps

echo ""
print_success "Setup complete! Your full-stack legal assistant is ready to use."

# Optional: Open browser automatically
if command -v xdg-open &> /dev/null; then
    print_status "Opening browser..."
    xdg-open http://localhost:8081
elif command -v open &> /dev/null; then
    print_status "Opening browser..."
    open http://localhost:8081
fi