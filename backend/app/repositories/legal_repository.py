"""
Legal Repository - Data access layer for legal information
"""

from typing import List, Optional, Dict, Any
from datetime import datetime

from ..models.legal_models import (
    LegalDocument,
    LegalSearchResult,
    LegalCategory,
    LanguageCode
)

class LegalRepository:
    """Repository class for legal data access"""
    
    def __init__(self):
        # Mock data based on the original legal-updates.json
        self._mock_legal_updates = [
            {
                "id": "update-001",
                "title": "New Digital Tax Regulations for E-commerce Businesses",
                "titleAr": "لوائح ضريبية رقمية جديدة للشركات التجارة الإلكترونية",
                "titleFr": "Nouvelles réglementations fiscales numériques pour les entreprises de commerce électronique",
                "content": "The Ministry of Finance has announced new digital tax regulations that will affect all e-commerce businesses operating in Tunisia. These regulations require online businesses to register for digital tax collection and implement automated tax calculation systems.",
                "contentAr": "أعلنت وزارة المالية عن لوائح ضريبية رقمية جديدة ستؤثر على جميع شركات التجارة الإلكترونية العاملة في تونس. تتطلب هذه اللوائح من الشركات الإلكترونية التسجيل لتحصيل الضرائب الرقمية وتنفيذ أنظمة حساب الضرائب الآلية.",
                "contentFr": "Le ministère des Finances a annoncé de nouvelles réglementations fiscales numériques qui affecteront toutes les entreprises de commerce électronique opérant en Tunisie. Ces réglementations exigent que les entreprises en ligne s'enregistrent pour la collecte de taxes numériques et mettent en place des systèmes de calcul automatisé des taxes.",
                "summary": "E-commerce businesses must now comply with new digital tax regulations including registration and automated tax systems.",
                "summaryAr": "يجب على شركات التجارة الإلكترونية الآن الامتثال للوائح الضريبية الرقمية الجديدة بما في ذلك التسجيل وأنظمة الضرائب الآلية.",
                "summaryFr": "Les entreprises de commerce électronique doivent maintenant se conformer aux nouvelles réglementations fiscales numériques, y compris l'enregistrement et les systèmes fiscaux automatisés.",
                "category": "tax_law",
                "priority": "high",
                "source": {
                    "id": "source-mof",
                    "name": "Ministry of Finance",
                    "nameAr": "وزارة المالية",
                    "nameFr": "Ministère des Finances",
                    "type": "ministry_official",
                    "url": "https://www.finances.gov.tn",
                    "credibilityScore": 0.95,
                    "lastUpdated": "2024-01-15T10:30:00Z"
                },
                "publishedAt": "2024-01-15T10:30:00Z",
                "effectiveDate": "2024-03-01T00:00:00Z",
                "tags": ["digital tax", "e-commerce", "business registration", "automation"],
                "tagsAr": ["الضرائب الرقمية", "التجارة الإلكترونية", "تسجيل الأعمال", "الأتمتة"],
                "tagsFr": ["taxe numérique", "commerce électronique", "enregistrement d'entreprise", "automatisation"],
                "impactLevel": "high",
                "sectors": ["business", "technology"],
                "ministryId": "ministry-finance",
                "isBookmarked": False,
                "readStatus": "unread"
            },
            {
                "id": "update-002",
                "title": "Agricultural Land Use Reform Act 2024",
                "titleAr": "قانون إصلاح استخدام الأراضي الزراعية 2024",
                "titleFr": "Loi de réforme de l'utilisation des terres agricoles 2024",
                "content": "Parliament has passed the Agricultural Land Use Reform Act 2024, which introduces new regulations for land ownership, sustainable farming practices, and water resource management. The act aims to modernize Tunisia's agricultural sector while preserving traditional farming communities.",
                "contentAr": "أقر البرلمان قانون إصلاح استخدام الأراضي الزراعية 2024، والذي يقدم لوائح جديدة لملكية الأراضي وممارسات الزراعة المستدامة وإدارة الموارد المائية. يهدف القانون إلى تحديث القطاع الزراعي التونسي مع الحفاظ على المجتمعات الزراعية التقليدية.",
                "contentFr": "Le Parlement a adopté la Loi de réforme de l'utilisation des terres agricoles 2024, qui introduit de nouvelles réglementations pour la propriété foncière, les pratiques agricoles durables et la gestion des ressources en eau. La loi vise à moderniser le secteur agricole tunisien tout en préservant les communautés agricoles traditionnelles.",
                "summary": "New agricultural reform law introduces regulations for land ownership, sustainable farming, and water management.",
                "summaryAr": "قانون الإصلاح الزراعي الجديد يقدم لوائح لملكية الأراضي والزراعة المستدامة وإدارة المياه.",
                "summaryFr": "La nouvelle loi de réforme agricole introduit des réglementations pour la propriété foncière, l'agriculture durable et la gestion de l'eau.",
                "category": "administrative_law",
                "priority": "high",
                "source": {
                    "id": "source-parliament",
                    "name": "Tunisian Parliament",
                    "nameAr": "البرلمان التونسي",
                    "nameFr": "Parlement Tunisien",
                    "type": "parliamentary",
                    "url": "https://www.arp.tn",
                    "credibilityScore": 0.98,
                    "lastUpdated": "2024-01-14T16:45:00Z"
                },
                "publishedAt": "2024-01-14T16:45:00Z",
                "effectiveDate": "2024-06-01T00:00:00Z",
                "tags": ["agriculture", "land reform", "sustainability", "water management"],
                "tagsAr": ["الزراعة", "إصلاح الأراضي", "الاستدامة", "إدارة المياه"],
                "tagsFr": ["agriculture", "réforme foncière", "durabilité", "gestion de l'eau"],
                "impactLevel": "critical",
                "sectors": ["agriculture", "food"],
                "ministryId": "ministry-agriculture",
                "isBookmarked": True,
                "readStatus": "read"
            },
            {
                "id": "update-003",
                "title": "Tourism Industry Recovery Incentives Package",
                "titleAr": "حزمة حوافز انتعاش صناعة السياحة",
                "titleFr": "Package d'incitations pour la relance de l'industrie touristique",
                "content": "The Ministry of Tourism has launched a comprehensive incentives package to support the recovery of Tunisia's tourism industry. The package includes tax breaks, subsidized loans, and streamlined licensing procedures for tourism businesses.",
                "contentAr": "أطلقت وزارة السياحة حزمة حوافز شاملة لدعم انتعاش صناعة السياحة التونسية. تشمل الحزمة إعفاءات ضريبية وقروض مدعومة وإجراءات ترخيص مبسطة للشركات السياحية.",
                "contentFr": "Le ministère du Tourisme a lancé un package d'incitations complet pour soutenir la relance de l'industrie touristique tunisienne. Le package comprend des allégements fiscaux, des prêts subventionnés et des procédures de licence simplifiées pour les entreprises touristiques.",
                "summary": "New tourism recovery package offers tax breaks, subsidized loans, and simplified licensing for tourism businesses.",
                "summaryAr": "حزمة انتعاش السياحة الجديدة تقدم إعفاءات ضريبية وقروض مدعومة وترخيص مبسط للشركات السياحية.",
                "summaryFr": "Le nouveau package de relance touristique offre des allégements fiscaux, des prêts subventionnés et des licences simplifiées pour les entreprises touristiques.",
                "category": "business_law",
                "priority": "medium",
                "source": {
                    "id": "source-tourism",
                    "name": "Ministry of Tourism",
                    "nameAr": "وزارة السياحة",
                    "nameFr": "Ministère du Tourisme",
                    "type": "ministry_official",
                    "url": "https://www.tourisme.gov.tn",
                    "credibilityScore": 0.92,
                    "lastUpdated": "2024-01-13T14:20:00Z"
                },
                "publishedAt": "2024-01-13T14:20:00Z",
                "effectiveDate": "2024-02-01T00:00:00Z",
                "tags": ["tourism", "incentives", "tax breaks", "business support"],
                "tagsAr": ["السياحة", "الحوافز", "الإعفاءات الضريبية", "دعم الأعمال"],
                "tagsFr": ["tourisme", "incitations", "allégements fiscaux", "soutien aux entreprises"],
                "impactLevel": "medium",
                "sectors": ["tourism", "business"],
                "ministryId": "ministry-tourism",
                "isBookmarked": False,
                "readStatus": "unread"
            },
            {
                "id": "update-004",
                "title": "New Labor Code Amendments for Remote Work",
                "titleAr": "تعديلات جديدة على قانون العمل للعمل عن بُعد",
                "titleFr": "Nouveaux amendements au Code du travail pour le travail à distance",
                "content": "The Ministry of Social Affairs has introduced amendments to the Labor Code that formally recognize remote work arrangements. The amendments establish rights and obligations for both employers and employees in remote work situations, including provisions for work-life balance and digital rights.",
                "contentAr": "أدخلت وزارة الشؤون الاجتماعية تعديلات على قانون العمل تعترف رسمياً بترتيبات العمل عن بُعد. تحدد التعديلات الحقوق والالتزامات لكل من أصحاب العمل والموظفين في حالات العمل عن بُعد، بما في ذلك أحكام التوازن بين العمل والحياة والحقوق الرقمية.",
                "contentFr": "Le ministère des Affaires sociales a introduit des amendements au Code du travail qui reconnaissent formellement les arrangements de travail à distance. Les amendements établissent les droits et obligations pour les employeurs et les employés dans les situations de travail à distance, y compris des dispositions pour l'équilibre travail-vie et les droits numériques.",
                "summary": "Labor Code amendments formally recognize remote work with new rights and obligations for employers and employees.",
                "summaryAr": "تعديلات قانون العمل تعترف رسمياً بالعمل عن بُعد مع حقوق والتزامات جديدة لأصحاب العمل والموظفين.",
                "summaryFr": "Les amendements du Code du travail reconnaissent formellement le travail à distance avec de nouveaux droits et obligations pour les employeurs et les employés.",
                "category": "labor_law",
                "priority": "high",
                "source": {
                    "id": "source-social-affairs",
                    "name": "Ministry of Social Affairs",
                    "nameAr": "وزارة الشؤون الاجتماعية",
                    "nameFr": "Ministère des Affaires Sociales",
                    "type": "ministry_official",
                    "url": "https://www.social.gov.tn",
                    "credibilityScore": 0.94,
                    "lastUpdated": "2024-01-12T11:15:00Z"
                },
                "publishedAt": "2024-01-12T11:15:00Z",
                "effectiveDate": "2024-04-01T00:00:00Z",
                "tags": ["labor law", "remote work", "digital rights", "work-life balance"],
                "tagsAr": ["قانون العمل", "العمل عن بُعد", "الحقوق الرقمية", "التوازن بين العمل والحياة"],
                "tagsFr": ["droit du travail", "travail à distance", "droits numériques", "équilibre travail-vie"],
                "impactLevel": "high",
                "sectors": ["business", "technology"],
                "ministryId": "ministry-social-affairs",
                "isBookmarked": True,
                "readStatus": "read"
            },
            {
                "id": "update-005",
                "title": "Family Law Modernization: Child Custody Reforms",
                "titleAr": "تحديث قانون الأسرة: إصلاحات حضانة الأطفال",
                "titleFr": "Modernisation du droit de la famille : Réformes de la garde d'enfants",
                "content": "The Ministry of Justice has proposed significant reforms to family law regarding child custody arrangements. The reforms emphasize the best interests of the child and introduce more flexible custody arrangements that consider modern family structures and gender equality principles.",
                "contentAr": "اقترحت وزارة العدل إصلاحات مهمة لقانون الأسرة فيما يتعلق بترتيبات حضانة الأطفال. تؤكد الإصلاحات على مصالح الطفل الفضلى وتقدم ترتيبات حضانة أكثر مرونة تأخذ في الاعتبار هياكل الأسرة الحديثة ومبادئ المساواة بين الجنسين.",
                "contentFr": "Le ministère de la Justice a proposé des réformes importantes au droit de la famille concernant les arrangements de garde d'enfants. Les réformes mettent l'accent sur l'intérêt supérieur de l'enfant et introduisent des arrangements de garde plus flexibles qui tiennent compte des structures familiales modernes et des principes d'égalité des sexes.",
                "summary": "Family law reforms introduce flexible child custody arrangements emphasizing children's best interests and gender equality.",
                "summaryAr": "إصلاحات قانون الأسرة تقدم ترتيبات حضانة أطفال مرنة تؤكد على مصالح الأطفال الفضلى والمساواة بين الجنسين.",
                "summaryFr": "Les réformes du droit de la famille introduisent des arrangements de garde d'enfants flexibles mettant l'accent sur l'intérêt supérieur des enfants et l'égalité des sexes.",
                "category": "family_law",
                "priority": "medium",
                "source": {
                    "id": "source-justice",
                    "name": "Ministry of Justice",
                    "nameAr": "وزارة العدل",
                    "nameFr": "Ministère de la Justice",
                    "type": "ministry_official",
                    "url": "https://www.justice.gov.tn",
                    "credibilityScore": 0.96,
                    "lastUpdated": "2024-01-11T09:30:00Z"
                },
                "publishedAt": "2024-01-11T09:30:00Z",
                "effectiveDate": "2024-07-01T00:00:00Z",
                "tags": ["family law", "child custody", "gender equality", "modernization"],
                "tagsAr": ["قانون الأسرة", "حضانة الأطفال", "المساواة بين الجنسين", "التحديث"],
                "tagsFr": ["droit de la famille", "garde d'enfants", "égalité des sexes", "modernisation"],
                "impactLevel": "medium",
                "sectors": ["education"],
                "ministryId": "ministry-justice",
                "isBookmarked": False,
                "readStatus": "unread"
            }
        ]
    
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
        updates = self._mock_legal_updates.copy()
        
        # Apply filters
        if category:
            updates = [u for u in updates if u["category"] == category]
        
        if priority:
            updates = [u for u in updates if u["priority"] == priority]
        
        # Apply pagination
        updates = updates[offset:offset + limit]
        
        return updates
    
    async def get_legal_update_by_id(
        self,
        update_id: str,
        language: str = "ar"
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific legal update by ID
        """
        for update in self._mock_legal_updates:
            if update["id"] == update_id:
                return update
        return None
    
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
        # Mock legal documents
        documents = []
        for i in range(1, 21):  # Generate 20 mock documents
            doc = LegalDocument(
                id=i,
                article_number=f"Article {i}",
                title=f"Legal Document {i}",
                content=f"Content of legal document {i}...",
                category=LegalCategory.BUSINESS_LAW if i % 2 == 0 else LegalCategory.TAX_LAW,
                source_document=f"Source Document {i}",
                language=language or LanguageCode.ARABIC,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            documents.append(doc)
        
        # Apply filters
        if category:
            documents = [d for d in documents if d.category == category]
        
        if search:
            documents = [d for d in documents if search.lower() in d.title.lower() or search.lower() in d.content.lower()]
        
        # Apply pagination
        return documents[offset:offset + limit]
    
    async def get_legal_document_by_id(self, document_id: int) -> Optional[LegalDocument]:
        """
        Get a specific legal document by ID
        """
        # Mock implementation
        if 1 <= document_id <= 20:
            return LegalDocument(
                id=document_id,
                article_number=f"Article {document_id}",
                title=f"Legal Document {document_id}",
                content=f"Content of legal document {document_id}...",
                category=LegalCategory.BUSINESS_LAW if document_id % 2 == 0 else LegalCategory.TAX_LAW,
                source_document=f"Source Document {document_id}",
                language=LanguageCode.ARABIC,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
        return None
    
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
        # Mock search results
        results = []
        for i in range(1, min(limit + 1, 6)):  # Generate up to 5 mock results
            doc = LegalDocument(
                id=i,
                article_number=f"Article {i}",
                title=f"Legal Document matching '{query}' - {i}",
                content=f"Content related to '{query}' in document {i}...",
                category=category or (LegalCategory.BUSINESS_LAW if i % 2 == 0 else LegalCategory.TAX_LAW),
                source_document=f"Source Document {i}",
                language=language or LanguageCode.ARABIC,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            result = LegalSearchResult(
                document=doc,
                similarity_score=0.9 - (i * 0.1),  # Decreasing similarity
                relevance_rank=i
            )
            results.append(result)
        
        return results