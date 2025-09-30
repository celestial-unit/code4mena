# Kanounji 2025 - Tunisian Legal Intelligence App

Revolutionary real-time legal intelligence platform for Tunisia built with React Native and Expo.

## Features

### Core Features
- 🏛️ Real-time legal intelligence dashboard
- 🔍 Multi-source legal search and discovery
- 📱 Cross-platform mobile app (iOS, Android, Web)
- 🌐 Multi-language support (Arabic, French, English)
- 🗣️ Voice AI interface with Tunisian dialect support

### Enhanced Profile System
- 👤 **Enhanced Profile Screen** - Beautifully redesigned with smooth animations
- 🎨 **Dynamic Theming** - Light/dark mode with cultural color schemes
- 🎭 **3D Tunisian Mascots** - Interactive mascots with cultural authenticity
- 🏆 **Gamification System** - Achievement badges and progress tracking
- ⚙️ **Advanced Preferences** - Comprehensive customization options
- 📊 **Personal Dashboard** - Individual info and achievements tracking

### Cultural & Accessibility Features
- 🌍 **RTL/LTR Support** - Seamless Arabic and French language switching
- 🎨 **Cultural Themes** - Tunisian-inspired design elements
- 🎮 **Interactive Mascots** - Sector-specific mascot variations
- 🏅 **Achievement System** - Unlock celebrations and progress tracking
- 🔄 **Theme Persistence** - Remembers user preferences across sessions

### Technical Features
- ⚡ **Performance Optimized** - Smooth animations and fast loading
- 💾 **Offline Support** - Local data persistence and caching
- 🔒 **Secure Storage** - Encrypted user preferences and data
- 🧪 **Comprehensive Testing** - Full test coverage for reliability

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

#### Basic Commands
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator (macOS only)
- `npm run web` - Run in web browser
- `npm run clean` - Clear Expo cache

#### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

#### Testing
- `npm run test:enhanced` - Run enhanced feature tests
- `npm run test:comprehensive` - Run comprehensive test suite
- `npm run test:user-flows` - Test user interaction flows
- `npm run test:performance` - Run performance tests
- `npm run test:compatibility` - Test backward compatibility

#### Development Tools
- `npm run dev` - Start development with hot reload
- `npm run full-stack` - Start full-stack development environment

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── chat/            # Chat interface components
│   ├── common/          # Common UI components
│   ├── dashboard/       # Dashboard-specific components
│   ├── gamification/    # Achievement and progress components
│   ├── language/        # Language switching components
│   ├── layout/          # Layout and navigation components
│   ├── mascot/          # 3D mascot components
│   ├── navigation/      # Navigation components
│   └── search/          # Search interface components
├── contexts/            # React context providers
│   ├── ThemeContext.tsx # Theme management
│   ├── MascotContext.tsx# Mascot state management
│   └── RTLContext.tsx   # RTL/language support
├── screens/             # Screen components
│   ├── ProfileScreen.tsx        # Enhanced profile screen
│   ├── PersonalInfoScreen.tsx   # Personal information
│   ├── PreferencesScreen.tsx    # User preferences
│   ├── AchievementsScreen.tsx   # Achievements display
│   └── MascotDemoScreen.tsx     # Mascot interactions
├── navigation/          # Navigation configuration
├── services/            # API services and data fetching
├── hooks/               # Custom React hooks
│   └── useMascotInteractions.ts # Mascot interaction hooks
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
│   └── mascot.ts        # Mascot-related types
├── store/               # State management
├── tests/               # Test files
└── config/              # Configuration files
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

## Enhanced Features Guide

### Theme System
The app includes a comprehensive theming system with:

```typescript
import { useTheme, createThemedStyles } from './src/contexts/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  const styles = createThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background,
      padding: 16,
    },
    text: {
      color: theme.colors.text,
      fontSize: 16,
    },
  }));
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Themed content</Text>
    </View>
  );
}
```

### Mascot Integration
Interactive 3D mascots with cultural elements:

```typescript
import { useMascot } from './src/contexts/MascotContext';
import { TunisianMascot3D } from './src/components/mascot';

function ProfileScreen() {
  const { mascotState, updateSector, triggerInteraction } = useMascot();
  
  return (
    <TunisianMascot3D
      sector={mascotState.currentSector}
      emotion={mascotState.currentEmotion}
      onInteraction={(type) => triggerInteraction(type)}
    />
  );
}
```

### RTL/Language Support
Seamless language switching with layout adaptation:

```typescript
import { useRTL } from './src/contexts/RTLContext';

function MyComponent() {
  const { isRTL, currentLanguage, setLanguage, getTextAlign } = useRTL();
  
  const styles = StyleSheet.create({
    text: {
      textAlign: getTextAlign(),
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
  });
  
  return <Text style={styles.text}>Content</Text>;
}
```

### Gamification System
Achievement tracking and progress visualization:

```typescript
import { AchievementBadge, ProgressTracker } from './src/components/gamification';

function AchievementsScreen() {
  return (
    <View>
      <ProgressTracker 
        current={75} 
        total={100} 
        label="Profile Completion" 
      />
      <AchievementBadge
        title="Legal Expert"
        description="Completed 50 legal queries"
        isUnlocked={true}
      />
    </View>
  );
}
```

## Architecture

The app follows a modular architecture with:

### Core Technologies
- **React Native & Expo** - Cross-platform mobile development
- **TypeScript** - Type safety and better developer experience
- **React Native Skia** - High-performance 3D mascot rendering
- **AsyncStorage** - Local data persistence and caching

### State Management
- **React Context** - Global state management for themes, mascots, and RTL
- **Custom Hooks** - Reusable logic for mascot interactions and theming
- **Local Storage** - Persistent user preferences and customizations

### UI/UX Architecture
- **Context-Driven Theming** - Dynamic theme switching with persistence
- **Cultural Design System** - Tunisian-inspired colors and typography
- **Responsive Layouts** - RTL/LTR support with proper text alignment
- **Animation System** - Smooth transitions and micro-interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.