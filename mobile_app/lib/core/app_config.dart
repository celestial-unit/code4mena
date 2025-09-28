/// Application configuration and constants
class AppConfig {
  static const String appName = 'Code4Mena Legal Assistant';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Privacy-first legal assistant for Tunisian citizens';
  
  // API Configuration
  static const String baseUrl = 'http://localhost:8000';
  static const String apiVersion = 'v1';
  static const Duration apiTimeout = Duration(seconds: 30);
  
  // Privacy Settings
  static const bool enableAnalytics = false; // Privacy-first approach
  static const bool enableCrashReporting = false;
  static const Duration dataRetentionPeriod = Duration(days: 30);
  
  // UI Configuration
  static const int maxMessageLength = 1000;
  static const int maxChatHistory = 50;
  static const Duration animationDuration = Duration(milliseconds: 300);
  
  // Legal Categories
  static const Map<String, Map<String, String>> legalCategories = {
    'business_law': {
      'ar': 'قانون الأعمال',
      'fr': 'Droit des Affaires',
      'en': 'Business Law',
      'icon': '💼',
      'color': '#2E86AB',
    },
    'civil_law': {
      'ar': 'القانون المدني',
      'fr': 'Droit Civil',
      'en': 'Civil Law',
      'icon': '⚖️',
      'color': '#A23B72',
    },
    'administrative_law': {
      'ar': 'القانون الإداري',
      'fr': 'Droit Administratif',
      'en': 'Administrative Law',
      'icon': '🏛️',
      'color': '#F18F01',
    },
    'labor_law': {
      'ar': 'قانون العمل',
      'fr': 'Droit du Travail',
      'en': 'Labor Law',
      'icon': '👷',
      'color': '#C73E1D',
    },
    'tax_law': {
      'ar': 'القانون الضريبي',
      'fr': 'Droit Fiscal',
      'en': 'Tax Law',
      'icon': '💰',
      'color': '#592E83',
    },
    'family_law': {
      'ar': 'قانون الأسرة',
      'fr': 'Droit de la Famille',
      'en': 'Family Law',
      'icon': '👨‍👩‍👧‍👦',
      'color': '#0B6E4F',
    },
  };
  
  // Supported Languages
  static const List<Map<String, String>> supportedLanguages = [
    {
      'code': 'ar',
      'name': 'العربية',
      'nativeName': 'العربية',
      'flag': '🇹🇳',
    },
    {
      'code': 'fr',
      'name': 'Français',
      'nativeName': 'Français',
      'flag': '🇫🇷',
    },
    {
      'code': 'en',
      'name': 'English',
      'nativeName': 'English',
      'flag': '🇺🇸',
    },
  ];
  
  // Sample Queries for Quick Start
  static const Map<String, List<String>> sampleQueries = {
    'ar': [
      'كيف يمكنني تأسيس شركة صغيرة في تونس؟',
      'ما هي الوثائق المطلوبة لفتح مقهى؟',
      'كيف أحسب الضرائب على دخلي؟',
      'ما هي حقوقي كعامل في القطاع الخاص؟',
      'كيف أسجل عقد زواج؟',
    ],
    'fr': [
      'Comment créer une petite entreprise en Tunisie?',
      'Quels documents sont nécessaires pour ouvrir un café?',
      'Comment calculer les impôts sur mon revenu?',
      'Quels sont mes droits en tant qu\'employé du secteur privé?',
      'Comment enregistrer un contrat de mariage?',
    ],
    'en': [
      'How can I start a small business in Tunisia?',
      'What documents are required to open a café?',
      'How do I calculate taxes on my income?',
      'What are my rights as a private sector employee?',
      'How do I register a marriage contract?',
    ],
  };
  
  // Privacy Disclaimers
  static const Map<String, String> privacyDisclaimers = {
    'ar': '''تنبيه الخصوصية: نحن نحمي خصوصيتك. يتم إزالة جميع المعلومات الشخصية من استفساراتك قبل المعالجة. لا نحتفظ بأي بيانات شخصية.

تنبيه قانوني: هذه المعلومات للإرشاد العام فقط ولا تشكل استشارة قانونية. يُنصح بالتشاور مع محامٍ مؤهل للحصول على مشورة قانونية محددة.''',
    
    'fr': '''Avis de confidentialité: Nous protégeons votre vie privée. Toutes les informations personnelles sont supprimées de vos requêtes avant traitement. Nous ne conservons aucune donnée personnelle.

Avertissement légal: Ces informations sont fournies à titre indicatif uniquement et ne constituent pas un conseil juridique. Il est recommandé de consulter un avocat qualifié pour obtenir des conseils juridiques spécifiques.''',
    
    'en': '''Privacy Notice: We protect your privacy. All personal information is removed from your queries before processing. We do not retain any personal data.

Legal Disclaimer: This information is provided for general guidance only and does not constitute legal advice. It is recommended to consult with a qualified lawyer for specific legal advice.''',
  };
  
  // App Colors (Tunisian Theme)
  static const Map<String, int> appColors = {
    'primary': 0xFF2E86AB,      // Tunisian Blue
    'secondary': 0xFFE63946,    // Tunisian Red
    'accent': 0xFFF77F00,       // Tunisian Orange
    'background': 0xFFFCFCFC,   // Light Background
    'surface': 0xFFFFFFFF,      // White Surface
    'text': 0xFF2D3748,         // Dark Text
    'textSecondary': 0xFF718096, // Secondary Text
    'border': 0xFFE2E8F0,       // Light Border
    'success': 0xFF38A169,      // Success Green
    'warning': 0xFFD69E2E,      // Warning Yellow
    'error': 0xFFE53E3E,        // Error Red
  };
}