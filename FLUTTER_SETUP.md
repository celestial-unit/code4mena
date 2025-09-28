# Flutter Installation Guide for Code4Mena Legal Assistant

## Quick Demo (No Flutter Required)

**Try the web demo immediately:**
```bash
# Start the web demo (in a new terminal)
cd web_demo
python3 serve.py

# Then open http://localhost:3000 in your browser
```

## Flutter Installation Options

### Option 1: Using Snap (Recommended for Ubuntu)
```bash
# Install Flutter via Snap
sudo snap install flutter --classic

# Verify installation
flutter --version

# Accept Android licenses (if developing for Android)
flutter doctor --android-licenses
```

### Option 2: Manual Installation
```bash
# Download Flutter SDK
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.16.0-stable.tar.xz

# Extract Flutter
tar xf flutter_linux_3.16.0-stable.tar.xz

# Add to PATH (add this to your ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$HOME/flutter/bin"

# Reload shell
source ~/.bashrc

# Verify installation
flutter --version
```

### Option 3: Using Git
```bash
# Clone Flutter repository
cd ~
git clone https://github.com/flutter/flutter.git -b stable

# Add to PATH
export PATH="$PATH:$HOME/flutter/bin"

# Verify installation
flutter --version
```

## Post-Installation Setup

### 1. Run Flutter Doctor
```bash
flutter doctor
```

### 2. Install Android Studio (for Android development)
```bash
# Download from: https://developer.android.com/studio
# Or install via snap:
sudo snap install android-studio --classic
```

### 3. Install VS Code Flutter Extension
```bash
# Install VS Code
sudo snap install code --classic

# Install Flutter extension
code --install-extension Dart-Code.flutter
```

### 4. Set up Android SDK
```bash
# Accept Android licenses
flutter doctor --android-licenses

# Install Android SDK command-line tools
flutter doctor
```

## Running the Mobile App

Once Flutter is installed:

```bash
# Navigate to mobile app directory
cd mobile_app

# Get dependencies
flutter pub get

# Check for connected devices
flutter devices

# Run on web (easiest for testing)
flutter run -d web-server --web-port 8080

# Run on Android device/emulator
flutter run -d android

# Run on Chrome
flutter run -d chrome
```

## Troubleshooting

### Common Issues:

1. **Flutter command not found**
   ```bash
   # Make sure Flutter is in your PATH
   echo $PATH | grep flutter
   
   # If not, add to ~/.bashrc:
   echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Android licenses not accepted**
   ```bash
   flutter doctor --android-licenses
   # Accept all licenses by typing 'y'
   ```

3. **No devices available**
   ```bash
   # For web development:
   flutter config --enable-web
   
   # For Android emulator:
   # Start Android Studio > AVD Manager > Create Virtual Device
   ```

4. **Gradle issues**
   ```bash
   cd mobile_app/android
   ./gradlew clean
   cd ..
   flutter clean
   flutter pub get
   ```

## Alternative: Web Demo

If Flutter installation is complex, use our web demo:

```bash
# Terminal 1: Start backend API
./start.sh

# Terminal 2: Start web demo
cd web_demo
python3 serve.py

# Open http://localhost:3000 in browser
```

## Development Workflow

1. **Backend Development:**
   ```bash
   # Start backend services
   ./start.sh
   
   # View API docs
   open http://localhost:8001/docs
   ```

2. **Frontend Development:**
   ```bash
   # Option A: Flutter mobile app
   cd mobile_app
   flutter run -d web-server
   
   # Option B: Web demo
   cd web_demo
   python3 serve.py
   ```

3. **Full Stack Testing:**
   ```bash
   # Terminal 1: Backend
   ./start.sh
   
   # Terminal 2: Frontend
   cd mobile_app && flutter run -d chrome
   # OR
   cd web_demo && python3 serve.py
   ```

## Next Steps

1. **Try the web demo first** to test the system
2. **Install Flutter** when ready for mobile development
3. **Customize the mobile app** for your specific needs
4. **Deploy to production** using Docker containers

The web demo provides the same functionality as the mobile app and works immediately without any additional setup!