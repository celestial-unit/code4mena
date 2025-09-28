import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';

import '../../core/app_config.dart';
import '../widgets/category_card.dart';
import '../widgets/quick_actions.dart';
import '../widgets/privacy_banner.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: AppConfig.animationDuration,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentLanguage = ref.watch(languageProvider);
    final isDarkMode = ref.watch(themeProvider);
    
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SlideTransition(
            position: _slideAnimation,
            child: CustomScrollView(
              slivers: [
                // App Bar
                SliverAppBar(
                  expandedHeight: 200,
                  floating: false,
                  pinned: true,
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  flexibleSpace: FlexibleSpaceBar(
                    title: Text(
                      _getLocalizedText('app_title', currentLanguage),
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    background: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Theme.of(context).colorScheme.primary,
                            Theme.of(context).colorScheme.secondary,
                          ],
                        ),
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 40),
                            // Tunisian-themed animation or icon
                            Container(
                              width: 80,
                              height: 80,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(40),
                              ),
                              child: const Icon(
                                Icons.balance,
                                size: 40,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _getLocalizedText('welcome_message', currentLanguage),
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 16,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.settings, color: Colors.white),
                      onPressed: () => Navigator.pushNamed(context, '/settings'),
                    ),
                  ],
                ),

                // Privacy Banner
                const SliverToBoxAdapter(
                  child: PrivacyBanner(),
                ),

                // Quick Actions
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getLocalizedText('quick_actions', currentLanguage),
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        const QuickActions(),
                      ],
                    ),
                  ),
                ),

                // Legal Categories
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _getLocalizedText('legal_categories', currentLanguage),
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ),
                  ),
                ),

                // Categories Grid
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  sliver: SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 1.2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final categories = AppConfig.legalCategories.keys.toList();
                        final categoryKey = categories[index];
                        final category = AppConfig.legalCategories[categoryKey]!;
                        
                        return CategoryCard(
                          title: category[currentLanguage] ?? category['en']!,
                          icon: category['icon']!,
                          color: Color(int.parse(category['color']!.substring(1), radix: 16) + 0xFF000000),
                          onTap: () => _navigateToChat(categoryKey),
                        );
                      },
                      childCount: AppConfig.legalCategories.length,
                    ),
                  ),
                ),

                // Bottom Spacing
                const SliverToBoxAdapter(
                  child: SizedBox(height: 32),
                ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _navigateToChat(null),
        backgroundColor: Theme.of(context).colorScheme.primary,
        icon: const Icon(Icons.chat, color: Colors.white),
        label: Text(
          _getLocalizedText('start_chat', currentLanguage),
          style: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  void _navigateToChat(String? category) {
    Navigator.pushNamed(
      context,
      '/chat',
      arguments: {'category': category},
    );
  }

  String _getLocalizedText(String key, String language) {
    final texts = {
      'app_title': {
        'ar': 'المساعد القانوني',
        'fr': 'Assistant Juridique',
        'en': 'Legal Assistant',
      },
      'welcome_message': {
        'ar': 'مساعدك القانوني الذكي للمواطنين التونسيين',
        'fr': 'Votre assistant juridique intelligent pour les citoyens tunisiens',
        'en': 'Your smart legal assistant for Tunisian citizens',
      },
      'quick_actions': {
        'ar': 'إجراءات سريعة',
        'fr': 'Actions Rapides',
        'en': 'Quick Actions',
      },
      'legal_categories': {
        'ar': 'المجالات القانونية',
        'fr': 'Domaines Juridiques',
        'en': 'Legal Categories',
      },
      'start_chat': {
        'ar': 'ابدأ المحادثة',
        'fr': 'Commencer',
        'en': 'Start Chat',
      },
    };

    return texts[key]?[language] ?? texts[key]?['en'] ?? key;
  }
}