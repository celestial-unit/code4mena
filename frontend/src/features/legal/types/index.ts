// Re-export types from shared types
export * from '../../../shared/types/legal';

// Additional legal feature specific types
export interface LegalQuery {
    id: string;
    query: string;
    language: 'ar' | 'fr' | 'en';
    userId?: string;
    timestamp: Date;
    response?: LegalResponse;
}

export interface LegalResponse {
    response: string;
    sources: LegalSource[];
    disclaimer: string;
    queryId: string;
    confidence?: number;
    processingTime?: number;
}

export interface LegalSource {
    article: string;
    title: string;
    source: string;
    url?: string;
    relevanceScore: number;
}

export interface LegalDocument {
    id: number;
    title: string;
    content: string;
    documentType: string;
    source: string;
    language: string;
    publishedAt: Date;
    lastUpdated: Date;
    category: LegalCategory;
    tags: string[];
    url?: string;
}

export interface LegalSearchResult {
    id: number;
    title: string;
    excerpt: string;
    source: string;
    category: LegalCategory;
    relevanceScore: number;
    publishedAt: Date;
    url?: string;
}

export interface LegalCategory {
    id: string;
    name: string;
    nameAr: string;
    nameFr: string;
    description: string;
    descriptionAr: string;
    descriptionFr: string;
    count: number;
    icon?: string;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        messageAr?: string;
        messageFr?: string;
    };
    timestamp: Date;
    requestId: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
}