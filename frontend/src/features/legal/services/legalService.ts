import apiService from '../../../shared/services/api';
import {
    LegalDocument,
    LegalCategory,
    LegalSearchResult,
    ApiResponse,
    PaginatedResponse
} from '../types';

/**
 * Legal Service for handling legal document queries and operations
 */
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
    ): Promise<ApiResponse<any[]>> {
        try {
            const params = new URLSearchParams({
                language,
                limit: limit.toString(),
                offset: offset.toString()
            });

            if (category) params.append('category', category);
            if (priority) params.append('priority', priority);

            const updates = await apiService.get<any[]>(`/api/v1/legal/updates?${params.toString()}`);

            return {
                success: true,
                data: updates,
                timestamp: new Date(),
                requestId: `legal-updates-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to fetch legal updates:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_UPDATES_ERROR',
                    message: 'Failed to fetch legal updates',
                    messageAr: 'فشل في جلب التحديثات القانونية',
                    messageFr: 'Échec de la récupération des mises à jour juridiques'
                },
                timestamp: new Date(),
                requestId: `legal-updates-error-${Date.now()}`
            };
        }
    }

    /**
     * Get legal categories
     */
    async getLegalCategories(language: string = 'ar'): Promise<ApiResponse<LegalCategory[]>> {
        try {
            const categories = await apiService.get<LegalCategory[]>(`/api/v1/legal/categories?language=${language}`);

            return {
                success: true,
                data: categories,
                timestamp: new Date(),
                requestId: `legal-categories-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to fetch legal categories:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_CATEGORIES_ERROR',
                    message: 'Failed to fetch legal categories',
                    messageAr: 'فشل في جلب الفئات القانونية',
                    messageFr: 'Échec de la récupération des catégories juridiques'
                },
                timestamp: new Date(),
                requestId: `legal-categories-error-${Date.now()}`
            };
        }
    }

    /**
     * Get legal documents with filtering
     */
    async getLegalDocuments(
        category?: string,
        language: string = 'ar',
        search?: string,
        limit: number = 10,
        offset: number = 0
    ): Promise<ApiResponse<LegalDocument[]>> {
        try {
            const params = new URLSearchParams({
                language,
                limit: limit.toString(),
                offset: offset.toString()
            });

            if (category) params.append('category', category);
            if (search) params.append('search', search);

            const documents = await apiService.get<LegalDocument[]>(`/api/v1/legal/documents?${params.toString()}`);

            return {
                success: true,
                data: documents,
                timestamp: new Date(),
                requestId: `legal-documents-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to fetch legal documents:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_DOCUMENTS_ERROR',
                    message: 'Failed to fetch legal documents',
                    messageAr: 'فشل في جلب الوثائق القانونية',
                    messageFr: 'Échec de la récupération des documents juridiques'
                },
                timestamp: new Date(),
                requestId: `legal-documents-error-${Date.now()}`
            };
        }
    }

    /**
     * Get a specific legal document by ID
     */
    async getLegalDocumentById(documentId: number): Promise<ApiResponse<LegalDocument>> {
        try {
            const document = await apiService.get<LegalDocument>(`/api/v1/legal/documents/${documentId}`);

            return {
                success: true,
                data: document,
                timestamp: new Date(),
                requestId: `legal-document-${documentId}-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to fetch legal document:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_DOCUMENT_ERROR',
                    message: 'Failed to fetch legal document',
                    messageAr: 'فشل في جلب الوثيقة القانونية',
                    messageFr: 'Échec de la récupération du document juridique'
                },
                timestamp: new Date(),
                requestId: `legal-document-error-${Date.now()}`
            };
        }
    }

    /**
     * Process legal query using natural language
     */
    async processLegalQuery(
        query: string,
        language: string = 'ar',
        userId?: string
    ): Promise<ApiResponse<any>> {
        try {
            const queryData = {
                query,
                language,
                user_id: userId
            };

            const response = await apiService.post<any>('/api/v1/legal/query', queryData);

            return {
                success: true,
                data: response,
                timestamp: new Date(),
                requestId: `legal-query-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to process legal query:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_QUERY_ERROR',
                    message: 'Failed to process legal query',
                    messageAr: 'فشل في معالجة الاستعلام القانوني',
                    messageFr: 'Échec du traitement de la requête juridique'
                },
                timestamp: new Date(),
                requestId: `legal-query-error-${Date.now()}`
            };
        }
    }

    /**
     * Search legal documents with similarity scoring
     */
    async searchLegalDocuments(
        query: string,
        category?: string,
        language: string = 'ar',
        limit: number = 10
    ): Promise<ApiResponse<LegalSearchResult[]>> {
        try {
            const params = new URLSearchParams({
                q: query,
                language,
                limit: limit.toString()
            });

            if (category) params.append('category', category);

            const results = await apiService.get<LegalSearchResult[]>(`/api/v1/legal/search?${params.toString()}`);

            return {
                success: true,
                data: results,
                timestamp: new Date(),
                requestId: `legal-search-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to search legal documents:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_SEARCH_ERROR',
                    message: 'Failed to search legal documents',
                    messageAr: 'فشل في البحث في الوثائق القانونية',
                    messageFr: 'Échec de la recherche dans les documents juridiques'
                },
                timestamp: new Date(),
                requestId: `legal-search-error-${Date.now()}`
            };
        }
    }

    /**
     * Get search suggestions
     */
    async getSearchSuggestions(
        query: string,
        language: string = 'ar',
        limit: number = 5
    ): Promise<ApiResponse<string[]>> {
        try {
            const params = new URLSearchParams({
                query,
                language,
                limit: limit.toString()
            });

            const suggestions = await apiService.get<string[]>(`/api/v1/legal/search-suggestions?${params.toString()}`);

            return {
                success: true,
                data: suggestions,
                timestamp: new Date(),
                requestId: `legal-suggestions-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to get search suggestions:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_SUGGESTIONS_ERROR',
                    message: 'Failed to get search suggestions',
                    messageAr: 'فشل في جلب اقتراحات البحث',
                    messageFr: 'Échec de la récupération des suggestions de recherche'
                },
                timestamp: new Date(),
                requestId: `legal-suggestions-error-${Date.now()}`
            };
        }
    }

    /**
     * Get ministries and sources
     */
    async getMinistries(language: string = 'ar'): Promise<ApiResponse<any[]>> {
        try {
            const ministries = await apiService.get<any[]>(`/api/v1/legal/ministries?language=${language}`);

            return {
                success: true,
                data: ministries,
                timestamp: new Date(),
                requestId: `legal-ministries-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to fetch ministries:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_MINISTRIES_ERROR',
                    message: 'Failed to fetch ministries',
                    messageAr: 'فشل في جلب الوزارات',
                    messageFr: 'Échec de la récupération des ministères'
                },
                timestamp: new Date(),
                requestId: `legal-ministries-error-${Date.now()}`
            };
        }
    }

    /**
     * Get legal tags for filtering
     */
    async getLegalTags(
        language: string = 'ar',
        category?: string
    ): Promise<ApiResponse<any[]>> {
        try {
            const params = new URLSearchParams({ language });
            if (category) params.append('category', category);

            const tags = await apiService.get<any[]>(`/api/v1/legal/tags?${params.toString()}`);

            return {
                success: true,
                data: tags,
                timestamp: new Date(),
                requestId: `legal-tags-${Date.now()}`
            };
        } catch (error) {
            console.error('[Legal] Failed to fetch legal tags:', error);
            return {
                success: false,
                error: {
                    code: 'LEGAL_TAGS_ERROR',
                    message: 'Failed to fetch legal tags',
                    messageAr: 'فشل في جلب العلامات القانونية',
                    messageFr: 'Échec de la récupération des étiquettes juridiques'
                },
                timestamp: new Date(),
                requestId: `legal-tags-error-${Date.now()}`
            };
        }
    }
}

// Export singleton instance
export const legalService = LegalService.getInstance();