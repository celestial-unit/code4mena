"""
Legal Service - Business logic for legal data management
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import hashlib
import uuid

from ..repositories.legal_repository import LegalRepository
from ..models.legal_models import (
    LegalQuery,
    LegalResponse,
    LegalDocument,
    LegalSearchResult,
    LegalSource,
    LegalCategory,
    LanguageCode
)

class LegalService:
    """Service class for legal data operations"""
    
    def __init__(self):
        self.repository = LegalRepository()
    
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