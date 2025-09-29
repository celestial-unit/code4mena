/**
 * Legal Service - Frontend service for legal data operations
 */

import { apiClient } from './api';

export interface LegalUpdate {
    id: string;
    title: string;
    titleAr: string;
    titleFr: string;
    content: string;
    contentAr: string;
    contentFr: string;
    summary: string;
    summaryAr: string;
    summaryFr: string;
    category: string;
    priority: string;
    source: {
        id: string;
        name: string;
        nameAr: string;
        nameFr: string;
        type: string;
        url: string;
        credibilityScore: number;
        lastUpdated: string;
    };
    publishedAt: string;
    effectiveDate: string;
    tags: string[];
    tagsAr: string[];
    tagsFr: string[];
    impactLevel: string;
    sectors: string[];
    ministryId: string;
    isBookmarked: boolean;
    readStatus: string;
}

export interface LegalCategory {
    id: string;
    name: string;
    description: string;
}

export interface Ministry {
    id: string;
    name: string;
    url: string;
    type: string;
}

export interface LegalTag {
    id: string;
    name: string;
    category: string;
}

export class LegalService {
    private static instance: LegalService;

    private constructor() { }

    public static getInstance(): LegalService {
        if (!LegalService.instance) {
            LegalService.instance = new LegalService();
        }
        return LegalService.instance;
    }

    /**
     * Get legal updates with filtering and pagination
     */
    async getLegalUpdates(
        category?: string,
        priority?: string,
        language: string = 'ar',
        limit: number = 10,
        offset: number = 0
    ): Promise<LegalUpdate[]> {
        try {
            const response = await apiClient.get('/legal/updates', {
                params: {
                    category,
                    priority,
                    language,
                    limit,
                    offset
                }
            });

            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch legal updates:', error);
            return [];
        }
    }

    /**
     * Get a specific legal update by ID
     */
    async getLegalUpdateById(
        updateId: string,
        language: string = 'ar'
    ): Promise<LegalUpdate | null> {
        try {
            const response = await apiClient.get(`/legal/updates/${updateId}`, {
                params: { language }
            });

            return response.data || null;
        } catch (error) {
            console.error('Failed to fetch legal update:', error);
            return null;
        }
    }

    /**
     * Get available legal categories
     */
    async getLegalCategories(language: string = 'ar'): Promise<LegalCategory[]> {
        try {
            const response = await apiClient.get('/legal/categories', {
                params: { language }
            });

            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch legal categories:', error);
            return [];
        }
    }

    /**
     * Get list of government ministries and sources
     */
    async getMinistries(language: string = 'ar'): Promise<Ministry[]> {
        try {
            const response = await apiClient.get('/legal/ministries', {
                params: { language }
            });

            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch ministries:', error);
            return [];
        }
    }

    /**
     * Get available legal tags for filtering
     */
    async getLegalTags(
        language: string = 'ar',
        category?: string
    ): Promise<LegalTag[]> {
        try {
            const response = await apiClient.get('/legal/tags', {
                params: { language, category }
            });

            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch legal tags:', error);
            return [];
        }
    }

    /**
     * Process a legal query using natural language
     */
    async processLegalQuery(
        query: string,
        language: string = 'ar',
        category?: string
    ): Promise<any> {
        try {
            const response = await apiClient.post('/legal/query', {
                query,
                language,
                category
            });

            return response.data || null;
        } catch (error) {
            console.error('Failed to process legal query:', error);
            return null;
        }
    }

    /**
     * Search legal documents
     */
    async searchLegalDocuments(
        query: string,
        category?: string,
        language: string = 'ar',
        limit: number = 10
    ): Promise<any[]> {
        try {
            const response = await apiClient.get('/legal/search', {
                params: {
                    q: query,
                    category,
                    language,
                    limit
                }
            });

            return response.data || [];
        } catch (error) {
            console.error('Failed to search legal documents:', error);
            return [];
        }
    }
}

// Export singleton instance
export const legalService = LegalService.getInstance();