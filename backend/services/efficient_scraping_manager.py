"""
Efficient Scraping Resource Management for Kanounji 2025
Smart caching, relevance detection, and targeted scraping to optimize resource usage

REVOLUTIONARY CAPABILITY: Only scrape what's needed, when it's needed
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Set
from datetime import datetime, timedelta
import hashlib
import time
import json
from dataclasses import dataclass, field
from enum import Enum

from scraping.government_social import GovernmentSocialScraper, SocialMediaPost
from scraping.marsad_integration import MarsadParlimentaryMonitor, ParliamentarySession
from scraping.qanoun_scraper import QanounTnScraper
from services.external_llm import ExternalLLMService

logger = logging.getLogger(__name__)

class DataSourceType(Enum):
    """Types of data sources for scraping"""
    GOVERNMENT_SOCIAL = "government_social"
    PARLIAMENTARY = "parliamentary"
    QANOUN_LEGAL = "qanoun_legal"

class QueryRelevanceType(Enum):
    """Types of query relevance for targeted scraping"""
    GOVERNMENT = "government"
    PARLIAMENTARY = "parliamentary"
    LEGAL_DATABASE = "legal_database"
    GENERAL = "general"

@dataclass
class CacheEntry:
    """Cache entry with TTL and access tracking"""
    data: Any
    timestamp: datetime
    ttl_seconds: int
    access_count: int = 0
    last_access: datetime = field(default_factory=datetime.now)
    query_hash: str = ""
    data_source: DataSourceType = DataSourceType.GOVERNMENT_SOCIAL
    
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        return datetime.now() > (self.timestamp + timedelta(seconds=self.ttl_seconds))
    
    def access(self) -> Any:
        """Access cached data and update metrics"""
        self.access_count += 1
        self.last_access = datetime.now()
        return self.data

@dataclass
class DataFreshnessInfo:
    """Information about data freshness for selective updates"""
    last_scrape_time: datetime
    last_update_time: datetime
    data_source: DataSourceType
    query_pattern: str
    staleness_threshold_seconds: int
    update_frequency_seconds: int
    consecutive_no_updates: int = 0
    
    def is_stale(self) -> bool:
        """Check if data is considered stale"""
        time_since_update = datetime.now() - self.last_update_time
        return time_since_update.total_seconds() > self.staleness_threshold_seconds
    
    def should_refresh(self) -> bool:
        """Determine if data should be refreshed based on patterns"""
        time_since_scrape = datetime.now() - self.last_scrape_time
        return time_since_scrape.total_seconds() > self.update_frequency_seconds

@dataclass
class APIUsageInfo:
    """Track external API usage and costs"""
    api_name: str
    total_calls: int = 0
    successful_calls: int = 0
    failed_calls: int = 0
    total_tokens_used: int = 0
    estimated_cost_usd: float = 0.0
    last_call_time: datetime = field(default_factory=datetime.now)
    rate_limit_remaining: int = 1000
    rate_limit_reset_time: datetime = field(default_factory=datetime.now)
    
    def calculate_success_rate(self) -> float:
        """Calculate API success rate percentage"""
        return (self.successful_calls / max(self.total_calls, 1)) * 100
    
    def is_rate_limited(self) -> bool:
        """Check if API is currently rate limited"""
        return (self.rate_limit_remaining <= 0 and 
                datetime.now() < self.rate_limit_reset_time)

@dataclass
class BatchRequest:
    """Batch request for similar queries"""
    queries: List[str]
    data_source: DataSourceType
    created_at: datetime
    batch_id: str
    
    def can_add_query(self, query: str, max_batch_size: int = 5) -> bool:
        """Check if query can be added to this batch"""
        return (len(self.queries) < max_batch_size and 
                self._is_similar_query(query))
    
    def _is_similar_query(self, query: str) -> bool:
        """Check if query is similar to existing queries in batch"""
        if not self.queries:
            return True
        
        # Simple similarity check based on common words
        query_words = set(query.lower().split())
        for existing_query in self.queries:
            existing_words = set(existing_query.lower().split())
            common_words = query_words.intersection(existing_words)
            
            # If more than 50% words are common, consider similar
            if len(common_words) / max(len(query_words), 1) > 0.5:
                return True
        
        return False

@dataclass
class ScrapingMetrics:
    """Metrics for scraping efficiency tracking"""
    total_scrape_requests: int = 0
    cache_hits: int = 0
    cache_misses: int = 0
    data_sources_used: Dict[str, int] = field(default_factory=dict)
    relevance_filtered_items: Dict[str, int] = field(default_factory=dict)
    total_processing_time_ms: int = 0
    avg_processing_time_ms: float = 0.0
    selective_updates_triggered: int = 0
    stale_data_refreshes: int = 0
    api_usage: Dict[str, APIUsageInfo] = field(default_factory=dict)
    batched_requests: int = 0
    timeout_failures: int = 0
    fallback_usage: int = 0
    
    def calculate_cache_hit_rate(self) -> float:
        """Calculate cache hit rate percentage"""
        total_requests = self.cache_hits + self.cache_misses
        return (self.cache_hits / total_requests * 100) if total_requests > 0 else 0.0
    
    def update_avg_processing_time(self, new_time_ms: int):
        """Update average processing time"""
        self.total_processing_time_ms += new_time_ms
        self.avg_processing_time_ms = self.total_processing_time_ms / max(self.total_scrape_requests, 1)

class EfficientScrapingManager:
    """
    Smart scraping manager that implements:
    1. TTL-based caching for different data sources
    2. Query relevance detection for targeted scraping
    3. Resource optimization and cost reduction
    """
    
    def __init__(self):
        # Initialize scrapers and external services
        self.gov_scraper = GovernmentSocialScraper()
        self.marsad_monitor = MarsadParlimentaryMonitor()
        self.qanoun_scraper = QanounTnScraper()
        self.external_llm = ExternalLLMService()
        
        # Smart cache with TTL for different data sources
        self.scrape_cache: Dict[str, CacheEntry] = {}
        
        # Cache TTL settings (in seconds)
        self.cache_ttl = {
            DataSourceType.GOVERNMENT_SOCIAL: 1800,  # 30 minutes - government posts change frequently
            DataSourceType.PARLIAMENTARY: 3600,      # 1 hour - parliamentary sessions are scheduled
            DataSourceType.QANOUN_LEGAL: 7200        # 2 hours - legal documents change less frequently
        }
        
        # Maximum cache size and cleanup threshold
        self.max_cache_size = 500
        self.cache_cleanup_threshold = 0.8  # Clean when 80% full
        
        # Query relevance detection keywords
        self.relevance_keywords = {
            QueryRelevanceType.GOVERNMENT: {
                'ar': [
                    'حكومة', 'وزارة', 'رئاسة الحكومة', 'وزير', 'قرار حكومي', 'مرسوم',
                    'سياسة حكومية', 'إعلان رسمي', 'بيان حكومي', 'مجلس الوزراء'
                ],
                'fr': [
                    'gouvernement', 'ministère', 'ministre', 'décision gouvernementale',
                    'décret', 'politique gouvernementale', 'annonce officielle',
                    'communiqué gouvernemental', 'conseil des ministres'
                ]
            },
            QueryRelevanceType.PARLIAMENTARY: {
                'ar': [
                    'برلمان', 'مجلس النواب', 'نائب', 'جلسة برلمانية', 'تصويت',
                    'مناقشة برلمانية', 'لجنة برلمانية', 'استجواب', 'مشروع قانون'
                ],
                'fr': [
                    'parlement', 'assemblée', 'député', 'session parlementaire',
                    'vote', 'débat parlementaire', 'commission parlementaire',
                    'interpellation', 'projet de loi'
                ]
            },
            QueryRelevanceType.LEGAL_DATABASE: {
                'ar': [
                    'قانون', 'تشريع', 'نص قانوني', 'مادة قانونية', 'فصل',
                    'قانون عدد', 'مجلة', 'قانون أساسي', 'أمر', 'قرار'
                ],
                'fr': [
                    'loi', 'législation', 'texte légal', 'article de loi',
                    'loi numéro', 'code', 'loi organique', 'ordonnance', 'arrêté'
                ]
            }
        }
        
        # Scraping metrics
        self.metrics = ScrapingMetrics()
        
        # Data freshness tracking for selective updates
        self.data_freshness: Dict[str, DataFreshnessInfo] = {}
        
        # Staleness thresholds for different data sources (in seconds)
        self.staleness_thresholds = {
            DataSourceType.GOVERNMENT_SOCIAL: 3600,   # 1 hour - government posts become stale quickly
            DataSourceType.PARLIAMENTARY: 7200,       # 2 hours - parliamentary data changes less frequently
            DataSourceType.QANOUN_LEGAL: 14400        # 4 hours - legal documents are more stable
        }
        
        # Smart refresh intervals based on query patterns (in seconds)
        self.smart_refresh_intervals = {
            'high_frequency': 900,    # 15 minutes for frequently queried topics
            'medium_frequency': 1800, # 30 minutes for moderately queried topics
            'low_frequency': 3600,    # 1 hour for rarely queried topics
            'default': 2400           # 40 minutes default
        }
        
        # Query pattern tracking for smart refresh triggers
        self.query_patterns: Dict[str, Dict[str, Any]] = {}
        
        # Minimum intervals between scrapes (in seconds)
        self.min_scrape_intervals = {
            DataSourceType.GOVERNMENT_SOCIAL: 900,   # 15 minutes
            DataSourceType.PARLIAMENTARY: 1800,      # 30 minutes  
            DataSourceType.QANOUN_LEGAL: 3600        # 1 hour
        }
        
        # API rate limiting and cost management
        self.api_rate_limits = {
            'gemini': {'calls_per_minute': 60, 'tokens_per_minute': 32000},
            'openai': {'calls_per_minute': 500, 'tokens_per_minute': 150000},
            'anthropic': {'calls_per_minute': 50, 'tokens_per_minute': 40000}
        }
        
        # API cost tracking (USD per 1K tokens)
        self.api_costs = {
            'gemini': {'input': 0.00015, 'output': 0.0006},
            'openai': {'input': 0.01, 'output': 0.03},
            'anthropic': {'input': 0.003, 'output': 0.015}
        }
        
        # Intelligent batching for similar queries
        self.pending_batches: Dict[str, BatchRequest] = {}
        self.batch_timeout_seconds = 30  # Wait 30 seconds to collect similar queries
        self.max_batch_size = 5
        
        # Timeout settings for external APIs
        self.api_timeouts = {
            'scraping': 30,  # 30 seconds for scraping operations
            'llm': 15,       # 15 seconds for LLM API calls
            'default': 20    # 20 seconds default timeout
        }
        
    async def initialize(self):
        """Initialize all scrapers"""
        try:
            await self.gov_scraper.initialize()
            await self.marsad_monitor.initialize()
            await self.qanoun_scraper.initialize()
            logger.info("EfficientScrapingManager initialized successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize EfficientScrapingManager: {e}")
            return False
    
    def detect_query_relevance(self, query: str) -> Set[QueryRelevanceType]:
        """
        Detect which data sources are relevant for a given query
        
        Args:
            query: The user query to analyze
            
        Returns:
            Set of relevant query types for targeted scraping
        """
        try:
            query_lower = query.lower()
            relevant_types = set()
            
            # Check each relevance type
            for relevance_type, languages in self.relevance_keywords.items():
                for lang, keywords in languages.items():
                    for keyword in keywords:
                        if keyword in query_lower:
                            relevant_types.add(relevance_type)
                            break
                    if relevance_type in relevant_types:
                        break
            
            # If no specific relevance detected, consider it general
            if not relevant_types:
                relevant_types.add(QueryRelevanceType.GENERAL)
            
            logger.debug(f"Query relevance detected: {[t.value for t in relevant_types]} for query: {query[:50]}")
            return relevant_types
            
        except Exception as e:
            logger.error(f"Error detecting query relevance: {e}")
            return {QueryRelevanceType.GENERAL}
    
    def _generate_cache_key(self, query: str, data_source: DataSourceType) -> str:
        """Generate cache key based on query and data source"""
        # Create a hash of the query for consistent caching
        query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
        return f"{data_source.value}_{query_hash}"
    
    def _get_from_cache(self, cache_key: str) -> Optional[Any]:
        """Get data from cache if available and not expired"""
        try:
            if cache_key in self.scrape_cache:
                entry = self.scrape_cache[cache_key]
                if not entry.is_expired():
                    self.metrics.cache_hits += 1
                    logger.debug(f"Cache hit for key: {cache_key}")
                    return entry.access()
                else:
                    # Remove expired entry
                    del self.scrape_cache[cache_key]
                    logger.debug(f"Cache entry expired for key: {cache_key}")
            
            self.metrics.cache_misses += 1
            return None
            
        except Exception as e:
            logger.error(f"Error getting from cache: {e}")
            self.metrics.cache_misses += 1
            return None
    
    def _store_in_cache(self, cache_key: str, data: Any, data_source: DataSourceType, query_hash: str = ""):
        """Store data in cache with TTL"""
        try:
            # Clean cache if it's getting too full
            if len(self.scrape_cache) >= self.max_cache_size * self.cache_cleanup_threshold:
                self._cleanup_cache()
            
            # Store new entry
            ttl = self.cache_ttl[data_source]
            entry = CacheEntry(
                data=data,
                timestamp=datetime.now(),
                ttl_seconds=ttl,
                query_hash=query_hash,
                data_source=data_source
            )
            
            self.scrape_cache[cache_key] = entry
            logger.debug(f"Stored in cache: {cache_key} with TTL {ttl}s")
            
        except Exception as e:
            logger.error(f"Error storing in cache: {e}")
    
    def _cleanup_cache(self):
        """Clean up expired and least recently used cache entries"""
        try:
            current_time = datetime.now()
            
            # Remove expired entries
            expired_keys = [
                key for key, entry in self.scrape_cache.items()
                if entry.is_expired()
            ]
            
            for key in expired_keys:
                del self.scrape_cache[key]
            
            # If still too full, remove least recently used entries
            if len(self.scrape_cache) >= self.max_cache_size * self.cache_cleanup_threshold:
                # Sort by last access time and remove oldest
                sorted_entries = sorted(
                    self.scrape_cache.items(),
                    key=lambda x: x[1].last_access
                )
                
                # Remove oldest 20% of entries
                entries_to_remove = int(len(sorted_entries) * 0.2)
                for i in range(entries_to_remove):
                    key = sorted_entries[i][0]
                    del self.scrape_cache[key]
            
            logger.debug(f"Cache cleanup completed. Current size: {len(self.scrape_cache)}")
            
        except Exception as e:
            logger.error(f"Error during cache cleanup: {e}")
    
    def _track_query_pattern(self, query: str, data_source: DataSourceType):
        """Track query patterns for smart refresh triggers"""
        try:
            # Create a pattern key based on query keywords
            query_words = query.lower().split()
            # Use first 3 significant words as pattern
            significant_words = [word for word in query_words if len(word) > 3][:3]
            pattern_key = "_".join(significant_words) if significant_words else "general"
            
            pattern_full_key = f"{data_source.value}_{pattern_key}"
            
            if pattern_full_key not in self.query_patterns:
                self.query_patterns[pattern_full_key] = {
                    'count': 0,
                    'first_seen': datetime.now(),
                    'last_seen': datetime.now(),
                    'frequency_category': 'low_frequency'
                }
            
            # Update pattern tracking
            pattern_info = self.query_patterns[pattern_full_key]
            pattern_info['count'] += 1
            pattern_info['last_seen'] = datetime.now()
            
            # Determine frequency category based on usage
            time_span = (pattern_info['last_seen'] - pattern_info['first_seen']).total_seconds()
            if time_span > 0:
                queries_per_hour = (pattern_info['count'] / time_span) * 3600
                
                if queries_per_hour > 10:
                    pattern_info['frequency_category'] = 'high_frequency'
                elif queries_per_hour > 3:
                    pattern_info['frequency_category'] = 'medium_frequency'
                else:
                    pattern_info['frequency_category'] = 'low_frequency'
            
            logger.debug(f"Query pattern tracked: {pattern_full_key} - {pattern_info['frequency_category']}")
            
        except Exception as e:
            logger.error(f"Error tracking query pattern: {e}")
    
    def _get_smart_refresh_interval(self, query: str, data_source: DataSourceType) -> int:
        """Get smart refresh interval based on query patterns"""
        try:
            # Create pattern key
            query_words = query.lower().split()
            significant_words = [word for word in query_words if len(word) > 3][:3]
            pattern_key = "_".join(significant_words) if significant_words else "general"
            pattern_full_key = f"{data_source.value}_{pattern_key}"
            
            if pattern_full_key in self.query_patterns:
                frequency_category = self.query_patterns[pattern_full_key]['frequency_category']
                return self.smart_refresh_intervals[frequency_category]
            
            return self.smart_refresh_intervals['default']
            
        except Exception as e:
            logger.error(f"Error getting smart refresh interval: {e}")
            return self.smart_refresh_intervals['default']
    
    def _update_data_freshness(self, query: str, data_source: DataSourceType, has_new_data: bool = True):
        """Update data freshness information for selective updates"""
        try:
            # Create freshness key
            query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
            freshness_key = f"{data_source.value}_{query_hash}"
            
            current_time = datetime.now()
            
            if freshness_key not in self.data_freshness:
                # Create new freshness info
                refresh_interval = self._get_smart_refresh_interval(query, data_source)
                self.data_freshness[freshness_key] = DataFreshnessInfo(
                    last_scrape_time=current_time,
                    last_update_time=current_time if has_new_data else current_time - timedelta(hours=1),
                    data_source=data_source,
                    query_pattern=query[:50],
                    staleness_threshold_seconds=self.staleness_thresholds[data_source],
                    update_frequency_seconds=refresh_interval
                )
            else:
                # Update existing freshness info
                freshness_info = self.data_freshness[freshness_key]
                freshness_info.last_scrape_time = current_time
                
                if has_new_data:
                    freshness_info.last_update_time = current_time
                    freshness_info.consecutive_no_updates = 0
                else:
                    freshness_info.consecutive_no_updates += 1
                    
                    # Adjust refresh frequency if no updates for a while
                    if freshness_info.consecutive_no_updates >= 3:
                        freshness_info.update_frequency_seconds = min(
                            freshness_info.update_frequency_seconds * 1.5,
                            7200  # Max 2 hours
                        )
            
            logger.debug(f"Data freshness updated for {freshness_key}")
            
        except Exception as e:
            logger.error(f"Error updating data freshness: {e}")
    
    def _should_refresh_data(self, query: str, data_source: DataSourceType) -> bool:
        """Determine if data should be refreshed based on freshness tracking"""
        try:
            query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
            freshness_key = f"{data_source.value}_{query_hash}"
            
            if freshness_key not in self.data_freshness:
                return True  # No freshness info, should refresh
            
            freshness_info = self.data_freshness[freshness_key]
            
            # Check if data is stale
            if freshness_info.is_stale():
                logger.debug(f"Data is stale for {freshness_key}, triggering refresh")
                self.metrics.stale_data_refreshes += 1
                return True
            
            # Check if it's time for scheduled refresh
            if freshness_info.should_refresh():
                logger.debug(f"Scheduled refresh triggered for {freshness_key}")
                self.metrics.selective_updates_triggered += 1
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking if should refresh data: {e}")
            return True  # Default to refresh on error
    
    def _should_scrape(self, data_source: DataSourceType, query_relevance: Set[QueryRelevanceType], query: str = "") -> bool:
        """
        Enhanced scraping decision based on:
        1. Query relevance to data source
        2. Data freshness and staleness
        3. Query patterns and frequency
        4. Minimum scrape intervals
        """
        try:
            # Check if query is relevant to this data source
            source_relevant = False
            
            if data_source == DataSourceType.GOVERNMENT_SOCIAL:
                source_relevant = QueryRelevanceType.GOVERNMENT in query_relevance
            elif data_source == DataSourceType.PARLIAMENTARY:
                source_relevant = QueryRelevanceType.PARLIAMENTARY in query_relevance
            elif data_source == DataSourceType.QANOUN_LEGAL:
                source_relevant = QueryRelevanceType.LEGAL_DATABASE in query_relevance
            
            # Always scrape for general queries, but with lower priority
            if QueryRelevanceType.GENERAL in query_relevance:
                source_relevant = True
            
            if not source_relevant:
                return False
            
            # Check data freshness and selective update logic
            if query and not self._should_refresh_data(query, data_source):
                logger.debug(f"Data is fresh for {data_source.value}, skipping scrape")
                return False
            
            # Check minimum scrape intervals (rate limiting)
            last_scrape_key = f"{data_source.value}_last_scrape"
            if hasattr(self, 'last_scrape_time') and last_scrape_key in getattr(self, 'last_scrape_time', {}):
                time_since_scrape = datetime.now() - self.last_scrape_time[last_scrape_key]
                min_interval = timedelta(seconds=self.min_scrape_intervals[data_source])
                
                if time_since_scrape < min_interval:
                    logger.debug(f"Skipping scrape for {data_source.value} - too recent")
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error determining if should scrape: {e}")
            return False
    
    async def get_relevant_government_data(self, query: str) -> List[SocialMediaPost]:
        """
        Get relevant government social media data with smart caching
        Only scrapes if query is government-related and data is not recently cached
        """
        start_time = time.time()
        
        try:
            self.metrics.total_scrape_requests += 1
            data_source = DataSourceType.GOVERNMENT_SOCIAL
            
            # Detect query relevance
            query_relevance = self.detect_query_relevance(query)
            
            # Generate cache key
            cache_key = self._generate_cache_key(query, data_source)
            
            # Try cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data is not None:
                processing_time = int((time.time() - start_time) * 1000)
                self.metrics.update_avg_processing_time(processing_time)
                return cached_data
            
            # Track query pattern for smart refresh
            self._track_query_pattern(query, data_source)
            
            # Check if we should scrape
            if not self._should_scrape(data_source, query_relevance, query):
                logger.debug(f"Skipping government scraping - not relevant or data is fresh")
                return []
            
            # Perform targeted scraping
            logger.info(f"Performing targeted government scraping for query: {query[:50]}")
            
            # Update last scrape time (for rate limiting)
            if not hasattr(self, 'last_scrape_time'):
                self.last_scrape_time = {}
            self.last_scrape_time[f"{data_source.value}_last_scrape"] = datetime.now()
            
            # Try intelligent batching first
            batch_id = await self._add_to_batch(query, data_source)
            if batch_id:
                # Query added to batch, wait for batch processing
                logger.debug(f"Query added to batch {batch_id}, waiting for batch processing")
                await asyncio.sleep(2)  # Brief wait for batch processing
                
                # Check if results are now cached
                cached_data = self._get_from_cache(cache_key)
                if cached_data is not None:
                    processing_time = int((time.time() - start_time) * 1000)
                    self.metrics.update_avg_processing_time(processing_time)
                    return cached_data
            
            # Get government posts with timeout and error handling
            gov_posts = await self._make_api_call_with_timeout(
                lambda: self.gov_scraper.scrape_all_accounts(),
                timeout_seconds=self.api_timeouts['scraping'],
                api_name='scraping'
            )
            
            # Filter for relevance to query
            relevant_posts = self._filter_government_posts_by_relevance(gov_posts, query)
            
            # Update data freshness tracking
            has_new_data = len(relevant_posts) > 0
            self._update_data_freshness(query, data_source, has_new_data)
            
            # Update metrics
            self.metrics.data_sources_used[data_source.value] = self.metrics.data_sources_used.get(data_source.value, 0) + 1
            self.metrics.relevance_filtered_items[data_source.value] = len(relevant_posts)
            
            # Store in cache
            query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
            self._store_in_cache(cache_key, relevant_posts, data_source, query_hash)
            
            processing_time = int((time.time() - start_time) * 1000)
            self.metrics.update_avg_processing_time(processing_time)
            
            logger.info(f"Retrieved {len(relevant_posts)} relevant government posts in {processing_time}ms")
            return relevant_posts
            
        except Exception as e:
            logger.error(f"Error getting relevant government data: {e}")
            processing_time = int((time.time() - start_time) * 1000)
            self.metrics.update_avg_processing_time(processing_time)
            return []
    
    async def get_relevant_parliamentary_data(self, query: str) -> List[ParliamentarySession]:
        """
        Get relevant parliamentary data with smart caching
        Only scrapes if query is parliamentary-related and data is not recently cached
        """
        start_time = time.time()
        
        try:
            self.metrics.total_scrape_requests += 1
            data_source = DataSourceType.PARLIAMENTARY
            
            # Detect query relevance
            query_relevance = self.detect_query_relevance(query)
            
            # Generate cache key
            cache_key = self._generate_cache_key(query, data_source)
            
            # Try cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data is not None:
                processing_time = int((time.time() - start_time) * 1000)
                self.metrics.update_avg_processing_time(processing_time)
                return cached_data
            
            # Track query pattern for smart refresh
            self._track_query_pattern(query, data_source)
            
            # Check if we should scrape
            if not self._should_scrape(data_source, query_relevance, query):
                logger.debug(f"Skipping parliamentary scraping - not relevant or data is fresh")
                return []
            
            # Perform targeted scraping
            logger.info(f"Performing targeted parliamentary scraping for query: {query[:50]}")
            
            # Update last scrape time (for rate limiting)
            if not hasattr(self, 'last_scrape_time'):
                self.last_scrape_time = {}
            self.last_scrape_time[f"{data_source.value}_last_scrape"] = datetime.now()
            
            # Try intelligent batching first
            batch_id = await self._add_to_batch(query, data_source)
            if batch_id:
                # Query added to batch, wait for batch processing
                logger.debug(f"Query added to batch {batch_id}, waiting for batch processing")
                await asyncio.sleep(2)  # Brief wait for batch processing
                
                # Check if results are now cached
                cached_data = self._get_from_cache(cache_key)
                if cached_data is not None:
                    processing_time = int((time.time() - start_time) * 1000)
                    self.metrics.update_avg_processing_time(processing_time)
                    return cached_data
            
            # Get parliamentary sessions with timeout and error handling
            sessions = await self._make_api_call_with_timeout(
                lambda: self.marsad_monitor.get_parliamentary_sessions(days_back=30),
                timeout_seconds=self.api_timeouts['scraping'],
                api_name='scraping'
            )
            
            # Filter for relevance to query
            relevant_sessions = self._filter_parliamentary_sessions_by_relevance(sessions, query)
            
            # Update data freshness tracking
            has_new_data = len(relevant_sessions) > 0
            self._update_data_freshness(query, data_source, has_new_data)
            
            # Update metrics
            self.metrics.data_sources_used[data_source.value] = self.metrics.data_sources_used.get(data_source.value, 0) + 1
            self.metrics.relevance_filtered_items[data_source.value] = len(relevant_sessions)
            
            # Store in cache
            query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
            self._store_in_cache(cache_key, relevant_sessions, data_source, query_hash)
            
            processing_time = int((time.time() - start_time) * 1000)
            self.metrics.update_avg_processing_time(processing_time)
            
            logger.info(f"Retrieved {len(relevant_sessions)} relevant parliamentary sessions in {processing_time}ms")
            return relevant_sessions
            
        except Exception as e:
            logger.error(f"Error getting relevant parliamentary data: {e}")
            processing_time = int((time.time() - start_time) * 1000)
            self.metrics.update_avg_processing_time(processing_time)
            return []
    
    async def get_relevant_qanoun_data(self, query: str) -> List[Dict[str, Any]]:
        """
        Get relevant legal documents from 9anoun.tn with smart caching
        Only scrapes if query is legal-related and data is not recently cached
        """
        start_time = time.time()
        
        try:
            self.metrics.total_scrape_requests += 1
            data_source = DataSourceType.QANOUN_LEGAL
            
            # Detect query relevance
            query_relevance = self.detect_query_relevance(query)
            
            # Generate cache key
            cache_key = self._generate_cache_key(query, data_source)
            
            # Try cache first
            cached_data = self._get_from_cache(cache_key)
            if cached_data is not None:
                processing_time = int((time.time() - start_time) * 1000)
                self.metrics.update_avg_processing_time(processing_time)
                return cached_data
            
            # Track query pattern for smart refresh
            self._track_query_pattern(query, data_source)
            
            # Check if we should scrape
            if not self._should_scrape(data_source, query_relevance, query):
                logger.debug(f"Skipping 9anoun scraping - not relevant or data is fresh")
                return []
            
            # Perform targeted scraping
            logger.info(f"Performing targeted 9anoun scraping for query: {query[:50]}")
            
            # Update last scrape time (for rate limiting)
            if not hasattr(self, 'last_scrape_time'):
                self.last_scrape_time = {}
            self.last_scrape_time[f"{data_source.value}_last_scrape"] = datetime.now()
            
            # Try intelligent batching first
            batch_id = await self._add_to_batch(query, data_source)
            if batch_id:
                # Query added to batch, wait for batch processing
                logger.debug(f"Query added to batch {batch_id}, waiting for batch processing")
                await asyncio.sleep(2)  # Brief wait for batch processing
                
                # Check if results are now cached
                cached_data = self._get_from_cache(cache_key)
                if cached_data is not None:
                    processing_time = int((time.time() - start_time) * 1000)
                    self.metrics.update_avg_processing_time(processing_time)
                    return cached_data
            
            # Search 9anoun database with timeout and error handling
            documents = await self._make_api_call_with_timeout(
                lambda: self.qanoun_scraper.search_documents(query),
                timeout_seconds=self.api_timeouts['scraping'],
                api_name='scraping'
            )
            
            # Filter for relevance to query
            relevant_documents = self._filter_qanoun_documents_by_relevance(documents, query)
            
            # Update data freshness tracking
            has_new_data = len(relevant_documents) > 0
            self._update_data_freshness(query, data_source, has_new_data)
            
            # Update metrics
            self.metrics.data_sources_used[data_source.value] = self.metrics.data_sources_used.get(data_source.value, 0) + 1
            self.metrics.relevance_filtered_items[data_source.value] = len(relevant_documents)
            
            # Store in cache
            query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
            self._store_in_cache(cache_key, relevant_documents, data_source, query_hash)
            
            processing_time = int((time.time() - start_time) * 1000)
            self.metrics.update_avg_processing_time(processing_time)
            
            logger.info(f"Retrieved {len(relevant_documents)} relevant legal documents in {processing_time}ms")
            return relevant_documents
            
        except Exception as e:
            logger.error(f"Error getting relevant 9anoun data: {e}")
            processing_time = int((time.time() - start_time) * 1000)
            self.metrics.update_avg_processing_time(processing_time)
            return []
    
    def _filter_government_posts_by_relevance(self, posts: List[SocialMediaPost], query: str) -> List[SocialMediaPost]:
        """Filter government posts by relevance to query"""
        try:
            query_lower = query.lower()
            relevant_posts = []
            
            for post in posts:
                # Calculate relevance score
                relevance_score = 0
                content_lower = post.content.lower()
                
                # Check for query keywords in content
                query_words = query_lower.split()
                for word in query_words:
                    if len(word) > 2 and word in content_lower:
                        relevance_score += 1
                
                # Boost score for posts with legal signals
                if post.legal_signals:
                    relevance_score += len(post.legal_signals) * 2
                
                # Only include posts with minimum relevance
                if relevance_score >= 2 or len(post.legal_signals) >= 1:
                    relevant_posts.append(post)
            
            # Sort by relevance (posts with more legal signals first)
            relevant_posts.sort(key=lambda x: len(x.legal_signals), reverse=True)
            
            return relevant_posts[:10]  # Return top 10 most relevant
            
        except Exception as e:
            logger.error(f"Error filtering government posts: {e}")
            return posts[:5]  # Fallback to first 5 posts
    
    def _filter_parliamentary_sessions_by_relevance(self, sessions: List[ParliamentarySession], query: str) -> List[ParliamentarySession]:
        """Filter parliamentary sessions by relevance to query"""
        try:
            query_lower = query.lower()
            relevant_sessions = []
            
            for session in sessions:
                # Calculate relevance score
                relevance_score = 0
                
                # Check topics for query relevance
                for topic in session.topics:
                    topic_lower = topic.lower()
                    query_words = query_lower.split()
                    for word in query_words:
                        if len(word) > 2 and word in topic_lower:
                            relevance_score += 2
                
                # Check session type relevance
                if any(keyword in query_lower for keyword in ['قانون', 'تشريع', 'loi', 'legislation']):
                    if session.session_type in ['plenary', 'committee']:
                        relevance_score += 3
                
                # Only include sessions with minimum relevance
                if relevance_score >= 2:
                    relevant_sessions.append(session)
            
            # Sort by date (most recent first) and relevance
            relevant_sessions.sort(key=lambda x: x.date, reverse=True)
            
            return relevant_sessions[:5]  # Return top 5 most relevant
            
        except Exception as e:
            logger.error(f"Error filtering parliamentary sessions: {e}")
            return sessions[:3]  # Fallback to first 3 sessions
    
    def _filter_qanoun_documents_by_relevance(self, documents: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """Filter 9anoun documents by relevance to query"""
        try:
            query_lower = query.lower()
            relevant_documents = []
            
            for doc in documents:
                # Calculate relevance score
                relevance_score = 0
                
                # Check title for query keywords
                title_lower = doc.get('title', '').lower()
                query_words = query_lower.split()
                for word in query_words:
                    if len(word) > 2 and word in title_lower:
                        relevance_score += 3
                
                # Check summary for query keywords
                summary_lower = doc.get('summary', '').lower()
                for word in query_words:
                    if len(word) > 2 and word in summary_lower:
                        relevance_score += 1
                
                # Boost score for specific legal categories
                legal_category = doc.get('legal_category', '')
                if any(keyword in query_lower for keyword in ['تجاري', 'أعمال', 'business', 'commercial']):
                    if legal_category == 'business_law':
                        relevance_score += 5
                
                # Only include documents with minimum relevance
                if relevance_score >= 3:
                    relevant_documents.append(doc)
            
            # Sort by relevance score (calculated above)
            relevant_documents.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            
            return relevant_documents[:8]  # Return top 8 most relevant
            
        except Exception as e:
            logger.error(f"Error filtering 9anoun documents: {e}")
            return documents[:5]  # Fallback to first 5 documents
    
    def get_cache_statistics(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        try:
            total_entries = len(self.scrape_cache)
            expired_entries = sum(1 for entry in self.scrape_cache.values() if entry.is_expired())
            
            # Calculate cache size by data source
            cache_by_source = {}
            for entry in self.scrape_cache.values():
                source = entry.data_source.value
                cache_by_source[source] = cache_by_source.get(source, 0) + 1
            
            return {
                'total_entries': total_entries,
                'expired_entries': expired_entries,
                'active_entries': total_entries - expired_entries,
                'cache_hit_rate': self.metrics.calculate_cache_hit_rate(),
                'cache_by_source': cache_by_source,
                'max_cache_size': self.max_cache_size,
                'cache_utilization': (total_entries / self.max_cache_size) * 100
            }
            
        except Exception as e:
            logger.error(f"Error getting cache statistics: {e}")
            return {}
    
    def get_data_freshness_status(self) -> Dict[str, Any]:
        """Get data freshness status for all tracked queries"""
        try:
            freshness_status = {
                'total_tracked_queries': len(self.data_freshness),
                'stale_data_count': 0,
                'fresh_data_count': 0,
                'data_sources': {},
                'query_patterns': {}
            }
            
            # Analyze freshness by data source
            for freshness_key, freshness_info in self.data_freshness.items():
                source = freshness_info.data_source.value
                
                if source not in freshness_status['data_sources']:
                    freshness_status['data_sources'][source] = {
                        'total': 0,
                        'stale': 0,
                        'fresh': 0,
                        'avg_staleness_hours': 0.0
                    }
                
                freshness_status['data_sources'][source]['total'] += 1
                
                if freshness_info.is_stale():
                    freshness_status['stale_data_count'] += 1
                    freshness_status['data_sources'][source]['stale'] += 1
                else:
                    freshness_status['fresh_data_count'] += 1
                    freshness_status['data_sources'][source]['fresh'] += 1
                
                # Calculate staleness in hours
                staleness_hours = (datetime.now() - freshness_info.last_update_time).total_seconds() / 3600
                freshness_status['data_sources'][source]['avg_staleness_hours'] += staleness_hours
            
            # Calculate averages
            for source_info in freshness_status['data_sources'].values():
                if source_info['total'] > 0:
                    source_info['avg_staleness_hours'] /= source_info['total']
            
            # Analyze query patterns
            for pattern_key, pattern_info in self.query_patterns.items():
                freshness_status['query_patterns'][pattern_key] = {
                    'frequency_category': pattern_info['frequency_category'],
                    'query_count': pattern_info['count'],
                    'last_seen': pattern_info['last_seen'].isoformat()
                }
            
            return freshness_status
            
        except Exception as e:
            logger.error(f"Error getting data freshness status: {e}")
            return {}
    
    async def perform_selective_updates(self) -> Dict[str, Any]:
        """Perform selective updates for stale data"""
        try:
            update_results = {
                'updates_performed': 0,
                'updates_skipped': 0,
                'errors': 0,
                'updated_sources': []
            }
            
            current_time = datetime.now()
            
            # Check each tracked query for staleness
            for freshness_key, freshness_info in self.data_freshness.items():
                try:
                    if freshness_info.is_stale() or freshness_info.should_refresh():
                        logger.info(f"Performing selective update for {freshness_key}")
                        
                        # Extract query from pattern (simplified)
                        query = freshness_info.query_pattern
                        data_source = freshness_info.data_source
                        
                        # Perform update based on data source
                        updated = False
                        if data_source == DataSourceType.GOVERNMENT_SOCIAL:
                            posts = await self.get_relevant_government_data(query)
                            updated = len(posts) > 0
                        elif data_source == DataSourceType.PARLIAMENTARY:
                            sessions = await self.get_relevant_parliamentary_data(query)
                            updated = len(sessions) > 0
                        elif data_source == DataSourceType.QANOUN_LEGAL:
                            documents = await self.get_relevant_qanoun_data(query)
                            updated = len(documents) > 0
                        
                        if updated:
                            update_results['updates_performed'] += 1
                            update_results['updated_sources'].append({
                                'source': data_source.value,
                                'query_pattern': query,
                                'updated_at': current_time.isoformat()
                            })
                        else:
                            update_results['updates_skipped'] += 1
                    
                except Exception as e:
                    logger.error(f"Error updating {freshness_key}: {e}")
                    update_results['errors'] += 1
            
            logger.info(f"Selective updates completed: {update_results['updates_performed']} updates performed")
            return update_results
            
        except Exception as e:
            logger.error(f"Error performing selective updates: {e}")
            return {'error': str(e)}
    
    def get_scraping_metrics(self) -> Dict[str, Any]:
        """Get comprehensive scraping metrics"""
        try:
            return {
                'total_scrape_requests': self.metrics.total_scrape_requests,
                'cache_performance': {
                    'hits': self.metrics.cache_hits,
                    'misses': self.metrics.cache_misses,
                    'hit_rate_percent': self.metrics.calculate_cache_hit_rate()
                },
                'data_sources_usage': self.metrics.data_sources_used,
                'relevance_filtering': self.metrics.relevance_filtered_items,
                'performance': {
                    'avg_processing_time_ms': self.metrics.avg_processing_time_ms,
                    'total_processing_time_ms': self.metrics.total_processing_time_ms
                },
                'selective_updates': {
                    'updates_triggered': self.metrics.selective_updates_triggered,
                    'stale_data_refreshes': self.metrics.stale_data_refreshes
                },
                'api_optimization': {
                    'batched_requests': self.metrics.batched_requests,
                    'timeout_failures': self.metrics.timeout_failures,
                    'fallback_usage': self.metrics.fallback_usage
                },
                'cache_statistics': self.get_cache_statistics(),
                'data_freshness': self.get_data_freshness_status(),
                'api_usage_report': self.get_api_usage_report()
            }
            
        except Exception as e:
            logger.error(f"Error getting scraping metrics: {e}")
            return {}
    
    def _track_api_usage(self, api_name: str, tokens_used: int = 0, success: bool = True, cost_usd: float = 0.0):
        """Track external API usage and costs"""
        try:
            if api_name not in self.metrics.api_usage:
                self.metrics.api_usage[api_name] = APIUsageInfo(api_name=api_name)
            
            api_info = self.metrics.api_usage[api_name]
            api_info.total_calls += 1
            api_info.total_tokens_used += tokens_used
            api_info.estimated_cost_usd += cost_usd
            api_info.last_call_time = datetime.now()
            
            if success:
                api_info.successful_calls += 1
            else:
                api_info.failed_calls += 1
            
            logger.debug(f"API usage tracked: {api_name} - {tokens_used} tokens, ${cost_usd:.4f}")
            
        except Exception as e:
            logger.error(f"Error tracking API usage: {e}")
    
    def _check_rate_limit(self, api_name: str) -> bool:
        """Check if API call is within rate limits"""
        try:
            if api_name not in self.metrics.api_usage:
                return True  # No usage yet, allow call
            
            api_info = self.metrics.api_usage[api_name]
            
            # Check if rate limited
            if api_info.is_rate_limited():
                logger.warning(f"Rate limit exceeded for {api_name}")
                return False
            
            # Check rate limits based on API type
            if api_name in self.api_rate_limits:
                limits = self.api_rate_limits[api_name]
                
                # Simple rate limiting - check calls in last minute
                one_minute_ago = datetime.now() - timedelta(minutes=1)
                if api_info.last_call_time > one_minute_ago:
                    # For simplicity, assume we're at the limit if we made a call in the last minute
                    # In a real implementation, you'd track calls per minute more precisely
                    if api_info.total_calls % limits['calls_per_minute'] == 0:
                        logger.warning(f"Approaching rate limit for {api_name}")
                        return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            return True  # Allow call on error
    
    async def _make_api_call_with_timeout(self, api_call_func, timeout_seconds: int = None, api_name: str = "unknown"):
        """Make API call with timeout and error handling"""
        try:
            timeout = timeout_seconds or self.api_timeouts.get(api_name, self.api_timeouts['default'])
            
            # Check rate limits before making call
            if not self._check_rate_limit(api_name):
                self.metrics.fallback_usage += 1
                raise Exception(f"Rate limit exceeded for {api_name}")
            
            # Make API call with timeout
            result = await asyncio.wait_for(api_call_func(), timeout=timeout)
            
            # Track successful API usage
            self._track_api_usage(api_name, success=True)
            
            return result
            
        except asyncio.TimeoutError:
            logger.warning(f"API call timeout for {api_name} after {timeout}s")
            self.metrics.timeout_failures += 1
            self._track_api_usage(api_name, success=False)
            raise
        except Exception as e:
            logger.error(f"API call failed for {api_name}: {e}")
            self._track_api_usage(api_name, success=False)
            raise
    
    def _create_batch_key(self, query: str, data_source: DataSourceType) -> str:
        """Create batch key for similar queries"""
        # Extract key terms from query for batching
        query_words = query.lower().split()
        key_words = [word for word in query_words if len(word) > 3][:3]
        key_terms = "_".join(key_words) if key_words else "general"
        return f"{data_source.value}_{key_terms}"
    
    async def _add_to_batch(self, query: str, data_source: DataSourceType) -> Optional[str]:
        """Add query to batch for intelligent batching"""
        try:
            batch_key = self._create_batch_key(query, data_source)
            
            if batch_key not in self.pending_batches:
                # Create new batch
                batch_id = hashlib.md5(f"{batch_key}_{datetime.now().isoformat()}".encode()).hexdigest()[:12]
                self.pending_batches[batch_key] = BatchRequest(
                    queries=[query],
                    data_source=data_source,
                    created_at=datetime.now(),
                    batch_id=batch_id
                )
                
                # Schedule batch processing
                asyncio.create_task(self._process_batch_after_timeout(batch_key))
                
                logger.debug(f"Created new batch: {batch_key}")
                return batch_id
            else:
                # Try to add to existing batch
                batch = self.pending_batches[batch_key]
                if batch.can_add_query(query, self.max_batch_size):
                    batch.queries.append(query)
                    logger.debug(f"Added query to existing batch: {batch_key}")
                    return batch.batch_id
                else:
                    # Batch is full or query not similar, process immediately
                    return None
            
        except Exception as e:
            logger.error(f"Error adding to batch: {e}")
            return None
    
    async def _process_batch_after_timeout(self, batch_key: str):
        """Process batch after timeout period"""
        try:
            await asyncio.sleep(self.batch_timeout_seconds)
            
            if batch_key in self.pending_batches:
                batch = self.pending_batches[batch_key]
                logger.info(f"Processing batch {batch.batch_id} with {len(batch.queries)} queries")
                
                # Process all queries in batch together
                await self._process_batch_queries(batch)
                
                # Remove processed batch
                del self.pending_batches[batch_key]
                self.metrics.batched_requests += len(batch.queries)
            
        except Exception as e:
            logger.error(f"Error processing batch: {e}")
    
    async def _process_batch_queries(self, batch: BatchRequest):
        """Process all queries in a batch together"""
        try:
            # Combine similar queries for more efficient processing
            combined_query = " | ".join(batch.queries)
            
            # Process based on data source
            if batch.data_source == DataSourceType.GOVERNMENT_SOCIAL:
                # Get government data once for all similar queries
                posts = await self._make_api_call_with_timeout(
                    lambda: self.gov_scraper.scrape_all_accounts(),
                    api_name='scraping'
                )
                
                # Filter and cache results for each query
                for query in batch.queries:
                    relevant_posts = self._filter_government_posts_by_relevance(posts, query)
                    cache_key = self._generate_cache_key(query, batch.data_source)
                    query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
                    self._store_in_cache(cache_key, relevant_posts, batch.data_source, query_hash)
            
            elif batch.data_source == DataSourceType.PARLIAMENTARY:
                # Similar batching for parliamentary data
                sessions = await self._make_api_call_with_timeout(
                    lambda: self.marsad_monitor.get_parliamentary_sessions(days_back=30),
                    api_name='scraping'
                )
                
                for query in batch.queries:
                    relevant_sessions = self._filter_parliamentary_sessions_by_relevance(sessions, query)
                    cache_key = self._generate_cache_key(query, batch.data_source)
                    query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
                    self._store_in_cache(cache_key, relevant_sessions, batch.data_source, query_hash)
            
            elif batch.data_source == DataSourceType.QANOUN_LEGAL:
                # Batch process legal document searches
                for query in batch.queries:
                    documents = await self._make_api_call_with_timeout(
                        lambda: self.qanoun_scraper.search_documents(query),
                        api_name='scraping'
                    )
                    relevant_documents = self._filter_qanoun_documents_by_relevance(documents, query)
                    cache_key = self._generate_cache_key(query, batch.data_source)
                    query_hash = hashlib.md5(query.encode('utf-8')).hexdigest()[:12]
                    self._store_in_cache(cache_key, relevant_documents, batch.data_source, query_hash)
            
            logger.info(f"Batch processing completed for {len(batch.queries)} queries")
            
        except Exception as e:
            logger.error(f"Error in batch processing: {e}")
    
    async def _make_llm_call_with_cost_tracking(self, prompt: str, language: str = "ar") -> str:
        """Make LLM API call with cost tracking and optimization"""
        try:
            # Estimate token usage (rough approximation)
            estimated_input_tokens = len(prompt.split()) * 1.3  # Rough token estimation
            
            # Check if we should use LLM based on cost thresholds
            daily_cost_limit = 10.0  # $10 daily limit
            current_daily_cost = sum(
                api_info.estimated_cost_usd 
                for api_info in self.metrics.api_usage.values()
                if (datetime.now() - api_info.last_call_time).days == 0
            )
            
            if current_daily_cost >= daily_cost_limit:
                logger.warning(f"Daily cost limit reached: ${current_daily_cost:.2f}")
                self.metrics.fallback_usage += 1
                return self.external_llm._get_fallback_simplification(language)
            
            # Make LLM call with timeout
            response = await self._make_api_call_with_timeout(
                lambda: self.external_llm._get_llm_response(prompt, language),
                timeout_seconds=self.api_timeouts['llm'],
                api_name='gemini'  # Assuming Gemini is preferred
            )
            
            # Estimate cost and track usage
            estimated_output_tokens = len(response.split()) * 1.3
            estimated_cost = (
                estimated_input_tokens * self.api_costs['gemini']['input'] / 1000 +
                estimated_output_tokens * self.api_costs['gemini']['output'] / 1000
            )
            
            self._track_api_usage(
                'gemini',
                tokens_used=int(estimated_input_tokens + estimated_output_tokens),
                success=True,
                cost_usd=estimated_cost
            )
            
            return response
            
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            self.metrics.fallback_usage += 1
            return self.external_llm._get_fallback_simplification(language)
    
    def get_api_usage_report(self) -> Dict[str, Any]:
        """Get comprehensive API usage and cost report"""
        try:
            report = {
                'total_api_calls': sum(api.total_calls for api in self.metrics.api_usage.values()),
                'total_estimated_cost_usd': sum(api.estimated_cost_usd for api in self.metrics.api_usage.values()),
                'api_breakdown': {},
                'rate_limiting': {
                    'timeout_failures': self.metrics.timeout_failures,
                    'fallback_usage': self.metrics.fallback_usage
                },
                'batching_efficiency': {
                    'batched_requests': self.metrics.batched_requests,
                    'pending_batches': len(self.pending_batches)
                }
            }
            
            # API breakdown
            for api_name, api_info in self.metrics.api_usage.items():
                report['api_breakdown'][api_name] = {
                    'total_calls': api_info.total_calls,
                    'successful_calls': api_info.successful_calls,
                    'failed_calls': api_info.failed_calls,
                    'success_rate_percent': api_info.calculate_success_rate(),
                    'total_tokens': api_info.total_tokens_used,
                    'estimated_cost_usd': api_info.estimated_cost_usd,
                    'last_call': api_info.last_call_time.isoformat()
                }
            
            return report
            
        except Exception as e:
            logger.error(f"Error generating API usage report: {e}")
            return {}
    
    async def cleanup(self):
        """Clean up resources"""
        try:
            await self.gov_scraper.cleanup()
            await self.marsad_monitor.close()
            await self.qanoun_scraper.close()
            
            # Clear cache and pending batches
            self.scrape_cache.clear()
            self.pending_batches.clear()
            
            logger.info("EfficientScrapingManager cleanup completed")
            
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
    async def health_check(self) -> Dict[str, str]:
        """Check health of all scraping services"""
        try:
            health_status = {
                'government_scraper': await self.gov_scraper.health_check(),
                'marsad_monitor': await self.marsad_monitor.health_check(),
                'qanoun_scraper': await self.qanoun_scraper.health_check(),
                'cache_system': 'healthy' if len(self.scrape_cache) < self.max_cache_size else 'cache_full'
            }
            
            return health_status
            
        except Exception as e:
            logger.error(f"Error during health check: {e}")
            return {'error': str(e)}