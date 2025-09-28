import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'core/app_config.dart';
import 'core/theme/app_theme.dart';
import 'core/localization/app_localizations.dart';
import 'core/services/storage_service.dart';
import 'core/services/api_service.dart';
import 'presentation/screens/splash_screen.dart';
import 'presentation/screens/home_screen.dart';
import 'presentation/screens/chat_screen.dart';
import 'presentation/screens/settings_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  await StorageService.initialize();
  
  // Initialize API service
  ApiService.initialize();
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  runApp(
    const ProviderScope(
      child: Code4MenaLegalApp(),
    ),
  );
}

class Code4MenaLegalApp extends ConsumerWidget {
  const Code4MenaLegalApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      
      // Theme
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      
      // Localization
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      
      // Routes
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/home': (context) => const HomeScreen(),
        '/chat': (context) => const ChatScreen(),
        '/settings': (context) => const SettingsScreen(),
      },
      
      // Global error handling
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaleFactor: 1.0, // Prevent text scaling issues
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}