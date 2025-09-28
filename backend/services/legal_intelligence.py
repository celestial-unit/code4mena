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
from dataclasses import dataclass
import hashlib

from scraping.government_social import GovernmentSocialScraper
from scraping.marsad_integration import MarsadParlimentaryMonitor
from scraping.qanoun_scraper import QanounTnScraper
from services.external_llm import ExternalLLMService

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
        try:
            logger.info(f"Processing enhanced legal query: {query[:50]}...")
            
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
                sources_summary={}
            )
            
            # 1. Search traditional legal documents (existing system)
            # This would integrate with your existing legal RAG
            intelligence.traditional_legal = await self._search_traditional_legal(query)
            
            # 2. Get real-time government position
            intelligence.government_position = await self._get_government_position(query)
            
            # 3. Get parliamentary context
            intelligence.parliamentary_context = await self._get_parliamentary_context(query)
            
            # 4. Search 9anoun.tn database
            intelligence.qanoun_references = await self._search_qanoun_database(query)
            
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
            
            logger.info(f"Enhanced legal intelligence generated with {sum(intelligence.sources_summary.values())} total sources")
            return intelligence
            
        except Exception as e:
            logger.error(f"Error processing enhanced legal query: {e}")
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
                sources_summary={}
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
        """Get current government position from social media"""
        try:
            # Get recent government posts
            gov_posts = await self.gov_scraper.scrape_all_accounts()
            
            # Filter posts relevant to query
            relevant_signals = []
            for post in gov_posts:
                if self._is_relevant_to_query(post.content, query):
                    signal = self.signal_detector.detect_legal_signals(
                        post.content, 
                        f"government_social_{post.platform}"
                    )
                    if signal.legal_relevance_score > 2.0:
                        relevant_signals.append(signal)
            
            return relevant_signals[:5]  # Top 5 most relevant
            
        except Exception as e:
            logger.error(f"Error getting government position: {e}")
            return []
    
    async def _get_parliamentary_context(self, query: str) -> List[Dict[str, Any]]:
        """Get parliamentary context from Marsad"""
        try:
            # Get recent parliamentary sessions
            sessions = await self.marsad_monitor.get_parliamentary_sessions(days_back=30)
            
            # Filter sessions relevant to query
            relevant_sessions = []
            for session in sessions:
                session_text = ' '.join(session.topics)
                if self._is_relevant_to_query(session_text, query):
                    relevant_sessions.append({
                        'session_id': session.session_id,
                        'date': session.date.isoformat(),
                        'topics': session.topics,
                        'type': session.session_type,
                        'url': session.marsad_url,
                        'relevance': self._calculate_relevance(session_text, query)
                    })
            
            # Sort by relevance
            relevant_sessions.sort(key=lambda x: x['relevance'], reverse=True)
            return relevant_sessions[:3]  # Top 3 most relevant
            
        except Exception as e:
            logger.error(f"Error getting parliamentary context: {e}")
            return []
    
    async def _search_qanoun_database(self, query: str) -> List[Dict[str, Any]]:
        """Search 9anoun.tn database"""
        try:
            # Search 9anoun.tn for relevant legal documents
            qanoun_results = await self.qanoun_scraper.search_legal_documents(query)
            
            # Format results
            formatted_results = []
            for result in qanoun_results[:5]:  # Top 5 results
                formatted_results.append({
                    'title': result.get('title', ''),
                    'summary': result.get('summary', ''),
                    'url': result.get('url', ''),
                    'category': result.get('category', ''),
                    'date': result.get('date', ''),
                    'source': '9anoun.tn',
                    'legal_reference': result.get('legal_reference', ''),
                    'relevance': 0.8  # Would calculate actual relevance
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching 9anoun database: {e}")
            return []
    
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