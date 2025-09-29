"""
Kanounji 2025 - Legal Intelligence Engine
Revolutionary AI-powered legal signal detection and multi-source intelligence fusion

GAME-CHANGING CAPABILITY: Combine traditional legal documents, real-time government 
social media, parliamentary data, and 9anoun.tn for comprehensive legal intelligence
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import re
from dataclasses import dataclass, field
import hashlib
import time

from scraping.government_social import GovernmentSocialScraper
from scraping.marsad_integration import MarsadParlimentaryMonitor
from scraping.qanoun_scraper import QanounTnScraper
from services.external_llm import ExternalLLMService
from services.performance_metrics import performance_metrics
from services.error_handling import graceful_degradation

logger = logging.getLogger(__name__)

@dataclass
class LegalSignal:
    signal_id: str
    source: str  # 'government_social', 'marsad', '9anoun', 'traditional'
    content: str
    legal_relevance_score: float
    detected_topics: List[str]
    signal_type: str  # 'announcement', 'discussion', 'vote', 'law_change'
    timestamp: datetime
    metadata: Dict[str, Any]

@dataclass
class LegalIntelligence:
    query: str
    traditional_legal: List[Dict[str, Any]]
    government_position: List[LegalSignal]
    parliamentary_context: List[Dict[str, Any]]
    qanoun_references: List[Dict[str, Any]]
    predictive_analysis: Dict[str, Any]
    confidence_score: float
    last_updated: datetime
    sources_summary: Dict[str, int]
    # New efficiency fields
    cache_hits: Dict[str, bool] = field(default_factory=dict)
    data_freshness: Dict[str, datetime] = field(default_factory=dict)
    relevance_scores: Dict[str, float] = field(default_factory=dict)
    processing_time_ms: int = 0

@dataclass
class CacheEntry:
    """Cache entry with TTL support"""
    data: Any
    timestamp: datetime
    ttl_seconds: int
    access_count: int = 0
    last_access: datetime = field(default_factory=datetime.now)
    
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        return datetime.now() > (self.timestamp + timedelta(seconds=self.ttl_seconds))
    
    def access(self) -> Any:
        """Access cached data and update metrics"""
        self.access_count += 1
        self.last_access = datetime.now()
        return self.data

@dataclass
class ProcessingMetrics:
    """Processing metrics for efficiency tracking"""
    total_time_ms: int
    cache_hit_rate: float
    scraped_data_used: int
    scraped_data_available: int
    relevance_filter_efficiency: float
    gemini_api_calls: int
    fallback_used: bool

class LegalSignalDetector:
    """
    AI-powered detection of legal significance in social media posts, 
    parliamentary discussions, and legal documents
    """
    
    def __init__(self):
        self.legal_keywords = {
            'arabic': [
                'قانون جديد', 'مرسوم', 'قرار حكومي', 'تشريع', 'البرلمان',
                'مجلس النواب', 'وزارة العدل', 'محكمة', 'قاضي', 'حكم قضائي',
                'إجراءات قانونية', 'تعديل قانون', 'مشروع قانون', 'لائحة تنفيذية',
                'قرار وزاري', 'أمر حكومي', 'منشور', 'تعليمة', 'دورية',
                'الرائد الرسمي', 'جريدة رسمية', 'نشر رسمي', 'إعلان رسمي',
                'دستور', 'دستوري', 'غير دستوري', 'المحكمة الدستورية',
                'حقوق الإنسان', 'حريات عامة', 'عدالة', 'محاكمة عادلة'
            ],
            'french': [
                'nouvelle loi', 'décret', 'décision gouvernementale', 'législation',
                'parlement', 'assemblée', 'ministère de la justice', 'tribunal',
                'juge', 'jugement', 'procédures légales', 'modification de loi',
                'projet de loi', 'règlement', 'décision ministérielle', 'arrêté',
                'circulaire', 'instruction', 'journal officiel', 'publication officielle',
                'constitution', 'constitutionnel', 'inconstitutionnel', 'cour constitutionnelle',
                'droits de l\'homme', 'libertés publiques', 'justice', 'procès équitable'
            ]
        }
        
        self.legal_categories = {
            'constitutional': ['دستور', 'constitution', 'constitutional'],
            'criminal': ['جزائي', 'جناية', 'جنحة', 'pénal', 'criminel', 'crime'],
            'civil': ['مدني', 'حقوق', 'civil', 'droits civils'],
            'commercial': ['تجاري', 'شركة', 'أعمال', 'commercial', 'entreprise', 'société'],
            'administrative': ['إداري', 'حكومة', 'وزارة', 'administratif', 'gouvernement'],
            'labor': ['شغل', 'عمل', 'موظف', 'travail', 'emploi', 'salarié'],
            'tax': ['ضريبة', 'جباية', 'مالية', 'fiscal', 'impôt', 'taxe'],
            'family': ['أسرة', 'زواج', 'طلاق', 'famille', 'mariage', 'divorce'],
            'property': ['ملكية', 'عقار', 'propriété', 'immobilier']
        }
        
        self.signal_patterns = {
            'law_announcement': [
                r'قانون\s+جديد',
                r'مشروع\s+قانون',
                r'nouvelle\s+loi',
                r'projet\s+de\s+loi'
            ],
            'decree_announcement': [
                r'مرسوم\s+عدد\s+\d+',
                r'décret\s+n°?\s*\d+'
            ],
            'court_decision': [
                r'حكم\s+المحكمة',
                r'قرار\s+قضائي',
                r'décision\s+de\s+justice',
                r'jugement'
            ],
            'parliamentary_vote': [
                r'تصويت\s+البرلمان',
                r'مجلس\s+النواب\s+يصوت',
                r'vote\s+parlement',
                r'assemblée\s+vote'
            ]
        }
    
    def detect_legal_signals(self, content: str, source: str = 'unknown') -> LegalSignal:
        """
        Detect legal significance in text content
        
        Args:
            content: Text content to analyze
            source: Source of the content
            
        Returns:
            LegalSignal with relevance score and detected topics
        """
        try:
            content_lower = content.lower()
            
            # Calculate legal relevance score
            relevance_score = 0.0
            detected_topics = []
            signal_type = 'general'
            
            # Check for legal keywords
            for lang, keywords in self.legal_keywords.items():
                for keyword in keywords:
                    if keyword in content_lower:
                        relevance_score += 1.0
                        if keyword not in detected_topics:
                            detected_topics.append(keyword)
            
            # Check for specific legal patterns
            for pattern_type, patterns in self.signal_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, content, re.IGNORECASE):
                        relevance_score += 3.0
                        signal_type = pattern_type
                        detected_topics.append(pattern_type)
            
            # Check for legal categories
            for category, category_keywords in self.legal_categories.items():
                for keyword in category_keywords:
                    if keyword in content_lower:
                        relevance_score += 1.5
                        detected_topics.append(f"category:{category}")
            
            # Normalize score (0-10 scale)
            relevance_score = min(relevance_score, 10.0)
            
            # Generate signal ID
            signal_id = hashlib.md5(f"{content[:100]}{source}{datetime.now().isoformat()}".encode()).hexdigest()[:12]
            
            return LegalSignal(
                signal_id=signal_id,
                source=source,
                content=content,
                legal_relevance_score=relevance_score,
                detected_topics=detected_topics,
                signal_type=signal_type,
                timestamp=datetime.now(),
                metadata={
                    'content_length': len(content),
                    'language': self._detect_language(content),
                    'urgency': self._assess_urgency(content)
                }
            )
            
        except Exception as e:
            logger.error(f"Error detecting legal signals: {e}")
            return LegalSignal(
                signal_id="error",
                source=source,
                content=content,
                legal_relevance_score=0.0,
                detected_topics=[],
                signal_type='error',
                timestamp=datetime.now(),
                metadata={}
            )
    
    def _detect_language(self, content: str) -> str:
        """Detect content language"""
        arabic_chars = len(re.findall(r'[\u0600-\u06FF]', content))
        latin_chars = len(re.findall(r'[a-zA-Z]', content))
        
        if arabic_chars > latin_chars:
            return 'arabic'
        elif latin_chars > 0:
            return 'french'
        else:
            return 'unknown'
    
    def _assess_urgency(self, content: str) -> str:
        """Assess urgency level of legal content"""
        urgent_keywords = [
            'عاجل', 'urgent', 'فوري', 'immédiat', 'طارئ', 'urgence',
            'اليوم', 'aujourd\'hui', 'الآن', 'maintenant'
        ]
        
        content_lower = content.lower()
        for keyword in urgent_keywords:
            if keyword in content_lower:
                return 'high'
        
        return 'normal'

class LegalChangePredictor:
    """
    Predict legal changes based on social media signals + parliamentary activity
    REVOLUTIONARY: Forecast legal changes before they happen!
    """
    
    def __init__(self):
        self.prediction_models = {
            'law_passage': self._predict_law_passage,
            'policy_change': self._predict_policy_change,
            'regulatory_update': self._predict_regulatory_update
        }
    
    async def predict_law_passage_probability(self, proposed_law_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze:
        - Parliamentary voting patterns (from Marsad)
        - Government social media sentiment
        - Public discussion trends
        - Historical passage rates
        
        Output: Probability + timeline prediction
        """
        try:
            prediction = {
                'law_id': proposed_law_data.get('id', ''),
                'title': proposed_law_data.get('title', ''),
                'passage_probability': 0.0,
                'timeline_estimate': '',
                'confidence': 0.0,
                'key_factors': [],
                'risk_factors': [],
                'recommendation': ''
            }
            
            # Factor 1: Government support signals
            gov_support = await self._analyze_government_support(proposed_law_data)
            
            # Factor 2: Parliamentary dynamics
            parl_support = await self._analyze_parliamentary_support(proposed_law_data)
            
            # Factor 3: Public sentiment
            public_sentiment = await self._analyze_public_sentiment(proposed_law_data)
            
            # Factor 4: Historical precedent
            historical_factor = await self._analyze_historical_precedent(proposed_law_data)
            
            # Factor 5: Legal complexity
            complexity_factor = await self._analyze_legal_complexity(proposed_law_data)
            
            # Weighted calculation
            weights = {
                'government': 0.30,
                'parliament': 0.35,
                'public': 0.15,
                'historical': 0.15,
                'complexity': 0.05
            }
            
            probability = (
                gov_support * weights['government'] +
                parl_support * weights['parliament'] +
                public_sentiment * weights['public'] +
                historical_factor * weights['historical'] +
                complexity_factor * weights['complexity']
            )
            
            prediction['passage_probability'] = min(probability, 1.0)
            
            # Timeline estimation
            if probability > 0.8:
                prediction['timeline_estimate'] = '2-4 weeks'
            elif probability > 0.6:
                prediction['timeline_estimate'] = '1-2 months'
            elif probability > 0.4:
                prediction['timeline_estimate'] = '3-6 months'
            else:
                prediction['timeline_estimate'] = '6+ months or unlikely'
            
            # Confidence based on data availability
            prediction['confidence'] = min(0.85, (gov_support + parl_support + historical_factor) / 3)
            
            # Key factors
            prediction['key_factors'] = [
                f"Government support: {gov_support:.1%}",
                f"Parliamentary alignment: {parl_support:.1%}",
                f"Public sentiment: {public_sentiment:.1%}",
                f"Historical precedent: {historical_factor:.1%}"
            ]
            
            # Risk factors
            if complexity_factor < 0.5:
                prediction['risk_factors'].append("High legal complexity may delay passage")
            if public_sentiment < 0.4:
                prediction['risk_factors'].append("Negative public sentiment")
            if parl_support < 0.5:
                prediction['risk_factors'].append("Insufficient parliamentary support")
            
            # Recommendation
            if probability > 0.7:
                prediction['recommendation'] = "High likelihood of passage - monitor for timeline"
            elif probability > 0.5:
                prediction['recommendation'] = "Moderate likelihood - watch for key developments"
            else:
                prediction['recommendation'] = "Low likelihood - significant changes needed"
            
            return prediction
            
        except Exception as e:
            logger.error(f"Error predicting law passage: {e}")
            return {'passage_probability': 0.5, 'confidence': 0.0, 'error': str(e)}
    
    async def _analyze_government_support(self, law_data: Dict[str, Any]) -> float:
        """Analyze government support based on social media signals"""
        # Placeholder - would analyze actual government social media posts
        sponsor = law_data.get('sponsor', '').lower()
        if 'government' in sponsor or 'حكومة' in sponsor:
            return 0.85
        elif 'ministry' in sponsor or 'وزارة' in sponsor:
            return 0.75
        else:
            return 0.45
    
    async def _analyze_parliamentary_support(self, law_data: Dict[str, Any]) -> float:
        """Analyze parliamentary support based on Marsad data"""
        # Placeholder - would use actual parliamentary voting patterns
        law_type = law_data.get('category', '').lower()
        
        if 'budget' in law_type or 'financial' in law_type:
            return 0.80  # Budget laws usually pass
        elif 'security' in law_type:
            return 0.75  # Security laws often have support
        elif 'social' in law_type:
            return 0.60  # Social laws have mixed support
        else:
            return 0.55  # Default moderate support
    
    async def _analyze_public_sentiment(self, law_data: Dict[str, Any]) -> float:
        """Analyze public sentiment from social media and news"""
        # Placeholder - would analyze social media sentiment
        return 0.65  # Default moderate public support
    
    async def _analyze_historical_precedent(self, law_data: Dict[str, Any]) -> float:
        """Analyze historical passage rates for similar laws"""
        # Placeholder - would analyze historical data
        return 0.70  # Default historical success rate
    
    async def _analyze_legal_complexity(self, law_data: Dict[str, Any]) -> float:
        """Analyze legal complexity that might affect passage"""
        content = law_data.get('content', '')
        
        # Simple complexity indicators
        if len(content) > 10000:  # Very long law
            return 0.4
        elif len(content) > 5000:  # Medium length
            return 0.6
        else:  # Short law
            return 0.8
    
    def _predict_law_passage(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict law passage probability"""
        # Implementation would go here
        return {'probability': 0.7, 'timeline': '2-3 months'}
    
    def _predict_policy_change(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict policy changes"""
        # Implementation would go here
        return {'probability': 0.6, 'timeline': '1-2 months'}
    
    def _predict_regulatory_update(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict regulatory updates"""
        # Implementation would go here
        return {'probability': 0.8, 'timeline': '2-4 weeks'}

class LegalIntelligenceEngine:
    """
    Main engine that combines all legal intelligence sources
    REVOLUTIONARY: Multi-source legal intelligence fusion!
    """
    
    def __init__(self):
        self.signal_detector = LegalSignalDetector()
        self.change_predictor = LegalChangePredictor()
        self.gov_scraper = GovernmentSocialScraper()
        self.marsad_monitor = MarsadParlimentaryMonitor()
        self.qanoun_scraper = QanounTnScraper()
        self.external_llm = ExternalLLMService()
        
        # Smart caching system
        self.data_cache: Dict[str, CacheEntry] = {}
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'evictions': 0,
            'total_requests': 0
        }
        
        # Cache TTL settings (in seconds)
        self.cache_ttl = {
            'government_data': 1800,  # 30 minutes
            'parliamentary_data': 3600,  # 1 hour
            'qanoun_data': 7200,  # 2 hours
            'traditional_legal': 14400,  # 4 hours
            'query_results': 900  # 15 minutes
        }
        
        # Cache size limits
        self.max_cache_size = 1000
        self.cache_cleanup_threshold = 0.8  # Clean when 80% full
        
        # Relevance filtering settings
        self.relevance_thresholds = {
            'government_signals': 3.0,  # Minimum legal relevance score
            'parliamentary_data': 0.4,  # Minimum relevance to query
            'qanoun_references': 0.3,   # Minimum relevance to query
            'minimum_confidence': 0.6   # Overall minimum confidence
        }
        
        # Processing metrics tracking
        self.processing_metrics = {
            'total_queries': 0,
            'total_processing_time_ms': 0,
            'avg_processing_time_ms': 0,
            'data_source_usage': {
                'government_data': {'requests': 0, 'cache_hits': 0, 'data_used': 0, 'data_available': 0},
                'parliamentary_data': {'requests': 0, 'cache_hits': 0, 'data_used': 0, 'data_available': 0},
                'qanoun_data': {'requests': 0, 'cache_hits': 0, 'data_used': 0, 'data_available': 0},
                'traditional_legal': {'requests': 0, 'cache_hits': 0, 'data_used': 0, 'data_available': 0}
            },
            'relevance_filter_stats': {
                'government_signals': {'total_processed': 0, 'passed_filter': 0, 'avg_relevance': 0.0},
                'parliamentary_data': {'total_processed': 0, 'passed_filter': 0, 'avg_relevance': 0.0},
                'qanoun_references': {'total_processed': 0, 'passed_filter': 0, 'avg_relevance': 0.0}
            },
            'resource_utilization': {
                'gemini_api_calls': 0,
                'scraping_operations': 0,
                'cache_operations': 0,
                'fallback_usage': 0
            }
        }
        
    async def initialize(self):
        """Initialize all intelligence sources"""
        try:
            await self.gov_scraper.initialize()
            await self.marsad_monitor.initialize()
            await self.qanoun_scraper.initialize()
            logger.info("Legal Intelligence Engine initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize Legal Intelligence Engine: {e}")
            return False
    
    async def process_enhanced_legal_query(self, query: str, user_context: Dict = None) -> LegalIntelligence:
        """
        Revolutionary legal query processing that combines:
        1. Traditional legal documents (existing)
        2. Real-time government positions (from social media)
        3. Current parliamentary discussions (from Marsad)
        4. 9anoun.tn legal database
        5. Predictive analysis (future legal changes)
        """
        start_time = time.time()
        query_id = user_context.get('query_id', 'unknown') if user_context else 'unknown'
        
        try:
            logger.info(f"Processing enhanced legal query: {query[:50]}...")
            
            # Start performance tracking
            await performance_metrics.track_component_performance(
                'legal_intelligence', 0, True  # Will update with actual time later
            )
            
            # Track cache hits for this query
            initial_cache_stats = self.cache_stats.copy()
            
            # Initialize results structure
            intelligence = LegalIntelligence(
                query=query,
                traditional_legal=[],
                government_position=[],
                parliamentary_context=[],
                qanoun_references=[],
                predictive_analysis={},
                confidence_score=0.0,
                last_updated=datetime.now(),
                sources_summary={},
                cache_hits={},
                data_freshness={},
                relevance_scores={}
            )
            
            # 1. Search traditional legal documents (existing system)
            # This would integrate with your existing legal RAG
            trad_start = time.time()
            intelligence.traditional_legal = await self._search_traditional_legal(query)
            trad_time = int((time.time() - trad_start) * 1000)
            await performance_metrics.track_intelligence_source_performance(
                'traditional_legal', True, len(intelligence.traditional_legal), 
                len(intelligence.traditional_legal), 0.8, trad_time
            )
            
            # 2. Get real-time government position
            gov_start = time.time()
            intelligence.government_position = await self._get_government_position(query)
            gov_time = int((time.time() - gov_start) * 1000)
            await performance_metrics.track_intelligence_source_performance(
                'government_data', len(intelligence.government_position) > 0, 
                len(intelligence.government_position), len(intelligence.government_position), 
                sum(s.legal_relevance_score for s in intelligence.government_position) / max(len(intelligence.government_position), 1) / 10,
                gov_time
            )
            
            # 3. Get parliamentary context
            parl_start = time.time()
            intelligence.parliamentary_context = await self._get_parliamentary_context(query)
            parl_time = int((time.time() - parl_start) * 1000)
            await performance_metrics.track_intelligence_source_performance(
                'parliamentary_data', len(intelligence.parliamentary_context) > 0,
                len(intelligence.parliamentary_context), len(intelligence.parliamentary_context),
                sum(s.get('query_relevance', 0) for s in intelligence.parliamentary_context) / max(len(intelligence.parliamentary_context), 1),
                parl_time
            )
            
            # 4. Search 9anoun.tn database
            qanoun_start = time.time()
            intelligence.qanoun_references = await self._search_qanoun_database(query)
            qanoun_time = int((time.time() - qanoun_start) * 1000)
            await performance_metrics.track_intelligence_source_performance(
                'qanoun_data', len(intelligence.qanoun_references) > 0,
                len(intelligence.qanoun_references), len(intelligence.qanoun_references),
                sum(r.get('query_relevance', 0) for r in intelligence.qanoun_references) / max(len(intelligence.qanoun_references), 1),
                qanoun_time
            )
            
            # 5. Generate predictive analysis
            intelligence.predictive_analysis = await self._generate_predictive_analysis(query, intelligence)
            
            # 6. Calculate overall confidence
            intelligence.confidence_score = await self._calculate_confidence_score(intelligence)
            
            # 7. Generate sources summary
            intelligence.sources_summary = {
                'traditional_legal': len(intelligence.traditional_legal),
                'government_signals': len(intelligence.government_position),
                'parliamentary_data': len(intelligence.parliamentary_context),
                'qanoun_references': len(intelligence.qanoun_references)
            }
            
            # 8. Track cache performance for this query
            final_cache_stats = self.cache_stats.copy()
            intelligence.cache_hits = {
                'government_data': (final_cache_stats['hits'] - initial_cache_stats['hits']) > 0,
                'parliamentary_data': (final_cache_stats['hits'] - initial_cache_stats['hits']) > 0,
                'qanoun_data': (final_cache_stats['hits'] - initial_cache_stats['hits']) > 0
            }
            
            # 9. Track data freshness
            intelligence.data_freshness = {
                'government_data': datetime.now(),
                'parliamentary_data': datetime.now(),
                'qanoun_data': datetime.now()
            }
            
            # 10. Track relevance scores
            intelligence.relevance_scores = {
                'government_avg': sum(s.metadata.get('query_relevance', 0) for s in intelligence.government_position) / max(len(intelligence.government_position), 1),
                'parliamentary_avg': sum(s.get('query_relevance', 0) for s in intelligence.parliamentary_context) / max(len(intelligence.parliamentary_context), 1),
                'qanoun_avg': sum(r.get('query_relevance', 0) for r in intelligence.qanoun_references) / max(len(intelligence.qanoun_references), 1)
            }
            
            # 11. Calculate processing time
            processing_time = int((time.time() - start_time) * 1000)
            intelligence.processing_time_ms = processing_time
            
            # 12. Update processing metrics
            self._update_processing_metrics(intelligence, processing_time)
            
            # 13. Track resource utilization
            self._track_resource_utilization('cache_operations', len(self.data_cache))
            
            # 14. Update performance metrics service
            await performance_metrics.track_component_performance(
                'legal_intelligence', processing_time, True
            )
            
            # Track query-specific intelligence usage
            for source in ['government_data', 'parliamentary_data', 'qanoun_data', 'traditional_legal']:
                source_success = len(getattr(intelligence, source.replace('_data', '_position' if 'government' in source else '_context' if 'parliamentary' in source else '_references' if 'qanoun' in source else ''), [])) > 0
                await performance_metrics.track_query_intelligence_usage(
                    query_id, source, source_success, processing_time // 4,  # Approximate time per source
                    intelligence.relevance_scores.get(source.replace('_data', '_avg'), 0.0)
                )
            
            logger.info(f"Enhanced legal intelligence generated with {sum(intelligence.sources_summary.values())} total sources in {processing_time}ms")
            
            # Log performance summary periodically
            if self.processing_metrics['total_queries'] % 10 == 0:
                self.log_performance_summary()
            
            return intelligence
            
        except Exception as e:
            logger.error(f"Error processing enhanced legal query: {e}")
            # Track failed component performance
            processing_time = int((time.time() - start_time) * 1000)
            await performance_metrics.track_component_performance(
                'legal_intelligence', processing_time, False, str(e)
            )
            
            # Return basic intelligence structure with error info
            return LegalIntelligence(
                query=query,
                traditional_legal=[],
                government_position=[],
                parliamentary_context=[],
                qanoun_references=[],
                predictive_analysis={'error': str(e)},
                confidence_score=0.0,
                last_updated=datetime.now(),
                sources_summary={},
                processing_time_ms=processing_time
            )
    
    async def _search_traditional_legal(self, query: str) -> List[Dict[str, Any]]:
        """Search traditional legal documents (integrate with existing RAG)"""
        # This would integrate with your existing legal_rag service
        # For now, return placeholder
        return [
            {
                'title': 'Traditional Legal Document',
                'content': 'Legal content from existing database',
                'source': 'traditional_database',
                'relevance': 0.8
            }
        ]
    
    async def _get_government_position(self, query: str) -> List[LegalSignal]:
        """Get current government position from social media with caching and graceful degradation"""
        try:
            # Generate cache key based on query relevance
            cache_key = self._generate_cache_key(query, 'government_data')
            
            # Try to get from cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data is not None:
                await graceful_degradation.update_service_health('government_scraper', True, 50)
                return cached_data
            
            # Get recent government posts
            self._track_resource_utilization('scraping_operations')
            gov_posts = await self.gov_scraper.scrape_all_accounts()
            
            # Process all posts into signals
            all_signals = []
            for post in gov_posts:
                signal = self.signal_detector.detect_legal_signals(
                    post.content, 
                    f"government_social_{post.platform}"
                )
                all_signals.append(signal)
            
            # Track data availability
            self.processing_metrics['data_source_usage']['government_data']['data_available'] += len(all_signals)
            
            # Apply relevance filtering
            filtered_signals = self._filter_government_signals(all_signals, query)
            
            # Update filter stats
            filter_stats = self.processing_metrics['relevance_filter_stats']['government_signals']
            filter_stats['total_processed'] += len(all_signals)
            
            # Get top 5 most relevant
            top_signals = filtered_signals[:5]
            
            # Store in cache
            self._store_in_cache(cache_key, top_signals, 'government_data')
            
            # Update service health on success
            await graceful_degradation.update_service_health('government_scraper', True, 200)
            
            return top_signals
            
        except Exception as e:
            logger.error(f"Error getting government position: {e}")
            
            # Handle graceful degradation
            await graceful_degradation.update_service_health('government_scraper', False, error_message=str(e))
            fallback_data = await graceful_degradation.handle_government_scraper_failure(query, str(e))
            
            # Log error with context but continue processing
            logger.warning(f"Government scraper failed, continuing with available data: {e}")
            
            return fallback_data.get('government_position', [])
    
    async def _get_parliamentary_context(self, query: str) -> List[Dict[str, Any]]:
        """Get parliamentary context from Marsad with caching and graceful degradation"""
        try:
            # Generate cache key based on query relevance
            cache_key = self._generate_cache_key(query, 'parliamentary_data')
            
            # Try to get from cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data is not None:
                await graceful_degradation.update_service_health('parliamentary_monitor', True, 50)
                return cached_data
            
            # Get recent parliamentary sessions
            self._track_resource_utilization('scraping_operations')
            sessions = await self.marsad_monitor.get_parliamentary_sessions(days_back=30)
            
            # Convert sessions to standard format
            all_sessions = []
            for session in sessions:
                all_sessions.append({
                    'session_id': session.session_id,
                    'date': session.date.isoformat(),
                    'topics': session.topics,
                    'type': session.session_type,
                    'url': session.marsad_url
                })
            
            # Track data availability
            self.processing_metrics['data_source_usage']['parliamentary_data']['data_available'] += len(all_sessions)
            
            # Apply relevance filtering
            filtered_sessions = self._filter_parliamentary_data(all_sessions, query)
            
            # Update filter stats
            filter_stats = self.processing_metrics['relevance_filter_stats']['parliamentary_data']
            filter_stats['total_processed'] += len(all_sessions)
            
            # Get top 3 most relevant
            top_sessions = filtered_sessions[:3]
            
            # Store in cache
            self._store_in_cache(cache_key, top_sessions, 'parliamentary_data')
            
            # Update service health on success
            await graceful_degradation.update_service_health('parliamentary_monitor', True, 300)
            
            return top_sessions
            
        except Exception as e:
            logger.error(f"Error getting parliamentary context: {e}")
            
            # Handle graceful degradation
            await graceful_degradation.update_service_health('parliamentary_monitor', False, error_message=str(e))
            fallback_data = await graceful_degradation.handle_parliamentary_data_failure(query, str(e))
            
            # Log error with context but continue processing
            logger.warning(f"Parliamentary monitor failed, continuing with available data: {e}")
            
            return fallback_data.get('parliamentary_context', [])
            top_sessions = filtered_sessions[:3]
            
            # Store in cache
            self._store_in_cache(cache_key, top_sessions, 'parliamentary_data')
            
            return top_sessions
            
        except Exception as e:
            logger.error(f"Error getting parliamentary context: {e}")
            return []
    
    async def _search_qanoun_database(self, query: str) -> List[Dict[str, Any]]:
        """Search 9anoun.tn database with caching"""
        try:
            # Generate cache key based on query relevance
            cache_key = self._generate_cache_key(query, 'qanoun_data')
            
            # Try to get from cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data is not None:
                return cached_data
            
            # Search 9anoun.tn for relevant legal documents
            self._track_resource_utilization('scraping_operations')
            qanoun_results = await self.qanoun_scraper.search_legal_documents(query)
            
            # Format results
            formatted_results = []
            for result in qanoun_results:
                formatted_results.append({
                    'title': result.get('title', ''),
                    'summary': result.get('summary', ''),
                    'url': result.get('url', ''),
                    'category': result.get('category', ''),
                    'date': result.get('date', ''),
                    'source': '9anoun.tn',
                    'legal_reference': result.get('legal_reference', '')
                })
            
            # Track data availability
            self.processing_metrics['data_source_usage']['qanoun_data']['data_available'] += len(formatted_results)
            
            # Apply relevance filtering
            filtered_results = self._filter_qanoun_references(formatted_results, query)
            
            # Update filter stats
            filter_stats = self.processing_metrics['relevance_filter_stats']['qanoun_references']
            filter_stats['total_processed'] += len(formatted_results)
            
            # Get top 5 most relevant
            top_results = filtered_results[:5]
            
            # Store in cache
            self._store_in_cache(cache_key, top_results, 'qanoun_data')
            
            # Update service health on success
            await graceful_degradation.update_service_health('qanoun_scraper', True, 400)
            
            return top_results
            
        except Exception as e:
            logger.error(f"Error searching 9anoun database: {e}")
            
            # Handle graceful degradation
            await graceful_degradation.update_service_health('qanoun_scraper', False, error_message=str(e))
            fallback_data = await graceful_degradation.handle_qanoun_scraper_failure(query, str(e))
            
            # Log error with context but continue processing
            logger.warning(f"Qanoun scraper failed, continuing with available data: {e}")
            
            return fallback_data.get('qanoun_references', [])
    
    async def _generate_predictive_analysis(self, query: str, intelligence: LegalIntelligence) -> Dict[str, Any]:
        """Generate predictive analysis based on all available data"""
        try:
            # Analyze query for prediction type
            prediction_type = self._determine_prediction_type(query)
            
            # Create mock law data for prediction
            law_data = {
                'id': f"query_{hash(query)}",
                'title': f"Legal matter related to: {query}",
                'category': self._extract_legal_category(query),
                'sponsor': 'unknown',
                'content': query
            }
            
            # Generate prediction
            if prediction_type == 'law_passage':
                prediction = await self.change_predictor.predict_law_passage_probability(law_data)
            else:
                prediction = {
                    'prediction_type': prediction_type,
                    'likelihood': 0.6,
                    'timeline': '2-3 months',
                    'confidence': 0.7,
                    'factors': ['Limited data available for prediction']
                }
            
            # Add trend analysis
            prediction['trends'] = await self._analyze_legal_trends(query, intelligence)
            
            return prediction
            
        except Exception as e:
            logger.error(f"Error generating predictive analysis: {e}")
            return {'error': str(e)}
    
    def _is_relevant_to_query(self, content: str, query: str) -> bool:
        """Check if content is relevant to the query"""
        query_words = query.lower().split()
        content_lower = content.lower()
        
        # Simple relevance check - at least 2 query words in content
        matches = sum(1 for word in query_words if word in content_lower)
        return matches >= min(2, len(query_words))
    
    def _calculate_relevance(self, content: str, query: str) -> float:
        """Calculate relevance score between content and query"""
        query_words = set(query.lower().split())
        content_words = set(content.lower().split())
        
        if not query_words:
            return 0.0
        
        # Jaccard similarity
        intersection = len(query_words.intersection(content_words))
        union = len(query_words.union(content_words))
        
        return intersection / union if union > 0 else 0.0
    
    def _determine_prediction_type(self, query: str) -> str:
        """Determine what type of prediction to make"""
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['قانون', 'law', 'loi']):
            return 'law_passage'
        elif any(word in query_lower for word in ['سياسة', 'policy', 'politique']):
            return 'policy_change'
        elif any(word in query_lower for word in ['لائحة', 'regulation', 'règlement']):
            return 'regulatory_update'
        else:
            return 'general_legal_change'
    
    def _extract_legal_category(self, query: str) -> str:
        """Extract legal category from query"""
        query_lower = query.lower()
        
        for category, keywords in self.signal_detector.legal_categories.items():
            if any(keyword in query_lower for keyword in keywords):
                return category
        
        return 'general'
    
    async def _analyze_legal_trends(self, query: str, intelligence: LegalIntelligence) -> Dict[str, Any]:
        """Analyze legal trends based on available data"""
        trends = {
            'government_activity': 'moderate',
            'parliamentary_interest': 'low',
            'public_discussion': 'moderate',
            'recent_changes': []
        }
        
        # Analyze government activity
        if len(intelligence.government_position) > 3:
            trends['government_activity'] = 'high'
        elif len(intelligence.government_position) > 1:
            trends['government_activity'] = 'moderate'
        else:
            trends['government_activity'] = 'low'
        
        # Analyze parliamentary interest
        if len(intelligence.parliamentary_context) > 2:
            trends['parliamentary_interest'] = 'high'
        elif len(intelligence.parliamentary_context) > 0:
            trends['parliamentary_interest'] = 'moderate'
        
        return trends
    
    async def _calculate_confidence_score(self, intelligence: LegalIntelligence) -> float:
        """Calculate overall confidence score based on available data"""
        total_sources = sum(intelligence.sources_summary.values())
        
        if total_sources >= 10:
            return 0.9
        elif total_sources >= 5:
            return 0.75
        elif total_sources >= 2:
            return 0.6
        else:
            return 0.4
    
    async def close(self):
        """Close all connections"""
        await self.gov_scraper.close()
        await self.marsad_monitor.close()
        await self.qanoun_scraper.close()

# Background task for legal signal processing
async def legal_signal_processing():
    """
    Continuous processing of legal signals from all sources
    REVOLUTIONARY: Real-time legal intelligence processing!
    """
    engine = LegalIntelligenceEngine()
    
    try:
        await engine.initialize()
        
        while True:
            logger.info("Starting legal signal processing cycle...")
            
            # Process signals from all sources
            # This would integrate with your database to store and process signals
            
            # Wait 20 minutes before next cycle
            await asyncio.sleep(1200)
            
    except Exception as e:
        logger.error(f"Error in legal signal processing: {e}")
    finally:
        await engine.close()

# End of legal signal processing function
        """Generate cache key based on query relevance and context"""
        # Normalize query for consistent caching
        normalized_query = re.sub(r'\s+', ' ', query.lower().strip())
        
        # Extract key terms for relevance-based caching
        key_terms = self._extract_key_terms(normalized_query)
        
        # Create context hash if provided
        context_hash = ""
        if context:
            context_str = json.dumps(context, sort_keys=True, default=str)
            context_hash = hashlib.md5(context_str.encode()).hexdigest()[:8]
        
        # Generate cache key
        cache_key = f"{data_type}:{':'.join(sorted(key_terms))}:{context_hash}"
        return hashlib.md5(cache_key.encode()).hexdigest()
    
    def _extract_key_terms(self, query: str) -> List[str]:
        """Extract key terms from query for cache key generation"""
        # Remove common words and extract meaningful terms
        stop_words = {
            'في', 'من', 'إلى', 'على', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'le', 'la', 'les', 'un', 'une', 'et', 'ou', 'dans', 'sur', 'pour'
        }
        
        words = query.split()
        key_terms = [word for word in words if len(word) > 2 and word not in stop_words]
        
        # Limit to top 5 most relevant terms
        return key_terms[:5]
    
    def _get_from_cache(self, cache_key: str) -> Optional[Any]:
        """Get data from cache with hit/miss tracking"""
        self.cache_stats['total_requests'] += 1
        
        if cache_key in self.data_cache:
            entry = self.data_cache[cache_key]
            
            if not entry.is_expired():
                self.cache_stats['hits'] += 1
                logger.debug(f"Cache hit for key: {cache_key[:16]}...")
                return entry.access()
            else:
                # Remove expired entry
                del self.data_cache[cache_key]
                logger.debug(f"Cache entry expired for key: {cache_key[:16]}...")
        
        self.cache_stats['misses'] += 1
        logger.debug(f"Cache miss for key: {cache_key[:16]}...")
        return None
    
    def _store_in_cache(self, cache_key: str, data: Any, data_type: str):
        """Store data in cache with TTL"""
        # Clean cache if needed
        if len(self.data_cache) >= self.max_cache_size * self.cache_cleanup_threshold:
            self._cleanup_cache()
        
        ttl = self.cache_ttl.get(data_type, 3600)  # Default 1 hour
        
        entry = CacheEntry(
            data=data,
            timestamp=datetime.now(),
            ttl_seconds=ttl
        )
        
        self.data_cache[cache_key] = entry
        logger.debug(f"Stored in cache: {cache_key[:16]}... (TTL: {ttl}s)")
    
    def _cleanup_cache(self):
        """Clean expired and least recently used cache entries"""
        current_time = datetime.now()
        
        # Remove expired entries
        expired_keys = [
            key for key, entry in self.data_cache.items()
            if entry.is_expired()
        ]
        
        for key in expired_keys:
            del self.data_cache[key]
            self.cache_stats['evictions'] += 1
        
        # If still too full, remove least recently used
        if len(self.data_cache) >= self.max_cache_size * self.cache_cleanup_threshold:
            # Sort by last access time
            sorted_entries = sorted(
                self.data_cache.items(),
                key=lambda x: x[1].last_access
            )
            
            # Remove oldest 20%
            remove_count = int(len(sorted_entries) * 0.2)
            for key, _ in sorted_entries[:remove_count]:
                del self.data_cache[key]
                self.cache_stats['evictions'] += 1
        
        logger.info(f"Cache cleanup completed. Removed {len(expired_keys)} expired entries")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self.cache_stats['total_requests']
        hit_rate = (self.cache_stats['hits'] / total_requests) if total_requests > 0 else 0
        
        return {
            'hit_rate': hit_rate,
            'total_hits': self.cache_stats['hits'],
            'total_misses': self.cache_stats['misses'],
            'total_evictions': self.cache_stats['evictions'],
            'cache_size': len(self.data_cache),
            'max_cache_size': self.max_cache_size
        }
    
    def _calculate_government_signal_relevance(self, signal: LegalSignal, query: str) -> float:
        """Calculate relevance score for government signals"""
        try:
            # Base score from legal signal detector
            base_score = signal.legal_relevance_score
            
            # Query relevance boost
            query_relevance = self._calculate_text_relevance(signal.content, query)
            
            # Topic alignment boost
            topic_boost = 0.0
            query_lower = query.lower()
            for topic in signal.detected_topics:
                if any(term in topic.lower() for term in query_lower.split()):
                    topic_boost += 0.5
            
            # Recency boost (newer signals are more relevant)
            hours_old = (datetime.now() - signal.timestamp).total_seconds() / 3600
            recency_boost = max(0, 2.0 - (hours_old / 24))  # Boost for signals < 48 hours
            
            # Signal type boost
            type_boost = {
                'law_announcement': 3.0,
                'decree_announcement': 2.5,
                'court_decision': 2.0,
                'parliamentary_vote': 2.0,
                'general': 1.0
            }.get(signal.signal_type, 1.0)
            
            # Calculate final relevance score
            final_score = (base_score * 0.4) + (query_relevance * 10 * 0.3) + (topic_boost * 0.2) + (recency_boost * 0.1)
            final_score *= (type_boost / 2.0)  # Normalize type boost
            
            return min(final_score, 10.0)
            
        except Exception as e:
            logger.error(f"Error calculating government signal relevance: {e}")
            return 0.0
    
    def _calculate_parliamentary_relevance(self, session_data: Dict[str, Any], query: str) -> float:
        """Calculate relevance score for parliamentary data"""
        try:
            # Topic relevance
            topics_text = ' '.join(session_data.get('topics', []))
            topic_relevance = self._calculate_text_relevance(topics_text, query)
            
            # Session type relevance
            session_type = session_data.get('type', '').lower()
            type_relevance = {
                'voting': 1.0,
                'discussion': 0.8,
                'committee': 0.7,
                'hearing': 0.6,
                'general': 0.5
            }.get(session_type, 0.5)
            
            # Recency factor
            session_date = datetime.fromisoformat(session_data.get('date', datetime.now().isoformat()))
            days_old = (datetime.now() - session_date).days
            recency_factor = max(0.1, 1.0 - (days_old / 90))  # Decay over 90 days
            
            # Calculate final score
            final_score = (topic_relevance * 0.6) + (type_relevance * 0.3) + (recency_factor * 0.1)
            
            return final_score
            
        except Exception as e:
            logger.error(f"Error calculating parliamentary relevance: {e}")
            return 0.0
    
    def _calculate_qanoun_relevance(self, qanoun_data: Dict[str, Any], query: str) -> float:
        """Calculate relevance score for 9anoun references"""
        try:
            # Title and summary relevance
            title = qanoun_data.get('title', '')
            summary = qanoun_data.get('summary', '')
            content_text = f"{title} {summary}"
            
            content_relevance = self._calculate_text_relevance(content_text, query)
            
            # Category relevance
            category = qanoun_data.get('category', '').lower()
            query_category = self._extract_legal_category(query)
            
            category_boost = 0.2 if category == query_category else 0.0
            
            # Legal reference boost (official documents are more relevant)
            legal_ref = qanoun_data.get('legal_reference', '')
            ref_boost = 0.1 if legal_ref else 0.0
            
            # Calculate final score
            final_score = content_relevance + category_boost + ref_boost
            
            return min(final_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating 9anoun relevance: {e}")
            return 0.0
    
    def _calculate_text_relevance(self, text: str, query: str) -> float:
        """Calculate text relevance using improved algorithm"""
        try:
            if not text or not query:
                return 0.0
            
            text_lower = text.lower()
            query_lower = query.lower()
            
            # Tokenize
            text_words = set(re.findall(r'\w+', text_lower))
            query_words = set(re.findall(r'\w+', query_lower))
            
            if not query_words:
                return 0.0
            
            # Exact phrase matching (highest weight)
            phrase_score = 0.0
            if query_lower in text_lower:
                phrase_score = 0.5
            
            # Word overlap (Jaccard similarity)
            intersection = len(query_words.intersection(text_words))
            union = len(query_words.union(text_words))
            jaccard_score = intersection / union if union > 0 else 0.0
            
            # Key term matching (important legal terms get higher weight)
            key_terms_score = 0.0
            legal_key_terms = {
                'قانون', 'مرسوم', 'قرار', 'محكمة', 'حكم', 'دستور',
                'law', 'decree', 'decision', 'court', 'judgment', 'constitution',
                'loi', 'décret', 'décision', 'tribunal', 'jugement', 'constitution'
            }
            
            for term in query_words:
                if term in legal_key_terms and term in text_words:
                    key_terms_score += 0.1
            
            # Combine scores
            final_score = phrase_score + (jaccard_score * 0.4) + key_terms_score
            
            return min(final_score, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating text relevance: {e}")
            return 0.0
    
    def _filter_government_signals(self, signals: List[LegalSignal], query: str) -> List[LegalSignal]:
        """Filter government signals by relevance"""
        try:
            filtered_signals = []
            threshold = self.relevance_thresholds['government_signals']
            
            for signal in signals:
                relevance_score = self._calculate_government_signal_relevance(signal, query)
                
                if relevance_score >= threshold:
                    # Add relevance score to signal metadata
                    signal.metadata['query_relevance'] = relevance_score
                    filtered_signals.append(signal)
            
            # Sort by relevance score
            filtered_signals.sort(key=lambda s: s.metadata.get('query_relevance', 0), reverse=True)
            
            logger.debug(f"Filtered government signals: {len(filtered_signals)}/{len(signals)} passed threshold {threshold}")
            return filtered_signals
            
        except Exception as e:
            logger.error(f"Error filtering government signals: {e}")
            return signals  # Return original on error
    
    def _filter_parliamentary_data(self, sessions: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """Filter parliamentary data by relevance"""
        try:
            filtered_sessions = []
            threshold = self.relevance_thresholds['parliamentary_data']
            
            for session in sessions:
                relevance_score = self._calculate_parliamentary_relevance(session, query)
                
                if relevance_score >= threshold:
                    session['query_relevance'] = relevance_score
                    filtered_sessions.append(session)
            
            # Sort by relevance score
            filtered_sessions.sort(key=lambda s: s.get('query_relevance', 0), reverse=True)
            
            logger.debug(f"Filtered parliamentary data: {len(filtered_sessions)}/{len(sessions)} passed threshold {threshold}")
            return filtered_sessions
            
        except Exception as e:
            logger.error(f"Error filtering parliamentary data: {e}")
            return sessions  # Return original on error
    
    def _filter_qanoun_references(self, references: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """Filter 9anoun references by relevance"""
        try:
            filtered_references = []
            threshold = self.relevance_thresholds['qanoun_references']
            
            for reference in references:
                relevance_score = self._calculate_qanoun_relevance(reference, query)
                
                if relevance_score >= threshold:
                    reference['query_relevance'] = relevance_score
                    filtered_references.append(reference)
            
            # Sort by relevance score
            filtered_references.sort(key=lambda r: r.get('query_relevance', 0), reverse=True)
            
            logger.debug(f"Filtered 9anoun references: {len(filtered_references)}/{len(references)} passed threshold {threshold}")
            return filtered_references
            
        except Exception as e:
            logger.error(f"Error filtering 9anoun references: {e}")
            return references  # Return original on error
    
    def _update_processing_metrics(self, intelligence: LegalIntelligence, processing_time_ms: int):
        """Update processing metrics after query completion"""
        try:
            # Update overall metrics
            self.processing_metrics['total_queries'] += 1
            self.processing_metrics['total_processing_time_ms'] += processing_time_ms
            self.processing_metrics['avg_processing_time_ms'] = (
                self.processing_metrics['total_processing_time_ms'] / 
                self.processing_metrics['total_queries']
            )
            
            # Update data source usage metrics
            for source_type in ['government_data', 'parliamentary_data', 'qanoun_data']:
                source_metrics = self.processing_metrics['data_source_usage'][source_type]
                source_metrics['requests'] += 1
                
                # Track cache hits
                if intelligence.cache_hits.get(source_type, False):
                    source_metrics['cache_hits'] += 1
                
                # Track data usage vs availability
                if source_type == 'government_data':
                    source_metrics['data_used'] += len(intelligence.government_position)
                    # Would track total available from scraper
                elif source_type == 'parliamentary_data':
                    source_metrics['data_used'] += len(intelligence.parliamentary_context)
                elif source_type == 'qanoun_data':
                    source_metrics['data_used'] += len(intelligence.qanoun_references)
            
            # Update relevance filter efficiency
            for filter_type in ['government_signals', 'parliamentary_data', 'qanoun_references']:
                filter_stats = self.processing_metrics['relevance_filter_stats'][filter_type]
                
                if filter_type == 'government_signals':
                    passed_count = len(intelligence.government_position)
                    avg_relevance = intelligence.relevance_scores.get('government_avg', 0.0)
                elif filter_type == 'parliamentary_data':
                    passed_count = len(intelligence.parliamentary_context)
                    avg_relevance = intelligence.relevance_scores.get('parliamentary_avg', 0.0)
                elif filter_type == 'qanoun_references':
                    passed_count = len(intelligence.qanoun_references)
                    avg_relevance = intelligence.relevance_scores.get('qanoun_avg', 0.0)
                
                filter_stats['passed_filter'] += passed_count
                
                # Update running average of relevance scores
                if filter_stats['total_processed'] > 0:
                    filter_stats['avg_relevance'] = (
                        (filter_stats['avg_relevance'] * filter_stats['total_processed'] + avg_relevance) /
                        (filter_stats['total_processed'] + 1)
                    )
                else:
                    filter_stats['avg_relevance'] = avg_relevance
                
                filter_stats['total_processed'] += 1
            
            logger.debug(f"Updated processing metrics for query")
            
        except Exception as e:
            logger.error(f"Error updating processing metrics: {e}")
    
    def _track_resource_utilization(self, operation_type: str, count: int = 1):
        """Track resource utilization for optimization"""
        try:
            if operation_type in self.processing_metrics['resource_utilization']:
                self.processing_metrics['resource_utilization'][operation_type] += count
            
        except Exception as e:
            logger.error(f"Error tracking resource utilization: {e}")
    
    def get_processing_metrics(self) -> Dict[str, Any]:
        """Get comprehensive processing metrics"""
        try:
            metrics = self.processing_metrics.copy()
            
            # Add cache statistics
            cache_stats = self.get_cache_stats()
            metrics['cache_performance'] = cache_stats
            
            # Calculate efficiency ratios
            metrics['efficiency_ratios'] = {}
            
            for source_type, source_data in metrics['data_source_usage'].items():
                if source_data['requests'] > 0:
                    cache_hit_rate = source_data['cache_hits'] / source_data['requests']
                    metrics['efficiency_ratios'][f'{source_type}_cache_hit_rate'] = cache_hit_rate
                    
                    if source_data['data_available'] > 0:
                        usage_ratio = source_data['data_used'] / source_data['data_available']
                        metrics['efficiency_ratios'][f'{source_type}_usage_ratio'] = usage_ratio
            
            # Calculate relevance filter efficiency
            for filter_type, filter_data in metrics['relevance_filter_stats'].items():
                if filter_data['total_processed'] > 0:
                    filter_efficiency = filter_data['passed_filter'] / filter_data['total_processed']
                    metrics['efficiency_ratios'][f'{filter_type}_filter_efficiency'] = filter_efficiency
            
            # Add performance indicators
            metrics['performance_indicators'] = {
                'avg_response_time_ms': metrics['avg_processing_time_ms'],
                'total_queries_processed': metrics['total_queries'],
                'overall_cache_hit_rate': cache_stats['hit_rate'],
                'resource_efficiency_score': self._calculate_resource_efficiency_score()
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error getting processing metrics: {e}")
            return {}
    
    def _calculate_resource_efficiency_score(self) -> float:
        """Calculate overall resource efficiency score (0-1)"""
        try:
            scores = []
            
            # Cache efficiency (higher is better)
            cache_hit_rate = self.get_cache_stats()['hit_rate']
            scores.append(cache_hit_rate)
            
            # Processing speed efficiency (faster is better, normalized to 0-1)
            avg_time = self.processing_metrics['avg_processing_time_ms']
            if avg_time > 0:
                # Assume 5000ms is target, 10000ms is poor
                speed_score = max(0, min(1, (10000 - avg_time) / 5000))
                scores.append(speed_score)
            
            # Data utilization efficiency
            total_used = 0
            total_available = 0
            for source_data in self.processing_metrics['data_source_usage'].values():
                total_used += source_data['data_used']
                total_available += source_data['data_available']
            
            if total_available > 0:
                utilization_score = min(1, total_used / total_available)
                scores.append(utilization_score)
            
            # Relevance filter efficiency
            filter_scores = []
            for filter_data in self.processing_metrics['relevance_filter_stats'].values():
                if filter_data['total_processed'] > 0:
                    filter_efficiency = filter_data['passed_filter'] / filter_data['total_processed']
                    filter_scores.append(filter_efficiency)
            
            if filter_scores:
                avg_filter_efficiency = sum(filter_scores) / len(filter_scores)
                scores.append(avg_filter_efficiency)
            
            # Calculate overall score
            return sum(scores) / len(scores) if scores else 0.0
            
        except Exception as e:
            logger.error(f"Error calculating resource efficiency score: {e}")
            return 0.0
    
    def log_performance_summary(self):
        """Log performance summary for monitoring"""
        try:
            metrics = self.get_processing_metrics()
            
            logger.info("=== Legal Intelligence Engine Performance Summary ===")
            logger.info(f"Total Queries Processed: {metrics['performance_indicators']['total_queries_processed']}")
            logger.info(f"Average Response Time: {metrics['performance_indicators']['avg_response_time_ms']:.1f}ms")
            logger.info(f"Overall Cache Hit Rate: {metrics['performance_indicators']['overall_cache_hit_rate']:.1%}")
            logger.info(f"Resource Efficiency Score: {metrics['performance_indicators']['resource_efficiency_score']:.2f}/1.0")
            
            # Log data source efficiency
            logger.info("--- Data Source Efficiency ---")
            for source_type, ratio_key in [
                ('government_data', 'government_data_cache_hit_rate'),
                ('parliamentary_data', 'parliamentary_data_cache_hit_rate'),
                ('qanoun_data', 'qanoun_data_cache_hit_rate')
            ]:
                if ratio_key in metrics['efficiency_ratios']:
                    hit_rate = metrics['efficiency_ratios'][ratio_key]
                    logger.info(f"{source_type.replace('_', ' ').title()}: {hit_rate:.1%} cache hit rate")
            
            # Log relevance filter efficiency
            logger.info("--- Relevance Filter Efficiency ---")
            for filter_type, filter_data in metrics['relevance_filter_stats'].items():
                if filter_data['total_processed'] > 0:
                    efficiency = filter_data['passed_filter'] / filter_data['total_processed']
                    avg_relevance = filter_data['avg_relevance']
                    logger.info(f"{filter_type.replace('_', ' ').title()}: {efficiency:.1%} pass rate, {avg_relevance:.2f} avg relevance")
            
            logger.info("=" * 50)
            
        except Exception as e:
            logger.error(f"Error logging performance summary: {e}")
    
    def _generate_cache_key(self, query: str, data_type: str, context: Dict = None) -> str:
        """Generate cache key based on query relevance and context"""
        # Normalize query for consistent caching
        normalized_query = re.sub(r'\s+', ' ', query.lower().strip())
        
        # Extract key terms for relevance-based caching
        key_terms = self._extract_key_terms(normalized_query)
        
        # Create context hash if provided
        context_hash = ""
        if context:
            context_str = json.dumps(context, sort_keys=True, default=str)
            context_hash = hashlib.md5(context_str.encode()).hexdigest()[:8]
        
        # Generate cache key
        cache_key = f"{data_type}:{':'.join(sorted(key_terms))}:{context_hash}"
        return hashlib.md5(cache_key.encode()).hexdigest()
    
    def _extract_key_terms(self, query: str) -> List[str]:
        """Extract key terms from query for cache key generation"""
        # Simple key term extraction - can be enhanced with NLP
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
        words = query.lower().split()
        key_terms = [word for word in words if len(word) > 2 and word not in stop_words]
        return key_terms[:5]  # Limit to top 5 key terms
    
    def _update_processing_metrics(self, intelligence: LegalIntelligence, processing_time_ms: int):
        """Update processing metrics after query completion"""
        try:
            # Update overall metrics
            self.processing_metrics['total_queries'] += 1
            self.processing_metrics['total_processing_time_ms'] += processing_time_ms
            self.processing_metrics['avg_processing_time_ms'] = (
                self.processing_metrics['total_processing_time_ms'] / 
                self.processing_metrics['total_queries']
            )
            
            # Update data source usage metrics
            for source_type in ['government_data', 'parliamentary_data', 'qanoun_data']:
                source_metrics = self.processing_metrics['data_source_usage'][source_type]
                source_metrics['requests'] += 1
                
                # Track cache hits
                if intelligence.cache_hits.get(source_type, False):
                    source_metrics['cache_hits'] += 1
                
                # Track data usage
                if source_type == 'government_data':
                    data_count = len(intelligence.government_position)
                elif source_type == 'parliamentary_data':
                    data_count = len(intelligence.parliamentary_context)
                elif source_type == 'qanoun_data':
                    data_count = len(intelligence.qanoun_references)
                else:
                    data_count = 0
                
                source_metrics['data_used'] += data_count
                source_metrics['data_available'] += data_count  # Simplified for now
            
            # Update relevance filter stats
            if intelligence.government_position:
                gov_stats = self.processing_metrics['relevance_filter_stats']['government_signals']
                gov_stats['total_processed'] += len(intelligence.government_position)
                high_relevance = [s for s in intelligence.government_position if s.legal_relevance_score >= 3.0]
                gov_stats['passed_filter'] += len(high_relevance)
                if intelligence.government_position:
                    avg_relevance = sum(s.legal_relevance_score for s in intelligence.government_position) / len(intelligence.government_position)
                    gov_stats['avg_relevance'] = (gov_stats['avg_relevance'] + avg_relevance) / 2
            
            # Update resource utilization
            self.processing_metrics['resource_utilization']['cache_operations'] += len(self.data_cache)
            
        except Exception as e:
            logger.error(f"Error updating processing metrics: {e}")
            logger.error(f"Error logging performance summary: {e}")