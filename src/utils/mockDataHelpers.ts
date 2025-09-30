import {
  LegalCategory,
  Sector,
  Language,
  Region,
  TunisianDialect,
  LegalUpdate,
  User,
  SearchResult,
} from '../types';

/**
 * Mock Data Helpers
 * Utility functions for working with mock data
 */

/**
 * Constants for mock data generation
 */
export const LEGAL_CATEGORIES: LegalCategory[] = [
  'business_law',
  'civil_law',
  'administrative_law',
  'labor_law',
  'tax_law',
  'family_law',
  'criminal_law',
  'constitutional_law',
  'commercial_law',
  'environmental_law',
];

export const SECTORS: Sector[] = [
  'money',
  'food',
  'agriculture',
  'business',
  'tourism',
  'education',
  'healthcare',
  'technology',
  'manufacturing',
  'services',
];

export const LANGUAGES: Language[] = ['ar', 'fr', 'en', 'ar-tn'];

export const REGIONS: Region[] = [
  'tunis',
  'ariana',
  'ben_arous',
  'manouba',
  'nabeul',
  'zaghouan',
  'bizerte',
  'beja',
  'jendouba',
  'kef',
  'siliana',
  'sousse',
  'monastir',
  'mahdia',
  'sfax',
  'kairouan',
  'kasserine',
  'sidi_bouzid',
  'gabes',
  'medenine',
  'tataouine',
  'gafsa',
  'tozeur',
  'kebili',
];

export const TUNISIAN_DIALECTS: TunisianDialect[] = [
  'tunis',
  'sfax',
  'sousse',
  'kairouan',
  'bizerte',
  'gabes',
  'gafsa',
  'standard',
];

/**
 * Localization helpers
 */
export const CATEGORY_TRANSLATIONS: Record<
  LegalCategory,
  { ar: string; fr: string; en: string }
> = {
  business_law: {
    ar: 'قانون الأعمال',
    fr: 'Droit des affaires',
    en: 'Business Law',
  },
  civil_law: { ar: 'القانون المدني', fr: 'Droit civil', en: 'Civil Law' },
  administrative_law: {
    ar: 'القانون الإداري',
    fr: 'Droit administratif',
    en: 'Administrative Law',
  },
  labor_law: { ar: 'قانون العمل', fr: 'Droit du travail', en: 'Labor Law' },
  tax_law: { ar: 'القانون الضريبي', fr: 'Droit fiscal', en: 'Tax Law' },
  family_law: {
    ar: 'قانون الأسرة',
    fr: 'Droit de la famille',
    en: 'Family Law',
  },
  criminal_law: {
    ar: 'القانون الجنائي',
    fr: 'Droit pénal',
    en: 'Criminal Law',
  },
  constitutional_law: {
    ar: 'القانون الدستوري',
    fr: 'Droit constitutionnel',
    en: 'Constitutional Law',
  },
  commercial_law: {
    ar: 'القانون التجاري',
    fr: 'Droit commercial',
    en: 'Commercial Law',
  },
  environmental_law: {
    ar: 'القانون البيئي',
    fr: "Droit de l'environnement",
    en: 'Environmental Law',
  },
};

export const SECTOR_TRANSLATIONS: Record<
  Sector,
  { ar: string; fr: string; en: string }
> = {
  money: { ar: 'المال', fr: 'Argent', en: 'Money' },
  food: { ar: 'الغذاء', fr: 'Alimentation', en: 'Food' },
  agriculture: { ar: 'الزراعة', fr: 'Agriculture', en: 'Agriculture' },
  business: { ar: 'الأعمال', fr: 'Affaires', en: 'Business' },
  tourism: { ar: 'السياحة', fr: 'Tourisme', en: 'Tourism' },
  education: { ar: 'التعليم', fr: 'Éducation', en: 'Education' },
  healthcare: { ar: 'الصحة', fr: 'Santé', en: 'Healthcare' },
  technology: { ar: 'التكنولوجيا', fr: 'Technologie', en: 'Technology' },
  manufacturing: { ar: 'التصنيع', fr: 'Fabrication', en: 'Manufacturing' },
  services: { ar: 'الخدمات', fr: 'Services', en: 'Services' },
};

export const REGION_TRANSLATIONS: Record<
  Region,
  { ar: string; fr: string; en: string }
> = {
  tunis: { ar: 'تونس', fr: 'Tunis', en: 'Tunis' },
  ariana: { ar: 'أريانة', fr: 'Ariana', en: 'Ariana' },
  ben_arous: { ar: 'بن عروس', fr: 'Ben Arous', en: 'Ben Arous' },
  manouba: { ar: 'منوبة', fr: 'Manouba', en: 'Manouba' },
  nabeul: { ar: 'نابل', fr: 'Nabeul', en: 'Nabeul' },
  zaghouan: { ar: 'زغوان', fr: 'Zaghouan', en: 'Zaghouan' },
  bizerte: { ar: 'بنزرت', fr: 'Bizerte', en: 'Bizerte' },
  beja: { ar: 'باجة', fr: 'Béja', en: 'Beja' },
  jendouba: { ar: 'جندوبة', fr: 'Jendouba', en: 'Jendouba' },
  kef: { ar: 'الكاف', fr: 'Le Kef', en: 'Kef' },
  siliana: { ar: 'سليانة', fr: 'Siliana', en: 'Siliana' },
  sousse: { ar: 'سوسة', fr: 'Sousse', en: 'Sousse' },
  monastir: { ar: 'المنستير', fr: 'Monastir', en: 'Monastir' },
  mahdia: { ar: 'المهدية', fr: 'Mahdia', en: 'Mahdia' },
  sfax: { ar: 'صفاقس', fr: 'Sfax', en: 'Sfax' },
  kairouan: { ar: 'القيروان', fr: 'Kairouan', en: 'Kairouan' },
  kasserine: { ar: 'القصرين', fr: 'Kasserine', en: 'Kasserine' },
  sidi_bouzid: { ar: 'سيدي بوزيد', fr: 'Sidi Bouzid', en: 'Sidi Bouzid' },
  gabes: { ar: 'قابس', fr: 'Gabès', en: 'Gabes' },
  medenine: { ar: 'مدنين', fr: 'Médenine', en: 'Medenine' },
  tataouine: { ar: 'تطاوين', fr: 'Tataouine', en: 'Tataouine' },
  gafsa: { ar: 'قفصة', fr: 'Gafsa', en: 'Gafsa' },
  tozeur: { ar: 'توزر', fr: 'Tozeur', en: 'Tozeur' },
  kebili: { ar: 'قبلي', fr: 'Kébili', en: 'Kebili' },
};

/**
 * Data generation utilities
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

export function generateRandomDate(daysBack: number = 30): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  return new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
}

export function generateRandomId(prefix: string = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Text generation utilities
 */
export function generateLoremIpsum(wordCount: number = 50): string {
  const words = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'enim',
    'ad',
    'minim',
    'veniam',
    'quis',
    'nostrud',
    'exercitation',
    'ullamco',
    'laboris',
    'nisi',
    'aliquip',
    'ex',
    'ea',
    'commodo',
    'consequat',
    'duis',
    'aute',
    'irure',
    'in',
    'reprehenderit',
    'voluptate',
    'velit',
    'esse',
    'cillum',
    'fugiat',
    'nulla',
    'pariatur',
    'excepteur',
    'sint',
    'occaecat',
    'cupidatat',
    'non',
    'proident',
    'sunt',
    'culpa',
    'qui',
    'officia',
    'deserunt',
    'mollit',
    'anim',
    'id',
    'est',
    'laborum',
  ];

  const result = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(getRandomElement(words));
  }

  return result.join(' ');
}

export function generateArabicText(wordCount: number = 20): string {
  const words = [
    'القانون',
    'التونسي',
    'الأعمال',
    'الشركة',
    'التسجيل',
    'الضرائب',
    'الإجراءات',
    'الوثائق',
    'المتطلبات',
    'الامتثال',
    'اللوائح',
    'الحكومة',
    'الوزارة',
    'المركز',
    'الخدمات',
    'التطبيق',
    'النظام',
    'المنصة',
    'الرقمية',
    'الإلكترونية',
    'التجارة',
    'الصناعة',
    'الزراعة',
    'السياحة',
    'التعليم',
    'الصحة',
    'البيئة',
    'العمل',
    'الموظفين',
    'أصحاب',
    'المؤسسات',
    'التعاونيات',
    'الجمعيات',
  ];

  const result = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(getRandomElement(words));
  }

  return result.join(' ');
}

export function generateFrenchText(wordCount: number = 20): string {
  const words = [
    'droit',
    'tunisien',
    'affaires',
    'entreprise',
    'enregistrement',
    'taxes',
    'procédures',
    'documents',
    'exigences',
    'conformité',
    'réglementations',
    'gouvernement',
    'ministère',
    'centre',
    'services',
    'application',
    'système',
    'plateforme',
    'numérique',
    'électronique',
    'commerce',
    'industrie',
    'agriculture',
    'tourisme',
    'éducation',
    'santé',
    'environnement',
    'travail',
    'employés',
    'employeurs',
    'institutions',
    'coopératives',
    'associations',
  ];

  const result = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(getRandomElement(words));
  }

  return result.join(' ');
}

/**
 * Localization utilities
 */
export function translateCategory(
  category: LegalCategory,
  language: Language
): string {
  const translations = CATEGORY_TRANSLATIONS[category];
  switch (language) {
    case 'ar':
    case 'ar-tn':
      return translations.ar;
    case 'fr':
      return translations.fr;
    case 'en':
    default:
      return translations.en;
  }
}

export function translateSector(sector: Sector, language: Language): string {
  const translations = SECTOR_TRANSLATIONS[sector];
  switch (language) {
    case 'ar':
    case 'ar-tn':
      return translations.ar;
    case 'fr':
      return translations.fr;
    case 'en':
    default:
      return translations.en;
  }
}

export function translateRegion(region: Region, language: Language): string {
  const translations = REGION_TRANSLATIONS[region];
  switch (language) {
    case 'ar':
    case 'ar-tn':
      return translations.ar;
    case 'fr':
      return translations.fr;
    case 'en':
    default:
      return translations.en;
  }
}

/**
 * Data filtering utilities
 */
export function filterLegalUpdatesByCategory(
  updates: LegalUpdate[],
  categories: LegalCategory[]
): LegalUpdate[] {
  if (categories.length === 0) return updates;
  return updates.filter(update => categories.includes(update.category));
}

export function filterLegalUpdatesBySector(
  updates: LegalUpdate[],
  sectors: Sector[]
): LegalUpdate[] {
  if (sectors.length === 0) return updates;
  return updates.filter(update =>
    update.sectors.some(sector => sectors.includes(sector))
  );
}

export function filterLegalUpdatesByPriority(
  updates: LegalUpdate[],
  priorities: ('high' | 'medium' | 'low')[]
): LegalUpdate[] {
  if (priorities.length === 0) return updates;
  return updates.filter(update => priorities.includes(update.priority));
}

export function filterUsersByRegion(users: User[], regions: Region[]): User[] {
  if (regions.length === 0) return users;
  return users.filter(user => regions.includes(user.profile.region));
}

export function filterSearchResultsByType(
  results: SearchResult[],
  types: string[]
): SearchResult[] {
  if (types.length === 0) return results;
  return results.filter(result => types.includes(result.type));
}

/**
 * Data sorting utilities
 */
export function sortLegalUpdatesByDate(
  updates: LegalUpdate[],
  order: 'asc' | 'desc' = 'desc'
): LegalUpdate[] {
  return [...updates].sort((a, b) => {
    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

export function sortLegalUpdatesByPriority(
  updates: LegalUpdate[],
  order: 'asc' | 'desc' = 'desc'
): LegalUpdate[] {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return [...updates].sort((a, b) => {
    const priorityA = priorityOrder[a.priority];
    const priorityB = priorityOrder[b.priority];
    return order === 'desc' ? priorityB - priorityA : priorityA - priorityB;
  });
}

export function sortSearchResultsByRelevance(
  results: SearchResult[],
  order: 'asc' | 'desc' = 'desc'
): SearchResult[] {
  return [...results].sort((a, b) => {
    return order === 'desc'
      ? b.relevanceScore - a.relevanceScore
      : a.relevanceScore - b.relevanceScore;
  });
}

/**
 * Data validation utilities
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  // Tunisian phone number format: +216 XX XXX XXX
  const phoneRegex = /^\+216\s?\d{2}\s?\d{3}\s?\d{3}$/;
  return phoneRegex.test(phone);
}

export function isValidCategory(category: string): category is LegalCategory {
  return LEGAL_CATEGORIES.includes(category as LegalCategory);
}

export function isValidSector(sector: string): sector is Sector {
  return SECTORS.includes(sector as Sector);
}

export function isValidLanguage(language: string): language is Language {
  return LANGUAGES.includes(language as Language);
}

export function isValidRegion(region: string): region is Region {
  return REGIONS.includes(region as Region);
}

/**
 * Mock data statistics utilities
 */
export function calculateLegalUpdateStats(updates: LegalUpdate[]) {
  const stats = {
    total: updates.length,
    byCategory: {} as Record<LegalCategory, number>,
    bySector: {} as Record<Sector, number>,
    byPriority: { high: 0, medium: 0, low: 0 },
    byImpactLevel: { critical: 0, high: 0, medium: 0, low: 0 },
    averageAge: 0,
    bookmarked: 0,
    read: 0,
  };

  updates.forEach(update => {
    // Category stats
    stats.byCategory[update.category] =
      (stats.byCategory[update.category] || 0) + 1;

    // Sector stats
    update.sectors.forEach(sector => {
      stats.bySector[sector] = (stats.bySector[sector] || 0) + 1;
    });

    // Priority stats
    stats.byPriority[update.priority]++;

    // Impact level stats
    stats.byImpactLevel[update.impactLevel]++;

    // Bookmark and read stats
    if (update.isBookmarked) stats.bookmarked++;
    if (update.readStatus === 'read') stats.read++;
  });

  // Calculate average age
  if (updates.length > 0) {
    const totalAge = updates.reduce((sum, update) => {
      const age = Date.now() - new Date(update.publishedAt).getTime();
      return sum + age;
    }, 0);
    stats.averageAge = totalAge / updates.length / (1000 * 60 * 60 * 24); // in days
  }

  return stats;
}

export function calculateUserEngagementStats(users: User[]) {
  const stats = {
    total: users.length,
    verified: 0,
    byRegion: {} as Record<Region, number>,
    byExperienceLevel: { beginner: 0, intermediate: 0, advanced: 0, expert: 0 },
    averageSessionDuration: 0,
    totalAchievements: 0,
    totalPoints: 0,
    activeUsers: 0, // active in last 7 days
  };

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  users.forEach(user => {
    if (user.isVerified) stats.verified++;

    stats.byRegion[user.profile.region] =
      (stats.byRegion[user.profile.region] || 0) + 1;
    stats.byExperienceLevel[user.profile.experienceLevel]++;

    stats.averageSessionDuration += user.statistics.averageSessionDuration;
    stats.totalAchievements += user.statistics.totalAchievements;
    stats.totalPoints += user.statistics.totalPoints;

    if (new Date(user.lastActiveAt).getTime() > sevenDaysAgo) {
      stats.activeUsers++;
    }
  });

  if (users.length > 0) {
    stats.averageSessionDuration /= users.length;
  }

  return stats;
}

/**
 * Development and testing utilities
 */
export function createTestDataSet(
  size: 'small' | 'medium' | 'large' = 'medium'
) {
  const sizes = {
    small: { updates: 10, users: 5, conversations: 8 },
    medium: { updates: 50, users: 20, conversations: 30 },
    large: { updates: 200, users: 100, conversations: 150 },
  };

  const config = sizes[size];

  return {
    legalUpdates: config.updates,
    users: config.users,
    conversations: config.conversations,
    searchResults: Math.floor(config.updates * 1.5),
    mascots: SECTORS.length,
  };
}

export function generateMockDataSeed(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function resetMockDataWithSeed(seed: string): void {
  // In a real implementation, this would use the seed to generate consistent mock data
  console.log(`Resetting mock data with seed: ${seed}`);
}
