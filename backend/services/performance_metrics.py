"""
Performance Metrics Service - Comprehensive tracking for unified response system
Tracks response times, intelligence source success rates, and quality metrics
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import time
import json
from collections import defaultdict, deque
import statistics

logger = logging.getLogger(__name__)

# Import database service for logging (will be injected to avoid circular imports)
_db_service = None

def set_database_service(db_service):
    """Set database service for logging metrics"""
    global _db_service
    _db_service = db_service

@dataclass
class QueryMetrics:
    """Metrics for a single query processing"""
    query_id: str
    query_type: str  # 'text' or 'audio'
    start_time: datetime
    end_time: Optional[datetime] = None
    total_time_ms: int = 0
    
    # Intelligence source metrics
    intelligence_sources_used: Dict[str, bool] = field(default_factory=dict)
    intelligence_sources_success: Dict[str, bool] = field(default_factory=dict)
    intelligence_sources_time_ms: Dict[str, int] = field(default_factory=dict)
    intelligence_data_quality: Dict[str, float] = field(default_factory=dict)
    
    # Response quality metrics
    confidence_score: float = 0.0
    sources_count: int = 0
    response_length: int = 0
    fallback_used: bool = False
    
    # Error tracking
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    
    # Resource utilization
    cache_hits: int = 0
    cache_misses: int = 0
    api_calls: int = 0
    scraping_operations: int = 0

@dataclass
class ComponentMetrics:
    """Metrics for individual system components"""
    component_name: str
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    avg_response_time_ms: float = 0.0
    min_response_time_ms: int = float('inf')
    max_response_time_ms: int = 0
    last_success: Optional[datetime] = None
    last_failure: Optional[datetime] = None
    error_rate: float = 0.0
    
    # Recent performance tracking (last 100 requests)
    recent_response_times: deque = field(default_factory=lambda: deque(maxlen=100))
    recent_success_rate: float = 0.0

@dataclass
class IntelligenceSourceMetrics:
    """Metrics for intelligence data sources"""
    source_name: str
    total_queries: int = 0
    successful_queries: int = 0
    data_retrieved: int = 0
    data_used: int = 0
    avg_relevance_score: float = 0.0
    avg_response_time_ms: float = 0.0
    cache_hit_rate: float = 0.0
    last_successful_query: Optional[datetime] = None
    data_quality_trend: List[float] = field(default_factory=list)

class PerformanceMetricsService:
    """
    Comprehensive performance metrics tracking service
    Monitors all aspects of the unified response system
    """
    
    def __init__(self):
        # Active query tracking
        self.active_queries: Dict[str, QueryMetrics] = {}
        
        # Component metrics
        self.component_metrics: Dict[str, ComponentMetrics] = {
            'legal_intelligence': ComponentMetrics('legal_intelligence'),
            'government_scraper': ComponentMetrics('government_scraper'),
            'parliamentary_monitor': ComponentMetrics('parliamentary_monitor'),
            'qanoun_scraper': ComponentMetrics('qanoun_scraper'),
            'traditional_legal_rag': ComponentMetrics('traditional_legal_rag'),
            'external_llm': ComponentMetrics('external_llm'),
            'audio_service': ComponentMetrics('audio_service'),
            'pii_filter': ComponentMetrics('pii_filter'),
            'database_service': ComponentMetrics('database_service')
        }
        
        # Intelligence source metrics
        self.intelligence_metrics: Dict[str, IntelligenceSourceMetrics] = {
            'government_data': IntelligenceSourceMetrics('government_data'),
            'parliamentary_data': IntelligenceSourceMetrics('parliamentary_data'),
            'qanoun_data': IntelligenceSourceMetrics('qanoun_data'),
            'traditional_legal': IntelligenceSourceMetrics('traditional_legal')
        }
        
        # System-wide metrics
        self.system_metrics = {
            'total_queries_processed': 0,
            'text_queries_processed': 0,
            'audio_queries_processed': 0,
            'avg_text_response_time_ms': 0.0,
            'avg_audio_response_time_ms': 0.0,
            'overall_success_rate': 0.0,
            'fallback_usage_rate': 0.0,
            'cache_efficiency': 0.0,
            'api_cost_tracking': 0.0
        }
        
        # Performance targets (from requirements)
        self.performance_targets = {
            'text_query_target_ms': 5000,  # 5 seconds for 90% of text queries
            'audio_query_target_ms': 8000,  # 8 seconds for 90% of audio queries
            'intelligence_gathering_target_ms': 3000,  # 3 seconds for intelligence gathering
            'minimum_confidence_score': 0.6,
            'target_success_rate': 0.90
        }
        
        # Recent performance tracking
        self.recent_text_response_times = deque(maxlen=1000)
        self.recent_audio_response_times = deque(maxlen=1000)
        self.recent_confidence_scores = deque(maxlen=1000)
        
        # Metrics collection interval
        self.metrics_collection_interval = 60  # seconds
        self.last_metrics_collection = datetime.now()
        
    async def start_query_tracking(self, query_id: str, query_type: str) -> QueryMetrics:
        """Start tracking metrics for a new query"""
        try:
            metrics = QueryMetrics(
                query_id=query_id,
                query_type=query_type,
                start_time=datetime.now()
            )
            
            self.active_queries[query_id] = metrics
            logger.debug(f"Started tracking metrics for {query_type} query {query_id}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error starting query tracking: {e}")
            # Return basic metrics even if tracking fails
            return QueryMetrics(query_id=query_id, query_type=query_type, start_time=datetime.now())
    
    async def end_query_tracking(
        self, 
        query_id: str, 
        confidence_score: float = 0.0,
        sources_count: int = 0,
        response_length: int = 0,
        fallback_used: bool = False
    ) -> Optional[QueryMetrics]:
        """End tracking for a query and calculate final metrics"""
        try:
            if query_id not in self.active_queries:
                logger.warning(f"Query {query_id} not found in active tracking")
                return None
            
            metrics = self.active_queries[query_id]
            metrics.end_time = datetime.now()
            metrics.total_time_ms = int((metrics.end_time - metrics.start_time).total_seconds() * 1000)
            metrics.confidence_score = confidence_score
            metrics.sources_count = sources_count
            metrics.response_length = response_length
            metrics.fallback_used = fallback_used
            
            # Update system-wide metrics
            self.system_metrics['total_queries_processed'] += 1
            
            if metrics.query_type == 'text':
                self.system_metrics['text_queries_processed'] += 1
                self.recent_text_response_times.append(metrics.total_time_ms)
                
                # Update average text response time
                if len(self.recent_text_response_times) > 0:
                    self.system_metrics['avg_text_response_time_ms'] = statistics.mean(self.recent_text_response_times)
                    
            elif metrics.query_type == 'audio':
                self.system_metrics['audio_queries_processed'] += 1
                self.recent_audio_response_times.append(metrics.total_time_ms)
                
                # Update average audio response time
                if len(self.recent_audio_response_times) > 0:
                    self.system_metrics['avg_audio_response_time_ms'] = statistics.mean(self.recent_audio_response_times)
            
            # Track confidence scores
            self.recent_confidence_scores.append(confidence_score)
            
            # Update fallback usage rate
            total_queries = self.system_metrics['total_queries_processed']
            fallback_count = sum(1 for q in self.active_queries.values() if q.fallback_used)
            if fallback_used:
                fallback_count += 1
            self.system_metrics['fallback_usage_rate'] = fallback_count / total_queries if total_queries > 0 else 0.0
            
            # Remove from active tracking
            del self.active_queries[query_id]
            
            logger.debug(f"Completed tracking for query {query_id}: {metrics.total_time_ms}ms")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error ending query tracking: {e}")
            return None
    
    async def track_component_performance(
        self, 
        component_name: str, 
        response_time_ms: int, 
        success: bool,
        error_message: Optional[str] = None
    ):
        """Track performance metrics for individual components"""
        try:
            if component_name not in self.component_metrics:
                self.component_metrics[component_name] = ComponentMetrics(component_name)
            
            metrics = self.component_metrics[component_name]
            metrics.total_requests += 1
            
            if success:
                metrics.successful_requests += 1
                metrics.last_success = datetime.now()
            else:
                metrics.failed_requests += 1
                metrics.last_failure = datetime.now()
                if error_message:
                    logger.warning(f"Component {component_name} failed: {error_message}")
            
            # Update response time statistics
            metrics.recent_response_times.append(response_time_ms)
            metrics.min_response_time_ms = min(metrics.min_response_time_ms, response_time_ms)
            metrics.max_response_time_ms = max(metrics.max_response_time_ms, response_time_ms)
            
            if len(metrics.recent_response_times) > 0:
                metrics.avg_response_time_ms = statistics.mean(metrics.recent_response_times)
            
            # Calculate error rate
            metrics.error_rate = metrics.failed_requests / metrics.total_requests if metrics.total_requests > 0 else 0.0
            
            # Calculate recent success rate
            recent_successes = sum(1 for _ in range(min(len(metrics.recent_response_times), 50)))
            recent_total = min(len(metrics.recent_response_times), 50)
            metrics.recent_success_rate = recent_successes / recent_total if recent_total > 0 else 0.0
            
        except Exception as e:
            logger.error(f"Error tracking component performance: {e}")
    
    async def track_intelligence_source_performance(
        self,
        source_name: str,
        query_successful: bool,
        data_retrieved: int,
        data_used: int,
        relevance_score: float,
        response_time_ms: int,
        cache_hit: bool = False
    ):
        """Track performance metrics for intelligence data sources"""
        try:
            if source_name not in self.intelligence_metrics:
                self.intelligence_metrics[source_name] = IntelligenceSourceMetrics(source_name)
            
            metrics = self.intelligence_metrics[source_name]
            metrics.total_queries += 1
            
            if query_successful:
                metrics.successful_queries += 1
                metrics.last_successful_query = datetime.now()
            
            metrics.data_retrieved += data_retrieved
            metrics.data_used += data_used
            
            # Update relevance score average
            if len(metrics.data_quality_trend) >= 100:
                metrics.data_quality_trend.pop(0)
            metrics.data_quality_trend.append(relevance_score)
            metrics.avg_relevance_score = statistics.mean(metrics.data_quality_trend)
            
            # Update response time average
            if metrics.total_queries == 1:
                metrics.avg_response_time_ms = response_time_ms
            else:
                metrics.avg_response_time_ms = (
                    (metrics.avg_response_time_ms * (metrics.total_queries - 1) + response_time_ms) 
                    / metrics.total_queries
                )
            
            # Update cache hit rate
            cache_hits = sum(1 for _ in range(min(metrics.total_queries, 100))) if cache_hit else 0
            metrics.cache_hit_rate = cache_hits / min(metrics.total_queries, 100)
            
        except Exception as e:
            logger.error(f"Error tracking intelligence source performance: {e}")
    
    async def track_query_intelligence_usage(
        self, 
        query_id: str, 
        source_name: str, 
        success: bool, 
        response_time_ms: int,
        data_quality: float = 0.0
    ):
        """Track intelligence source usage for a specific query"""
        try:
            if query_id in self.active_queries:
                metrics = self.active_queries[query_id]
                metrics.intelligence_sources_used[source_name] = True
                metrics.intelligence_sources_success[source_name] = success
                metrics.intelligence_sources_time_ms[source_name] = response_time_ms
                metrics.intelligence_data_quality[source_name] = data_quality
                
                if not success:
                    metrics.warnings.append(f"Intelligence source {source_name} failed")
                    
        except Exception as e:
            logger.error(f"Error tracking query intelligence usage: {e}")
    
    async def track_resource_utilization(
        self, 
        query_id: str, 
        cache_hits: int = 0, 
        cache_misses: int = 0,
        api_calls: int = 0, 
        scraping_operations: int = 0
    ):
        """Track resource utilization for a query"""
        try:
            if query_id in self.active_queries:
                metrics = self.active_queries[query_id]
                metrics.cache_hits += cache_hits
                metrics.cache_misses += cache_misses
                metrics.api_calls += api_calls
                metrics.scraping_operations += scraping_operations
                
        except Exception as e:
            logger.error(f"Error tracking resource utilization: {e}")
    
    async def get_performance_summary(self) -> Dict[str, Any]:
        """Get comprehensive performance summary"""
        try:
            # Calculate performance percentiles
            text_p90 = self._calculate_percentile(list(self.recent_text_response_times), 90) if self.recent_text_response_times else 0
            text_p95 = self._calculate_percentile(list(self.recent_text_response_times), 95) if self.recent_text_response_times else 0
            
            audio_p90 = self._calculate_percentile(list(self.recent_audio_response_times), 90) if self.recent_audio_response_times else 0
            audio_p95 = self._calculate_percentile(list(self.recent_audio_response_times), 95) if self.recent_audio_response_times else 0
            
            # Calculate target achievement
            text_target_achievement = self._calculate_target_achievement(
                list(self.recent_text_response_times), 
                self.performance_targets['text_query_target_ms']
            )
            
            audio_target_achievement = self._calculate_target_achievement(
                list(self.recent_audio_response_times), 
                self.performance_targets['audio_query_target_ms']
            )
            
            # Calculate overall success rate
            total_successful = sum(m.successful_requests for m in self.component_metrics.values())
            total_requests = sum(m.total_requests for m in self.component_metrics.values())
            overall_success_rate = total_successful / total_requests if total_requests > 0 else 0.0
            
            # Calculate cache efficiency
            total_cache_hits = sum(q.cache_hits for q in self.active_queries.values())
            total_cache_requests = sum(q.cache_hits + q.cache_misses for q in self.active_queries.values())
            cache_efficiency = total_cache_hits / total_cache_requests if total_cache_requests > 0 else 0.0
            
            return {
                "timestamp": datetime.now().isoformat(),
                "system_overview": {
                    "total_queries_processed": self.system_metrics['total_queries_processed'],
                    "text_queries": self.system_metrics['text_queries_processed'],
                    "audio_queries": self.system_metrics['audio_queries_processed'],
                    "overall_success_rate": overall_success_rate,
                    "fallback_usage_rate": self.system_metrics['fallback_usage_rate'],
                    "cache_efficiency": cache_efficiency
                },
                "response_time_performance": {
                    "text_queries": {
                        "average_ms": self.system_metrics['avg_text_response_time_ms'],
                        "p90_ms": text_p90,
                        "p95_ms": text_p95,
                        "target_ms": self.performance_targets['text_query_target_ms'],
                        "target_achievement_rate": text_target_achievement
                    },
                    "audio_queries": {
                        "average_ms": self.system_metrics['avg_audio_response_time_ms'],
                        "p90_ms": audio_p90,
                        "p95_ms": audio_p95,
                        "target_ms": self.performance_targets['audio_query_target_ms'],
                        "target_achievement_rate": audio_target_achievement
                    }
                },
                "component_health": {
                    name: {
                        "success_rate": (metrics.successful_requests / metrics.total_requests) if metrics.total_requests > 0 else 0.0,
                        "avg_response_time_ms": metrics.avg_response_time_ms,
                        "error_rate": metrics.error_rate,
                        "last_success": metrics.last_success.isoformat() if metrics.last_success else None,
                        "recent_success_rate": metrics.recent_success_rate
                    }
                    for name, metrics in self.component_metrics.items()
                },
                "intelligence_sources": {
                    name: {
                        "success_rate": (metrics.successful_queries / metrics.total_queries) if metrics.total_queries > 0 else 0.0,
                        "data_utilization_rate": (metrics.data_used / metrics.data_retrieved) if metrics.data_retrieved > 0 else 0.0,
                        "avg_relevance_score": metrics.avg_relevance_score,
                        "avg_response_time_ms": metrics.avg_response_time_ms,
                        "cache_hit_rate": metrics.cache_hit_rate
                    }
                    for name, metrics in self.intelligence_metrics.items()
                },
                "quality_metrics": {
                    "avg_confidence_score": statistics.mean(self.recent_confidence_scores) if self.recent_confidence_scores else 0.0,
                    "confidence_score_trend": list(self.recent_confidence_scores)[-10:],  # Last 10 scores
                    "target_confidence": self.performance_targets['minimum_confidence_score']
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating performance summary: {e}")
            return {"error": str(e), "timestamp": datetime.now().isoformat()}
    
    def _calculate_percentile(self, values: List[float], percentile: int) -> float:
        """Calculate percentile for a list of values"""
        if not values:
            return 0.0
        
        sorted_values = sorted(values)
        index = (percentile / 100.0) * (len(sorted_values) - 1)
        
        if index.is_integer():
            return sorted_values[int(index)]
        else:
            lower = sorted_values[int(index)]
            upper = sorted_values[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))
    
    def _calculate_target_achievement(self, values: List[float], target: float) -> float:
        """Calculate percentage of values that meet the target"""
        if not values:
            return 0.0
        
        meeting_target = sum(1 for v in values if v <= target)
        return meeting_target / len(values)
    
    async def log_performance_alert(self, alert_type: str, message: str, severity: str = "warning"):
        """Log performance alerts for monitoring"""
        try:
            alert = {
                "timestamp": datetime.now().isoformat(),
                "alert_type": alert_type,
                "message": message,
                "severity": severity,
                "system_state": await self.get_performance_summary()
            }
            
            logger.warning(f"Performance Alert [{severity.upper()}]: {alert_type} - {message}")
            
            # In a production system, this would send alerts to monitoring systems
            # For now, we'll just log them
            
        except Exception as e:
            logger.error(f"Error logging performance alert: {e}")
    
    async def check_performance_thresholds(self):
        """Check if performance metrics exceed thresholds and generate alerts"""
        try:
            # Check text query performance
            if self.recent_text_response_times:
                avg_text_time = statistics.mean(self.recent_text_response_times)
                if avg_text_time > self.performance_targets['text_query_target_ms']:
                    await self.log_performance_alert(
                        "text_query_performance",
                        f"Average text query time ({avg_text_time:.0f}ms) exceeds target ({self.performance_targets['text_query_target_ms']}ms)",
                        "warning"
                    )
            
            # Check audio query performance
            if self.recent_audio_response_times:
                avg_audio_time = statistics.mean(self.recent_audio_response_times)
                if avg_audio_time > self.performance_targets['audio_query_target_ms']:
                    await self.log_performance_alert(
                        "audio_query_performance",
                        f"Average audio query time ({avg_audio_time:.0f}ms) exceeds target ({self.performance_targets['audio_query_target_ms']}ms)",
                        "warning"
                    )
            
            # Check confidence scores
            if self.recent_confidence_scores:
                avg_confidence = statistics.mean(self.recent_confidence_scores)
                if avg_confidence < self.performance_targets['minimum_confidence_score']:
                    await self.log_performance_alert(
                        "confidence_score_low",
                        f"Average confidence score ({avg_confidence:.2f}) below target ({self.performance_targets['minimum_confidence_score']})",
                        "warning"
                    )
            
            # Check component health
            for name, metrics in self.component_metrics.items():
                if metrics.total_requests > 10:  # Only check components with sufficient data
                    success_rate = metrics.successful_requests / metrics.total_requests
                    if success_rate < self.performance_targets['target_success_rate']:
                        await self.log_performance_alert(
                            "component_health",
                            f"Component {name} success rate ({success_rate:.2f}) below target ({self.performance_targets['target_success_rate']})",
                            "critical"
                        )
            
        except Exception as e:
            logger.error(f"Error checking performance thresholds: {e}")
    
    async def health_check(self) -> str:
        """Health check for the metrics service"""
        try:
            # Check if metrics are being collected
            if datetime.now() - self.last_metrics_collection > timedelta(minutes=5):
                return "unhealthy - metrics collection stalled"
            
            # Check if we have recent data
            if not self.recent_text_response_times and not self.recent_audio_response_times:
                return "healthy - no recent queries"
            
            return "healthy"
            
        except Exception as e:
            return f"unhealthy - {str(e)}"

# Global metrics service instance
performance_metrics = PerformanceMetricsService()