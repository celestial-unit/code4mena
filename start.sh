#!/bin/bash

# Code4Mena Legal Assistant Startup Script

set -e

echo "🚀 Starting Code4Mena Legal Assistant..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your API keys before running again!"
    echo "   Required: GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/models backend/data backend/logs
mkdir -p nginx/ssl

# Set permissions
chmod +x start.sh

# Choose environment
if [ "$1" = "prod" ] || [ "$1" = "production" ]; then
    echo "🏭 Starting in PRODUCTION mode..."
    docker-compose -f docker-compose.prod.yml up -d
    echo "🌐 Services available at:"
    echo "   - API: http://localhost:8000"
    echo "   - Nginx: http://localhost:80"
    echo "   - Grafana: http://localhost:3000 (admin/admin)"
    echo "   - Prometheus: http://localhost:9090"
else
    echo "🛠️  Starting in DEVELOPMENT mode..."
    docker-compose up -d
    echo "🌐 Services available at:"
    echo "   - API: http://localhost:8001"
    echo "   - Database: localhost:5433"
    echo "   - Redis: localhost:6380"
fi

echo ""
echo "✅ Code4Mena Legal Assistant is starting up!"
echo "📊 Check status with: docker-compose ps"
echo "📋 View logs with: docker-compose logs -f"
echo "🛑 Stop with: docker-compose down"
echo ""
echo "🔗 API Documentation: http://localhost:8001/docs"
echo "❤️  Health Check: http://localhost:8001/health"