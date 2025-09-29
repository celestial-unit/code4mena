"""
Legal Service - Business logic for legal data management
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import uuid
import logging

from ..repositories.legal_repository import LegalRepository
from .external_llm import ExternalLLMService
from .legal_rag import LegalRAGService
from ..models.legal_models import (
    LegalQuery,
    LegalResponse,
    LegalDocument,
    LegalSearchResult,
    LegalSource,
    LegalCategory,
    LanguageCode,
    TextQueryRequest,
    TextQueryResponse
)

logger = logging.getLogger(__name__)

class LegalService:
    """Service class for legal data operations"""
    
    def __init__(self):
        self.repository = LegalRepository()
        try:
            self.external_llm = ExternalLLMService()
        except Exception as e:
            logger.warning(f"Failed to initialize ExternalLLMService: {e}")
            self.external_llm = None
        
        try:
            self.legal_rag = LegalRAGService()
        except Exception as e:
            logger.warning(f"Failed to initialize LegalRAGService: {e}")
            self.legal_rag = None
    
    async def get_legal_updates(
        self,
        category: Optional[str] = None,
        priority: Optional[str] = None,
        language: str = "ar",
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get legal updates with filtering and pagination
        """
        return await self.repository.get_legal_updates(
            category=category,
            priority=priority,
            language=language,
            limit=limit,
            offset=offset
        )
    
    async def get_legal_update_by_id(
        self,
        update_id: str,
        language: str = "ar"
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific legal update by ID
        """
        return await self.repository.get_legal_update_by_id(update_id, language=language)
    
    async def get_legal_categories(
        self,
        language: str = "ar"
    ) -> List[Dict[str, Any]]:
        """
        Get available legal categories
        """
        categories = [
            {
                "id": "tax_law",
                "name": "Tax Law" if language == "en" else "Droit fiscal" if language == "fr" else "القانون الضريبي",
                "description": "Tax regulations and policies" if language == "en" else "Réglementations et politiques fiscales" if language == "fr" else "اللوائح والسياسات الضريبية"
            },
            {
                "id": "administrative_law",
                "name": "Administrative Law" if language == "en" else "Droit administratif" if language == "fr" else "القانون الإداري",
                "description": "Government administration and public policy" if language == "en" else "Administration gouvernementale et politique publique" if language == "fr" else "الإدارة الحكومية والسياسة العامة"
            },
            {
                "id": "business_law",
                "name": "Business Law" if language == "en" else "Droit des affaires" if language == "fr" else "قانون الأعمال",
                "description": "Commercial and business regulations" if language == "en" else "Réglementations commerciales et d'affaires" if language == "fr" else "اللوائح التجارية والأعمال"
            },
            {
                "id": "labor_law",
                "name": "Labor Law" if language == "en" else "Droit du travail" if language == "fr" else "قانون العمل",
                "description": "Employment and workplace regulations" if language == "en" else "Réglementations de l'emploi et du lieu de travail" if language == "fr" else "لوائح العمل ومكان العمل"
            },
            {
                "id": "family_law",
                "name": "Family Law" if language == "en" else "Droit de la famille" if language == "fr" else "قانون الأسرة",
                "description": "Family relationships and domestic matters" if language == "en" else "Relations familiales et affaires domestiques" if language == "fr" else "العلاقات الأسرية والشؤون المنزلية"
            }
        ]
        return categories
    
    async def get_legal_documents(
        self,
        category: Optional[LegalCategory] = None,
        language: Optional[LanguageCode] = None,
        search: Optional[str] = None,
        limit: int = 10,
        offset: int = 0
    ) -> List[LegalDocument]:
        """
        Get legal documents with filtering and search
        """
        return await self.repository.get_legal_documents(
            category=category,
            language=language,
            search=search,
            limit=limit,
            offset=offset
        )
    
    async def get_legal_document_by_id(self, document_id: int) -> Optional[LegalDocument]:
        """
        Get a specific legal document by ID
        """
        return await self.repository.get_legal_document_by_id(document_id)
    
    async def search_legal_documents(
        self,
        query: str,
        category: Optional[LegalCategory] = None,
        language: Optional[LanguageCode] = None,
        limit: int = 10
    ) -> List[LegalSearchResult]:
        """
        Search legal documents with similarity scoring
        """
        return await self.repository.search_legal_documents(
            query=query,
            category=category,
            language=language,
            limit=limit
        )
    
    async def process_legal_query(self, query: LegalQuery) -> LegalResponse:
        """
        Process a natural language legal query
        """
        # Generate query ID
        query_id = str(uuid.uuid4())
        
        # For now, return a mock response
        # In a real implementation, this would use the legal RAG service
        response_text = f"Based on your query about '{query.query}', here is the legal guidance..."
        
        # Mock sources
        sources = [
            LegalSource(
                article_number="Article 1",
                title="Sample Legal Article",
                source_document="Sample Document",
                official_url="https://example.com",
                relevance_score=0.95
            )
        ]
        
        disclaimer = "This is automated legal guidance. Please consult with a qualified legal professional for specific advice."
        
        return LegalResponse(
            response=response_text,
            sources=sources,
            disclaimer=disclaimer,
            query_id=query_id,
            language=query.language,
            processing_time_ms=100,
            confidence_score=0.85
        )
    
    async def get_ministries(self, language: str = "ar") -> List[Dict[str, Any]]:
        """
        Get list of government ministries and sources
        """
        ministries = [
            {
                "id": "ministry-finance",
                "name": "Ministry of Finance" if language == "en" else "Ministère des Finances" if language == "fr" else "وزارة المالية",
                "url": "https://www.finances.gov.tn",
                "type": "ministry_official"
            },
            {
                "id": "ministry-justice",
                "name": "Ministry of Justice" if language == "en" else "Ministère de la Justice" if language == "fr" else "وزارة العدل",
                "url": "https://www.justice.gov.tn",
                "type": "ministry_official"
            },
            {
                "id": "ministry-social-affairs",
                "name": "Ministry of Social Affairs" if language == "en" else "Ministère des Affaires Sociales" if language == "fr" else "وزارة الشؤون الاجتماعية",
                "url": "https://www.social.gov.tn",
                "type": "ministry_official"
            },
            {
                "id": "ministry-tourism",
                "name": "Ministry of Tourism" if language == "en" else "Ministère du Tourisme" if language == "fr" else "وزارة السياحة",
                "url": "https://www.tourisme.gov.tn",
                "type": "ministry_official"
            },
            {
                "id": "ministry-agriculture",
                "name": "Ministry of Agriculture" if language == "en" else "Ministère de l'Agriculture" if language == "fr" else "وزارة الزراعة",
                "url": "https://www.agriculture.gov.tn",
                "type": "ministry_official"
            },
            {
                "id": "source-parliament",
                "name": "Tunisian Parliament" if language == "en" else "Parlement Tunisien" if language == "fr" else "البرلمان التونسي",
                "url": "https://www.arp.tn",
                "type": "parliamentary"
            }
        ]
        return ministries
    
    async def get_legal_tags(
        self,
        language: str = "ar",
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get available legal tags for filtering
        """
        all_tags = [
            {
                "id": "digital-tax",
                "name": "Digital Tax" if language == "en" else "Taxe numérique" if language == "fr" else "الضرائب الرقمية",
                "category": "tax_law"
            },
            {
                "id": "e-commerce",
                "name": "E-commerce" if language == "en" else "Commerce électronique" if language == "fr" else "التجارة الإلكترونية",
                "category": "business_law"
            },
            {
                "id": "remote-work",
                "name": "Remote Work" if language == "en" else "Travail à distance" if language == "fr" else "العمل عن بُعد",
                "category": "labor_law"
            },
            {
                "id": "child-custody",
                "name": "Child Custody" if language == "en" else "Garde d'enfants" if language == "fr" else "حضانة الأطفال",
                "category": "family_law"
            },
            {
                "id": "agriculture",
                "name": "Agriculture" if language == "en" else "Agriculture" if language == "fr" else "الزراعة",
                "category": "administrative_law"
            },
            {
                "id": "tourism",
                "name": "Tourism" if language == "en" else "Tourisme" if language == "fr" else "السياحة",
                "category": "business_law"
            }
        ]
        
        if category:
            all_tags = [tag for tag in all_tags if tag["category"] == category]
        
        return all_tags
    
    async def get_search_results(
        self,
        query: str,
        category: Optional[str] = None,
        sector: Optional[str] = None,
        language: str = "ar",
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get search results with filtering and pagination
        """
        return await self.repository.get_search_results(
            query=query,
            category=category,
            sector=sector,
            language=language,
            limit=limit,
            offset=offset
        )
    
    async def get_search_suggestions(
        self,
        query: str,
        language: str = "ar",
        limit: int = 5
    ) -> List[str]:
        """
        Get search suggestions based on partial query
        """
        return await self.repository.get_search_suggestions(
            query=query,
            language=language,
            limit=limit
        )
    
    async def process_text_query(self, request: TextQueryRequest) -> TextQueryResponse:
        """
        Process a text query with Tunisia-specific legal context
        """
        start_time = datetime.utcnow()
        query_id = str(uuid.uuid4())
        
        try:
            # Detect language if not specified
            language = request.language or "ar"
            
            # Search for relevant legal documents using RAG
            legal_documents = []
            if self.legal_rag:
                try:
                    legal_documents = await self.legal_rag.search_legal_documents(
                        query=request.query,
                        language=language,
                        limit=5
                    )
                except Exception as e:
                    logger.warning(f"Legal RAG search failed: {e}")
            
            # Generate Tunisia-specific response using external LLM
            if legal_documents and self.external_llm:
                try:
                    simplified_response = await self.external_llm.simplify_legal_text(
                        legal_texts=legal_documents,
                        language=language,
                        query_context=request.query
                    )
                    
                    # Extract sources from legal documents
                    sources = []
                    for doc in legal_documents[:3]:  # Limit to top 3 sources
                        source = LegalSource(
                            article_number=doc.get('article_number', 'N/A'),
                            title=doc.get('title', 'Legal Document'),
                            source_document=doc.get('source_document', 'Tunisia Legal Database'),
                            official_url=doc.get('official_url'),
                            relevance_score=doc.get('similarity_score', 0.0)
                        )
                        sources.append(source)
                    
                    legal_context = True
                    confidence_score = 0.85
                    
                except Exception as e:
                    logger.warning(f"External LLM failed: {e}")
                    # Fallback to simple response
                    simplified_response = self._create_tunisia_fallback_response(
                        request.query, language
                    )
                    sources = []
                    legal_context = False
                    confidence_score = 0.3
                
            else:
                # Fallback response when no legal documents found or services unavailable
                simplified_response = self._create_tunisia_fallback_response(
                    request.query, language
                )
                sources = []
                legal_context = False
                confidence_score = 0.3
            
            # Add Tunisia-specific disclaimer
            disclaimer = self._get_tunisia_disclaimer(language)
            
            # Calculate processing time
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return TextQueryResponse(
                response=simplified_response,
                sources=sources,
                disclaimer=disclaimer,
                query_id=query_id,
                language_detected=language,
                legal_context=legal_context,
                processing_time_ms=processing_time,
                confidence_score=confidence_score
            )
            
        except Exception as e:
            logger.error(f"Error processing text query {query_id}: {e}")
            
            # Return error fallback response
            processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return TextQueryResponse(
                response=self._create_error_fallback_response(language),
                sources=[],
                disclaimer=self._get_tunisia_disclaimer(language),
                query_id=query_id,
                language_detected=language or "ar",
                legal_context=False,
                processing_time_ms=processing_time,
                confidence_score=0.1
            )
    
    def _create_tunisia_fallback_response(self, query: str, language: str) -> str:
        """Create Tunisia-specific fallback response when no legal documents found"""
        
        fallback_responses = {
            "ar": f"""بناءً على استفسارك حول "{query}"، لم أتمكن من العثور على نصوص قانونية محددة في قاعدة البيانات التونسية.

• يُنصح بمراجعة الجريدة الرسمية للجمهورية التونسية للحصول على أحدث النصوص القانونية
• يمكنك التواصل مع المحاكم التونسية المختصة للحصول على إرشادات قانونية دقيقة
• راجع موقع وزارة العدل التونسية (www.justice.gov.tn) للحصول على معلومات محدثة
• استشر محامياً مرخصاً في تونس للحصول على مشورة قانونية شخصية

للمساعدة الفورية، يمكنك الاتصال بخط المساعدة القانونية التونسي أو زيارة أقرب محكمة.""",
            
            "fr": f"""Concernant votre question sur "{query}", je n'ai pas pu trouver de textes juridiques spécifiques dans la base de données tunisienne.

• Il est conseillé de consulter le Journal Officiel de la République Tunisienne pour les derniers textes juridiques
• Vous pouvez contacter les tribunaux tunisiens compétents pour des orientations juridiques précises
• Consultez le site du Ministère de la Justice tunisien (www.justice.gov.tn) pour des informations à jour
• Consultez un avocat agréé en Tunisie pour des conseils juridiques personnalisés

Pour une aide immédiate, vous pouvez appeler la ligne d'assistance juridique tunisienne ou visiter le tribunal le plus proche.""",
            
            "en": f"""Regarding your question about "{query}", I could not find specific legal texts in the Tunisian database.

• It is recommended to consult the Official Gazette of the Republic of Tunisia for the latest legal texts
• You can contact the competent Tunisian courts for precise legal guidance
• Check the Tunisian Ministry of Justice website (www.justice.gov.tn) for updated information
• Consult a licensed lawyer in Tunisia for personalized legal advice

For immediate assistance, you can call the Tunisian legal helpline or visit the nearest court."""
        }
        
        return fallback_responses.get(language, fallback_responses["ar"])
    
    def _create_error_fallback_response(self, language: str) -> str:
        """Create error fallback response"""
        
        error_responses = {
            "ar": """عذراً، حدث خطأ تقني أثناء معالجة استفسارك.

• يرجى المحاولة مرة أخرى بعد قليل
• تأكد من صياغة السؤال بوضوح
• للمساعدة الفورية، اتصل بخط المساعدة القانونية التونسي
• أو راجع موقع وزارة العدل التونسية للحصول على معلومات قانونية""",
            
            "fr": """Désolé, une erreur technique s'est produite lors du traitement de votre demande.

• Veuillez réessayer dans quelques instants
• Assurez-vous de formuler clairement votre question
• Pour une aide immédiate, appelez la ligne d'assistance juridique tunisienne
• Ou consultez le site du Ministère de la Justice tunisien pour des informations juridiques""",
            
            "en": """Sorry, a technical error occurred while processing your request.

• Please try again in a few moments
• Make sure to formulate your question clearly
• For immediate assistance, call the Tunisian legal helpline
• Or visit the Tunisian Ministry of Justice website for legal information"""
        }
        
        return error_responses.get(language, error_responses["ar"])
    
    def _get_tunisia_disclaimer(self, language: str) -> str:
        """Get Tunisia-specific legal disclaimer"""
        
        disclaimers = {
            "ar": """تنويه قانوني: هذه المعلومات مقدمة لأغراض إعلامية فقط ولا تشكل مشورة قانونية رسمية. للحصول على مشورة قانونية دقيقة ومحددة لحالتك، يُنصح بشدة باستشارة محامٍ مرخص في تونس. القوانين التونسية قابلة للتغيير، لذا تأكد من الحصول على أحدث النصوص القانونية من المصادر الرسمية.""",
            
            "fr": """Avertissement juridique : Ces informations sont fournies à des fins informatives uniquement et ne constituent pas des conseils juridiques officiels. Pour obtenir des conseils juridiques précis et spécifiques à votre situation, il est fortement recommandé de consulter un avocat agréé en Tunisie. Les lois tunisiennes sont sujettes à modification, alors assurez-vous d'obtenir les derniers textes juridiques auprès des sources officielles.""",
            
            "en": """Legal Disclaimer: This information is provided for informational purposes only and does not constitute official legal advice. For precise legal advice specific to your situation, it is strongly recommended to consult a licensed lawyer in Tunisia. Tunisian laws are subject to change, so make sure to obtain the latest legal texts from official sources."""
        }
        
        return disclaimers.get(language, disclaimers["ar"])