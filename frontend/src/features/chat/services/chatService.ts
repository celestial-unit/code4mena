import {
    ChatConversation,
    ChatMessage,
    QuickReply,
    LegalCategory,
    ApiResponse,
    ChatMascotAnimation,
    LegalReference,
    SuggestedAction
} from '../types';
import { mockDataService } from './mockDataService';

// Import mock data
import quickRepliesData from '../data/mock/quick-replies.json';
import chatConversationsData from '../data/mock/chat-conversations.json';

/**
 * Chat Service
 * Handles chat conversations, AI responses, and related functionality
 */
export class ChatService {
    private static instance: ChatService;
    private readonly baseDelay = 800; // Base delay for AI responses
    private readonly maxDelay = 3000; // Maximum delay for complex responses

    private constructor() { }

    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    /**
     * Simulate AI thinking time based on message complexity
     */
    private async simulateAIThinking(message: string): Promise<void> {
        const wordCount = message.split(' ').length;
        const complexity = wordCount > 20 ? 'complex' : wordCount > 10 ? 'medium' : 'simple';

        const delays = {
            simple: this.baseDelay,
            medium: this.baseDelay * 1.5,
            complex: this.baseDelay * 2.5
        };

        const delay = delays[complexity] + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Get quick replies for a specific category
     */
    async getQuickReplies(category: LegalCategory): Promise<ApiResponse<QuickReply[]>> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const categoryReplies = (quickRepliesData as QuickReply[])
            .filter(reply => reply.category === category)
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 8);

        return {
            success: true,
            data: categoryReplies,
            timestamp: new Date(),
            requestId: `quick-replies-${Date.now()}`
        };
    }

    /**
     * Generate AI response based on user message and context
     */
    async generateAIResponse(
        userMessage: string,
        conversationId: string,
        category: LegalCategory
    ): Promise<ChatMessage> {
        await this.simulateAIThinking(userMessage);

        const response = this.createContextualResponse(userMessage, category);

        const aiMessage: ChatMessage = {
            id: `msg-${Date.now()}-ai`,
            conversationId,
            type: 'ai',
            content: response.content,
            contentAr: response.contentAr,
            contentFr: response.contentFr,
            timestamp: new Date(),
            isEdited: false,
            metadata: {
                confidence: response.confidence,
                sources: response.sources,
                processingTime: response.processingTime,
                legalReferences: response.legalReferences,
                suggestedActions: response.suggestedActions,
                relatedTopics: response.relatedTopics,
                culturalContext: response.culturalContext
            },
            mascotAnimation: response.mascotAnimation
        };

        return aiMessage;
    }

    /**
     * Create contextual AI response based on message content and category
     */
    private createContextualResponse(message: string, category: LegalCategory) {
        const messageLower = message.toLowerCase();

        // Business Law Responses
        if (category === 'business_law') {
            if (messageLower.includes('تسجيل') || messageLower.includes('شركة') || messageLower.includes('register')) {
                return this.createBusinessRegistrationResponse();
            }
            if (messageLower.includes('ضريبة') || messageLower.includes('tax') || messageLower.includes('رقمي')) {
                return this.createDigitalTaxResponse();
            }
            if (messageLower.includes('تجارة إلكترونية') || messageLower.includes('e-commerce')) {
                return this.createECommerceResponse();
            }
            return this.createGeneralBusinessResponse();
        }

        // Tax Law Responses
        if (category === 'tax_law') {
            if (messageLower.includes('قيمة مضافة') || messageLower.includes('vat') || messageLower.includes('tva')) {
                return this.createVATResponse();
            }
            if (messageLower.includes('موعد') || messageLower.includes('deadline') || messageLower.includes('échéance')) {
                return this.createTaxDeadlineResponse();
            }
            return this.createGeneralTaxResponse();
        }

        // Labor Law Responses
        if (category === 'labor_law') {
            if (messageLower.includes('أجر') || messageLower.includes('wage') || messageLower.includes('salaire')) {
                return this.createWageResponse();
            }
            if (messageLower.includes('عن بُعد') || messageLower.includes('remote') || messageLower.includes('télétravail')) {
                return this.createRemoteWorkResponse();
            }
            return this.createGeneralLaborResponse();
        }

        // Administrative Law Responses
        if (category === 'administrative_law') {
            if (messageLower.includes('رخصة') || messageLower.includes('permit') || messageLower.includes('permis')) {
                return this.createPermitResponse();
            }
            if (messageLower.includes('عضوي') || messageLower.includes('organic') || messageLower.includes('biologique')) {
                return this.createOrganicCertificationResponse();
            }
            return this.createGeneralAdministrativeResponse();
        }

        // Civil Law Responses
        if (category === 'civil_law') {
            if (messageLower.includes('زواج') || messageLower.includes('marriage') || messageLower.includes('mariage')) {
                return this.createMarriageResponse();
            }
            if (messageLower.includes('وراثة') || messageLower.includes('inheritance') || messageLower.includes('héritage')) {
                return this.createInheritanceResponse();
            }
            return this.createGeneralCivilResponse();
        }

        // Family Law Responses
        if (category === 'family_law') {
            if (messageLower.includes('طلاق') || messageLower.includes('divorce')) {
                return this.createDivorceResponse();
            }
            if (messageLower.includes('حضانة') || messageLower.includes('custody') || messageLower.includes('garde')) {
                return this.createCustodyResponse();
            }
            return this.createGeneralFamilyResponse();
        }

        return this.createDefaultResponse();
    }

    private createBusinessRegistrationResponse() {
        return {
            content: "To register a new business in Tunisia, you'll need to follow these key steps...",
            contentAr: "لتسجيل شركة جديدة في تونس، ستحتاج إلى اتباع هذه الخطوات الأساسية:\n\n**📋 الخطوات الأساسية:**\n1. **اختيار نوع الشركة**: SARL، SA، أو مؤسسة فردية\n2. **حجز اسم الشركة**: التحقق من توفر الاسم وحجزه\n3. **إيداع رأس المال**: في بنك معتمد\n4. **تحرير القانون الأساسي**: بمساعدة محامٍ أو خبير\n5. **التسجيل في المركز الوحيد للمؤسسات (CFE)**\n\n**💰 التكاليف التقريبية:**\n- SARL: 1,000 - 2,000 دينار\n- SA: 3,000 - 5,000 دينار\n- مؤسسة فردية: 200 - 500 دينار\n\n**⏱️ المدة الزمنية:**\n- عادة من 15 إلى 30 يوم عمل\n\nهل تريد تفاصيل أكثر حول أي من هذه الخطوات؟",
            contentFr: "Pour enregistrer une nouvelle entreprise en Tunisie, vous devrez suivre ces étapes clés...",
            confidence: 0.92,
            sources: ['ministry-commerce', 'cfe-official', 'legal-database'],
            processingTime: 1.8,
            legalReferences: [
                {
                    id: 'ref-business-001',
                    title: 'Commercial Code - Business Registration',
                    titleAr: 'المجلة التجارية - تسجيل الأعمال',
                    titleFr: 'Code Commercial - Enregistrement d\'Entreprise',
                    type: 'law' as const,
                    source: 'Official Gazette',
                    relevanceScore: 0.95,
                    excerpt: 'All businesses must register with CFE',
                    excerptAr: 'يجب على جميع الشركات التسجيل في المركز الوحيد للمؤسسات',
                    excerptFr: 'Toutes les entreprises doivent s\'enregistrer auprès du CFE'
                }
            ],
            suggestedActions: [
                {
                    id: 'action-business-001',
                    type: 'search' as const,
                    title: 'Find CFE locations',
                    titleAr: 'العثور على مواقع المركز الوحيد للمؤسسات',
                    titleFr: 'Trouver les emplacements CFE',
                    description: 'Locate nearest CFE office',
                    descriptionAr: 'تحديد أقرب مكتب للمركز الوحيد للمؤسسات',
                    descriptionFr: 'Localiser le bureau CFE le plus proche',
                    priority: 'high' as const
                }
            ],
            relatedTopics: ['business registration', 'company types', 'legal requirements'],
            culturalContext: {
                culturalReferences: [
                    {
                        term: 'المركز الوحيد للمؤسسات',
                        termAr: 'المركز الوحيد للمؤسسات',
                        explanation: 'One-stop shop for business registration in Tunisia',
                        explanationAr: 'نافذة واحدة لتسجيل الأعمال في تونس',
                        explanationFr: 'Guichet unique pour l\'enregistrement d\'entreprise en Tunisie',
                        significance: 'high' as const
                    }
                ],
                dialectTerms: [],
                regionalRelevance: [
                    {
                        region: 'national' as const,
                        regionAr: 'وطني',
                        relevanceScore: 1.0,
                        specificConsiderations: ['Applies nationwide'],
                        specificConsiderationsAr: ['ينطبق على المستوى الوطني']
                    }
                ]
            },
            mascotAnimation: {
                type: 'explaining' as const,
                sector: 'business' as const,
                duration: 4.2,
                culturalElements: ['business_documents', 'official_stamp'],
                voiceSync: true
            }
        };
    }

    private createDigitalTaxResponse() {
        return {
            content: "The new digital tax system is a major update for businesses...",
            contentAr: "النظام الضريبي الرقمي الجديد تحديث مهم للشركات! إليك ما تحتاج لمعرفته:\n\n**🔄 النظام الجديد:**\n- **التطبيق الإلزامي**: بداية من 1 مارس 2024\n- **الحساب التلقائي**: للضريبة على القيمة المضافة\n- **الربط المباشر**: مع منصات البيع الإلكترونية\n- **التقارير الفورية**: تقديم تلقائي للإقرارات\n\n**📱 المتطلبات التقنية:**\n- تسجيل في المنصة الرقمية للضرائب\n- ربط نظام المحاسبة بالمنصة\n- تحديث أنظمة نقاط البيع\n\n**⚠️ مواعيد مهمة:**\n- فترة انتقالية: حتى 31 مايو 2024\n- بداية الغرامات: 1 يونيو 2024\n- التدريب المجاني: متاح حتى 15 أبريل 2024\n\n**💡 نصائح للامتثال:**\n- ابدأ التحضير الآن\n- احضر دورات التدريب المجانية\n- استشر خبير ضرائب معتمد\n\nهل تحتاج مساعدة في خطوات التسجيل؟",
            contentFr: "Le nouveau système fiscal numérique est une mise à jour majeure pour les entreprises...",
            confidence: 0.88,
            sources: ['ministry-finance', 'tax-authority', 'digital-platform'],
            processingTime: 2.1,
            legalReferences: [
                {
                    id: 'ref-tax-001',
                    title: 'Digital Tax Regulation 2024',
                    titleAr: 'لائحة الضرائب الرقمية 2024',
                    titleFr: 'Règlement Fiscal Numérique 2024',
                    type: 'regulation' as const,
                    source: 'Ministry of Finance',
                    relevanceScore: 0.98,
                    excerpt: 'Mandatory digital tax system implementation',
                    excerptAr: 'تطبيق إلزامي لنظام الضرائب الرقمي',
                    excerptFr: 'Mise en œuvre obligatoire du système fiscal numérique'
                }
            ],
            suggestedActions: [
                {
                    id: 'action-tax-001',
                    type: 'bookmark' as const,
                    title: 'Save digital tax guide',
                    titleAr: 'حفظ دليل الضرائب الرقمية',
                    titleFr: 'Sauvegarder le guide fiscal numérique',
                    description: 'Bookmark this important tax information',
                    descriptionAr: 'احفظ هذه المعلومات الضريبية المهمة',
                    descriptionFr: 'Marquer ces informations fiscales importantes',
                    priority: 'high' as const
                }
            ],
            relatedTopics: ['digital transformation', 'tax compliance', 'e-commerce'],
            culturalContext: {
                culturalReferences: [],
                dialectTerms: [],
                regionalRelevance: [
                    {
                        region: 'national' as const,
                        regionAr: 'وطني',
                        relevanceScore: 1.0,
                        specificConsiderations: ['Nationwide implementation'],
                        specificConsiderationsAr: ['تطبيق على المستوى الوطني']
                    }
                ]
            },
            mascotAnimation: {
                type: 'explaining' as const,
                sector: 'money' as const,
                duration: 3.8,
                culturalElements: ['calculator', 'digital_screen'],
                voiceSync: true
            }
        };
    }

    private createECommerceResponse() {
        return {
            content: "E-commerce in Tunisia has specific legal requirements...",
            contentAr: "التجارة الإلكترونية في تونس لها متطلبات قانونية محددة:\n\n**📋 المتطلبات الأساسية:**\n1. **تسجيل الشركة**: لدى المركز الوحيد للمؤسسات\n2. **الترخيص التجاري**: للتجارة الإلكترونية\n3. **التسجيل الضريبي**: في النظام الرقمي الجديد\n4. **حماية البيانات**: الامتثال لقوانين الخصوصية\n\n**🔒 حماية المستهلك:**\n- سياسة الإرجاع والاستبدال\n- شروط الخدمة واضحة\n- حماية بيانات العملاء\n- طرق دفع آمنة\n\n**💳 طرق الدفع المعتمدة:**\n- البطاقات البنكية التونسية\n- التحويل البنكي\n- الدفع عند التسليم\n- المحافظ الإلكترونية المرخصة\n\n**📦 التوصيل والشحن:**\n- التعاقد مع شركات شحن مرخصة\n- تأمين البضائع\n- تتبع الطلبات\n\nهل تريد معرفة المزيد عن أي من هذه النقاط؟",
            contentFr: "Le commerce électronique en Tunisie a des exigences légales spécifiques...",
            confidence: 0.90,
            sources: ['ministry-commerce', 'consumer-protection', 'e-commerce-law'],
            processingTime: 2.3,
            legalReferences: [
                {
                    id: 'ref-ecommerce-001',
                    title: 'E-commerce Law Tunisia',
                    titleAr: 'قانون التجارة الإلكترونية تونس',
                    titleFr: 'Loi sur le Commerce Électronique Tunisie',
                    type: 'law' as const,
                    source: 'Official Gazette',
                    relevanceScore: 0.94,
                    excerpt: 'Regulations for online business operations',
                    excerptAr: 'لوائح عمليات الأعمال عبر الإنترنت',
                    excerptFr: 'Réglementations pour les opérations commerciales en ligne'
                }
            ],
            suggestedActions: [
                {
                    id: 'action-ecommerce-001',
                    type: 'read_update' as const,
                    title: 'Read consumer protection guide',
                    titleAr: 'اقرأ دليل حماية المستهلك',
                    titleFr: 'Lire le guide de protection du consommateur',
                    description: 'Learn about consumer rights in e-commerce',
                    descriptionAr: 'تعرف على حقوق المستهلك في التجارة الإلكترونية',
                    descriptionFr: 'Apprendre les droits des consommateurs dans le e-commerce',
                    priority: 'medium' as const
                }
            ],
            relatedTopics: ['consumer protection', 'digital payments', 'data privacy'],
            culturalContext: {
                culturalReferences: [],
                dialectTerms: [],
                regionalRelevance: [
                    {
                        region: 'national' as const,
                        regionAr: 'وطني',
                        relevanceScore: 1.0,
                        specificConsiderations: ['National e-commerce regulations'],
                        specificConsiderationsAr: ['لوائح التجارة الإلكترونية الوطنية']
                    }
                ]
            },
            mascotAnimation: {
                type: 'explaining' as const,
                sector: 'business' as const,
                duration: 4.0,
                culturalElements: ['shopping_cart', 'digital_payment'],
                voiceSync: true
            }
        };
    }

    private createGeneralBusinessResponse() {
        return {
            content: "I'm here to help with your business law questions in Tunisia...",
            contentAr: "أنا هنا لمساعدتك في أسئلة قانون الأعمال في تونس! يمكنني مساعدتك في:\n\n**🏢 تأسيس الشركات:**\n- أنواع الشركات المختلفة\n- متطلبات التسجيل\n- رأس المال المطلوب\n\n**📄 الامتثال القانوني:**\n- اللوائح التجارية\n- التراخيص المطلوبة\n- الالتزامات الضريبية\n\n**👥 قانون العمل:**\n- عقود العمل\n- حقوق الموظفين\n- إجراءات التوظيف\n\n**💼 العقود التجارية:**\n- صياغة العقود\n- شروط البيع\n- اتفاقيات الشراكة\n\nما هو السؤال المحدد الذي تريد مساعدة فيه؟",
            contentFr: "Je suis là pour vous aider avec vos questions de droit des affaires en Tunisie...",
            confidence: 0.85,
            sources: ['legal-database', 'business-guide'],
            processingTime: 1.5,
            legalReferences: [],
            suggestedActions: [
                {
                    id: 'action-general-001',
                    type: 'search' as const,
                    title: 'Browse business topics',
                    titleAr: 'تصفح مواضيع الأعمال',
                    titleFr: 'Parcourir les sujets d\'affaires',
                    description: 'Explore business law topics',
                    descriptionAr: 'استكشف مواضيع قانون الأعمال',
                    descriptionFr: 'Explorer les sujets de droit des affaires',
                    priority: 'medium' as const
                }
            ],
            relatedTopics: ['business law', 'company formation', 'legal compliance'],
            culturalContext: {
                culturalReferences: [],
                dialectTerms: [],
                regionalRelevance: []
            },
            mascotAnimation: {
                type: 'greeting' as const,
                sector: 'business' as const,
                duration: 2.5,
                culturalElements: ['welcoming_gesture'],
                voiceSync: true
            }
        };
    }

    private createDefaultResponse() {
        return {
            content: "I understand you have a legal question. Let me help you...",
            contentAr: "أفهم أن لديك سؤال قانوني. دعني أساعدك!\n\nيمكنني مساعدتك في:\n\n**⚖️ المجالات القانونية:**\n- قانون الأعمال والشركات\n- القانون الضريبي\n- قانون العمل\n- القانون الإداري\n- القانون المدني\n- قانون الأسرة\n\n**🎯 كيف يمكنني مساعدتك:**\n- الإجابة على الأسئلة القانونية\n- توضيح الإجراءات المطلوبة\n- تقديم المراجع القانونية\n- اقتراح الخطوات التالية\n\nيرجى إعادة صياغة سؤالك بشكل أكثر تحديداً، أو اختر من الأسئلة الشائعة أدناه.",
            contentFr: "Je comprends que vous avez une question juridique. Laissez-moi vous aider...",
            confidence: 0.75,
            sources: ['general-legal-database'],
            processingTime: 1.0,
            legalReferences: [],
            suggestedActions: [
                {
                    id: 'action-default-001',
                    type: 'search' as const,
                    title: 'Browse legal categories',
                    titleAr: 'تصفح الفئات القانونية',
                    titleFr: 'Parcourir les catégories juridiques',
                    description: 'Explore different legal areas',
                    descriptionAr: 'استكشف المجالات القانونية المختلفة',
                    descriptionFr: 'Explorer différents domaines juridiques',
                    priority: 'medium' as const
                }
            ],
            relatedTopics: ['legal guidance', 'law categories', 'legal procedures'],
            culturalContext: {
                culturalReferences: [],
                dialectTerms: [],
                regionalRelevance: []
            },
            mascotAnimation: {
                type: 'thinking' as const,
                sector: 'business' as const,
                duration: 2.0,
                culturalElements: ['thoughtful_gesture'],
                voiceSync: true
            }
        };
    }

    // Additional response methods for other categories...
    private createGeneralTaxResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createVATResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createTaxDeadlineResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createGeneralLaborResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createWageResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createRemoteWorkResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createGeneralAdministrativeResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createPermitResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createOrganicCertificationResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createGeneralCivilResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createMarriageResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createInheritanceResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createGeneralFamilyResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createDivorceResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    private createCustodyResponse() {
        return this.createDefaultResponse(); // Simplified for brevity
    }

    /**
     * Send message and get AI response
     */
    async sendMessage(
        conversationId: string,
        message: string,
        userId: string,
        category: LegalCategory
    ): Promise<ApiResponse<{ userMessage: ChatMessage; aiMessage: ChatMessage }>> {
        try {
            // Create user message
            const userMessage: ChatMessage = {
                id: `msg-${Date.now()}-user`,
                conversationId,
                type: 'user',
                content: message,
                timestamp: new Date(),
                isEdited: false,
                metadata: {
                    relatedTopics: [],
                    culturalContext: {
                        culturalReferences: [],
                        dialectTerms: [],
                        regionalRelevance: []
                    }
                }
            };

            // Generate AI response
            const aiMessage = await this.generateAIResponse(message, conversationId, category);

            return {
                success: true,
                data: { userMessage, aiMessage },
                timestamp: new Date(),
                requestId: `send-message-${Date.now()}`
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'CHAT_ERROR',
                    message: 'Failed to send message',
                    messageAr: 'فشل في إرسال الرسالة',
                    messageFr: 'Échec de l\'envoi du message'
                },
                timestamp: new Date(),
                requestId: `send-message-error-${Date.now()}`
            };
        }
    }

    /**
     * Search conversation history
     */
    async searchConversationHistory(
        conversationId: string,
        query: string
    ): Promise<ApiResponse<ChatMessage[]>> {
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            // For now, return empty results since we need proper conversation data transformation
            const matchingMessages: ChatMessage[] = [];

            return {
                success: true,
                data: matchingMessages,
                timestamp: new Date(),
                requestId: `search-${Date.now()}`
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'SEARCH_ERROR',
                    message: 'Search failed',
                    messageAr: 'فشل البحث',
                    messageFr: 'Échec de la recherche'
                },
                timestamp: new Date(),
                requestId: `search-error-${Date.now()}`
            };
        }
    }

    /**
     * Bookmark a message
     */
    async bookmarkMessage(messageId: string, userId: string): Promise<ApiResponse<boolean>> {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Simulate bookmark operation
        return {
            success: true,
            data: true,
            timestamp: new Date(),
            requestId: `bookmark-${Date.now()}`
        };
    }

    /**
     * Get conversation statistics
     */
    async getConversationStats(conversationId: string): Promise<ApiResponse<any>> {
        await new Promise(resolve => setTimeout(resolve, 400));

        // For now, return mock stats
        const stats = {
            totalMessages: 8,
            userMessages: 4,
            aiMessages: 4,
            averageResponseTime: 1.5,
            topicsDiscussed: ['business registration', 'legal requirements'],
            legalCategoriesCovered: ['business_law'],
            conversationDuration: 1800000, // 30 minutes
            lastActivity: new Date()
        };

        return {
            success: true,
            data: stats,
            timestamp: new Date(),
            requestId: `stats-${Date.now()}`
        };
    }
}

// Export singleton instance
export const chatService = ChatService.getInstance();