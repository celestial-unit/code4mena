# Code4Mena Legal Assistant - Docker Setup

This guide helps you run the complete full-stack application with both the Gemini Live API backend and React Native frontend.

## 🚀 Quick Start

### Option 1: Full Docker Setup (Recommended for Production)

```bash
# Set your Gemini API key
export GEMINI_API_KEY=your_gemini_api_key_here

# Start everything with Docker
./start-full-stack.sh
```

### Option 2: Development Mode (Faster for Development)

```bash
# Set your Gemini API key
export GEMINI_API_KEY=your_gemini_api_key_here

# Start in development mode
./start-dev.sh
```

### Option 3: NPM Scripts

```bash
# Full Docker setup
npm run docker

# Development mode
npm run dev

# Just backend
npm run backend

# Just frontend
npm run web
```

## 📋 Prerequisites

1. **Docker & Docker Compose** (for full setup)
2. **Node.js 18+** (for development mode)
3. **Python 3.9+** (for development mode)
4. **Gemini API Key** from Google AI Studio

## 🔧 Configuration

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
# Required for Gemini Live API
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - Additional AI providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# API Configuration
API_BASE_URL=http://localhost:8001
API_TIMEOUT=30000

# Feature Flags
ENABLE_3D_MASCOTS=true
ENABLE_VOICE_AI=true
ENABLE_OFFLINE_MODE=true
```

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Set it as an environment variable:
   ```bash
   export GEMINI_API_KEY=your_api_key_here
   ```

## 🌐 Access Points

Once running, you can access:

- **Frontend (React Native Web)**: http://localhost:8081
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## 🧪 Testing the Integration

1. Open http://localhost:8081 in your browser
2. Navigate to "المحادثة القانونية" (Legal Chat)
3. Ask a legal question in Arabic, for example:
   - "ما هي متطلبات تسجيل شركة جديدة في تونس؟"
   - "كيف أحصل على رخصة تجارية؟"
   - "ما هي حقوق العامل في تونس؟"
4. Your Gemini Live API will respond with dynamic legal guidance!

## 🔍 Troubleshooting

### Backend Issues

```bash
# Check backend logs
docker-compose logs backend

# Or in development mode
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Issues

```bash
# Check frontend logs
docker-compose logs frontend

# Or in development mode
npm run web
```

### Health Check

```bash
# Test backend health
curl http://localhost:8001/health

# Test a query
curl -X POST http://localhost:8001/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token" \
  -d '{"query": "مرحبا", "language": "ar", "user_id": "test"}'
```

### Common Issues

1. **Port conflicts**: Make sure ports 8001 and 8081 are free
2. **Gemini API Key**: Ensure your API key is valid and has quota
3. **Docker**: Make sure Docker is running and has enough resources
4. **Network**: Check if localhost connections are allowed

## 🛠️ Development

### Project Structure

```
├── backend/                 # Gemini Live API backend
│   ├── main.py             # FastAPI application
│   ├── services/           # AI services (Gemini, RAG, etc.)
│   └── Dockerfile          # Backend Docker config
├── src/                    # React Native frontend
│   ├── screens/            # App screens
│   ├── services/           # API integration
│   └── components/         # UI components
├── docker-compose.yml      # Full stack Docker setup
├── start-full-stack.sh     # Complete startup script
└── start-dev.sh           # Development startup script
```

### Making Changes

1. **Backend changes**: Edit files in `backend/`, they auto-reload
2. **Frontend changes**: Edit files in `src/`, they auto-reload
3. **Docker changes**: Run `docker-compose up --build` to rebuild

## 📊 Monitoring

### Service Status

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# Restart a service
docker-compose restart [service_name]
```

### Performance

- Backend typically uses ~200MB RAM
- Frontend build uses ~500MB RAM
- PostgreSQL uses ~100MB RAM
- Total system requirements: ~1GB RAM, 2GB disk

## 🚀 Deployment

For production deployment:

1. Update environment variables for production
2. Use `docker-compose.prod.yml` if available
3. Set up proper SSL certificates
4. Configure domain names
5. Set up monitoring and logging

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify your Gemini API key is working
3. Ensure all ports are available
4. Check Docker has sufficient resources

The application combines a powerful Gemini Live API backend with a modern React Native frontend to provide dynamic legal assistance for Tunisian law!