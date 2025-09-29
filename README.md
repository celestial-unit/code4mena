# Kanounji 2025 - Tunisian Legal Intelligence App

Revolutionary real-time legal intelligence platform for Tunisia built with React Native and Expo.

## Features

- 🏛️ Real-time legal intelligence dashboard
- 🎭 3D Tunisian mascots with cultural authenticity
- 🗣️ Voice AI interface with Tunisian dialect support
- 📱 Cross-platform mobile app (iOS, Android, Web)
- 🔍 Multi-source legal search and discovery
- 🎮 Gamification and achievement system
- 👥 Community features and voting
- 🌐 Multi-language support (Arabic, French, English)

## Getting Started

### Prerequisites

- Node.js (v20.15.0 or higher)
- npm or yarn
- Expo CLI
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tunisian-legal-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Development Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run clean` - Clear Expo cache

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation configuration
├── services/       # API services and data fetching
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
├── store/          # State management
└── config/         # Configuration files
```

## Environment Variables

Configure the following environment variables in `.env`:

- `API_BASE_URL` - Backend API base URL
- `API_TIMEOUT` - API request timeout
- `ENABLE_3D_MASCOTS` - Enable/disable 3D mascot features
- `ENABLE_VOICE_AI` - Enable/disable voice AI features
- `ENABLE_OFFLINE_MODE` - Enable/disable offline functionality
- `DEBUG_MODE` - Enable/disable debug features

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

### Commit Guidelines

- Use conventional commit messages
- Run linting and type checking before commits
- Test on multiple platforms when possible

## Architecture

The app follows a modular architecture with:

- **Expo Router** for file-based navigation
- **TypeScript** for type safety
- **React Native Skia** for 3D mascot rendering
- **React Query** for data fetching and caching
- **AsyncStorage** for local data persistence

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.