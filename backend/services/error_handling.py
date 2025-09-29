"""
Error Handling and Graceful Degradation Service
Implements fallback mechanisms when intelligence sources fail
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from enum import Enum
import json

from services.performance_metrics import performance_metrics

logger = logging.getLogger(__name__)

class ServiceStatus(Enum):
    """Service status enumeration"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    FAILED = "failed"
    UNKNOWN = "unknown"

class FallbackLevel(Enum):
    """Fallback levels for graceful degradation"""
    FULL_INTELLIGENCE = "full_intelligence"  # All sources available
    PARTIAL_INTELLIGENCE = "partial_intelligence"  # Some sources available
    TRADITIONAL_ONLY = "traditional_only"  # Only traditional legal RAG
    BASIC_RESPONSE = "basic_response"  # Minimal response capability
    ERROR_RESPONSE = "error_response"  # Service unavailable

@dataclass
class ServiceHealth:
    """Health status for individual services"""
    service_name: str
    status: ServiceStatus
    last_success: Optional[datetime] = None
    last_failure: Optional[datetime] = None
    consecutive_failures: int = 0
    error_rate: float = 0.0
    avg_response_time_ms: float = 0.0
    is_critical: bool = False  # Whether service is critical for basic functionality

@dataclass
class FallbackResponse:
    """Response structure for fallback scenarios"""
    response_text: str
    sources: List[Dict[str, Any]]
    confidence_score: float
    fallback_level: FallbackLevel
    available_sources: List[str]
    failed_sources: List[str]
    warnings: List[str]
    processing_time_ms: int

class GracefulDegradationService:
    """
    Service that handles graceful degradation when intelligence sources fail
    Implements multiple fallback levels to ensure system availability
    """
    
    def __init__(self):
        # Service health tracking
        self.service_health: Dict[str, ServiceHealth] = {
            'government_scraper': ServiceHealth('government_scraper', ServiceStatus.UNKNOWN, is_critical=False),
            'parliamentary_monitor': ServiceHealth('parliamentary_monitor', ServiceStatus.UNKNOWN, is_critical=False),
            'qanoun_scraper': ServiceHealth('qanoun_scraper', ServiceStatus.UNKNOWN, is_critical=False),
            'traditional_legal_rag': ServiceHealth('traditional_legal_rag', ServiceStatus.UNKNOWN, is_critical=True),
            'external_llm': ServiceHealth('external_llm', ServiceStatus.UNKNOWN, is_critical=True),
            'legal_intelligence': ServiceHealth('legal_intelligence', ServiceStatus.UNKNOWN, is_critical=False),
            'audio_service': ServiceHealth('audio_service', ServiceStatus.UNKNOWN, is_critical=False),
            'database_service': ServiceHealth('database_service', ServiceStatus.UNKNOWN, is_critical=True)
        }
        
        # Fallback thresholds
        self.failure_thresholds = {
            'consecutive_failures': 3,  # Max consecutive failures before marking as failed
            'error_rate_threshold': 0.5,  # Max error rate before degradation
            'response_time_threshold_ms': 10000,  # Max response time before degradation
            'health_check_interval_seconds': 300  # 5 minutes
        }
        
        # Fallback strategies
        self.fallback_strategies = {
            FallbackLevel.FULL_INTELLIGENCE: self._full_intelligence_response,
            FallbackLevel.PARTIAL_INTELLIGENCE: self._partial_intelligence_response,
            FallbackLevel.TRADITIONAL_ONLY: self._traditional_only_response,
            FallbackLevel.BASIC_RESPONSE: self._basic_response,
            FallbackLevel.ERROR_RESPONSE: self._error_response
        }
        
        # Cache for fallback responses
        self.fallback_cache: Dict[str, FallbackResponse] = {}
        self.cache_ttl_seconds = 300  # 5 minutes
        
        # Error context tracking
        self.error_context: Dict[str, List[str]] = {}
        
    async def update_service_health(
        self, 
        service_name: str, 
        success: bool, 
        response_time_ms: int = 0,
        error_message: Optional[str] = None
    ):
        """Update health status for a service"""
        try:
            if service_name not in self.service_health:
                self.service_health[service_name] = ServiceHealth(service_name, ServiceStatus.UNKNOWN)
            
            health = self.service_health[service_name]
            
            if success:
                health.last_success = datetime.now()
                health.consecutive_failures = 0
                health.status = ServiceStatus.HEALTHY
                
                # Clear error context on success
                if service_name in self.error_context:
                    self.error_context[service_name] = []
                    
            else:
                health.last_failure = datetime.now()
                health.consecutive_failures += 1
                
                # Add error context
                if service_name not in self.error_context:
                    self.error_context[service_name] = []
                if error_message:
                    self.error_context[service_name].append(f"{datetime.now().isoformat()}: {error_message}")
                    # Keep only last 10 errors
                    self.error_context[service_name] = self.error_context[service_name][-10:]
                
                # Determine status based on consecutive failures
                if health.consecutive_failures >= self.failure_thresholds['consecutive_failures']:
                    health.status = ServiceStatus.FAILED
                else:
                    health.status = ServiceStatus.DEGRADED
            
            # Update response time
            if response_time_ms > 0:
                if health.avg_response_time_ms == 0:
                    health.avg_response_time_ms = response_time_ms
                else:
                    # Exponential moving average
                    health.avg_response_time_ms = (health.avg_response_time_ms * 0.8) + (response_time_ms * 0.2)
            
            logger.debug(f"Updated health for {service_name}: {health.status.value}")
            
        except Exception as e:
            logger.error(f"Error updating service health: {e}")
    
    async def determine_fallback_level(self) -> FallbackLevel:
        """Determine the appropriate fallback level based on service health"""
        try:
            # Check critical services first
            critical_services_healthy = all(
                health.status in [ServiceStatus.HEALTHY, ServiceStatus.DEGRADED]
                for name, health in self.service_health.items()
                if health.is_critical
            )
            
            if not critical_services_healthy:
                return FallbackLevel.ERROR_RESPONSE
            
            # Check intelligence sources
            intelligence_sources = ['government_scraper', 'parliamentary_monitor', 'qanoun_scraper']
            healthy_intelligence_sources = sum(
                1 for source in intelligence_sources
                if self.service_health[source].status == ServiceStatus.HEALTHY
            )
            
            # Determine fallback level based on available sources
            if healthy_intelligence_sources >= 2 and self.service_health['legal_intelligence'].status == ServiceStatus.HEALTHY:
                return FallbackLevel.FULL_INTELLIGENCE
            elif healthy_intelligence_sources >= 1 or self.service_health['legal_intelligence'].status == ServiceStatus.DEGRADED:
                return FallbackLevel.PARTIAL_INTELLIGENCE
            elif self.service_health['traditional_legal_rag'].status in [ServiceStatus.HEALTHY, ServiceStatus.DEGRADED]:
                return FallbackLevel.TRADITIONAL_ONLY
            else:
                return FallbackLevel.BASIC_RESPONSE
                
        except Exception as e:
            logger.error(f"Error determining fallback level: {e}")
            return FallbackLevel.ERROR_RESPONSE
    
    async def handle_intelligence_failure(
        self, 
        query: str, 
        failed_sources: List[str],
        available_data: Dict[str, Any] = None,
        language: str = "ar"
    ) -> FallbackResponse:
        """Handle intelligence gathering failures with graceful degradation"""
        try:
            # Determine fallback level
            fallback_level = await self.determine_fallback_level()
            
            logger.info(f"Handling intelligence failure with fallback level: {fallback_level.value}")
            
            # Check cache first
            cache_key = f"{query[:50]}_{fallback_level.value}_{language}"
            if cache_key in self.fallback_cache:
                cached_response = self.fallback_cache[cache_key]
                if (datetime.now() - datetime.fromisoformat(cached_response.response_text.split('|')[-1])).seconds < self.cache_ttl_seconds:
                    logger.debug(f"Using cached fallback response for level {fallback_level.value}")
                    return cached_response
            
            # Execute fallback strategy
            fallback_strategy = self.fallback_strategies.get(fallback_level, self._error_response)
            response = await fallback_strategy(query, failed_sources, available_data, language)
            
            # Cache the response
            self.fallback_cache[cache_key] = response
            
            # Log fallback usage
            await performance_metrics.track_component_performance(
                f'fallback_{fallback_level.value}', response.processing_time_ms, True
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error in fallback handling: {e}")
            return await self._error_response(query, failed_sources, available_data, language)
    
    async def _full_intelligence_response(
        self, 
        query: str, 
        failed_sources: List[str],
        available_data: Dict[str, Any],
        language: str
    ) -> FallbackResponse:
        """Full intelligence response with all sources available"""
        try:
            # This should not be called if we're in fallback mode
            # But if it is, we'll provide the best available response
            response_parts = []
            sources = []
            
            if available_data:
                # Use available intelligence data
                if available_data.get('traditional_legal'):
                    response_parts.append("**📚 Legal Framework:**")
                    for doc in available_data['traditional_legal'][:2]:
                        response_parts.append(f"• {doc.get('title', 'Legal Document')}")
                        sources.append({
                            "type": "traditional_legal",
                            "title": doc.get('title', ''),
                            "source": "Legal Database",
                            "relevance": doc.get('relevance', 0.8)
                        })
                
                if available_data.get('government_position'):
                    response_parts.append("\n**🏛️ Government Position:**")
                    for signal in available_data['government_position'][:1]:
                        response_parts.append(f"• Recent government communication detected")
                        sources.append({
                            "type": "government_social",
                            "title": "Government Signal",
                            "source": "Government Social Media",
                            "relevance": 0.7
                        })
            
            response_text = "\n".join(response_parts) if response_parts else "Legal guidance available based on traditional sources."
            
            return FallbackResponse(
                response_text=response_text,
                sources=sources,
                confidence_score=0.8,
                fallback_level=FallbackLevel.FULL_INTELLIGENCE,
                available_sources=['traditional_legal', 'government_data', 'parliamentary_data'],
                failed_sources=failed_sources,
                warnings=[],
                processing_time_ms=500
            )
            
        except Exception as e:
            logger.error(f"Error in full intelligence fallback: {e}")
            return await self._traditional_only_response(query, failed_sources, available_data, language)
    
    async def _partial_intelligence_response(
        self, 
        query: str, 
        failed_sources: List[str],
        available_data: Dict[str, Any],
        language: str
    ) -> FallbackResponse:
        """Partial intelligence response with some sources failed"""
        try:
            response_parts = []
            sources = []
            warnings = []
            
            # Always try to include traditional legal if available
            if available_data and available_data.get('traditional_legal'):
                response_parts.append("**📚 Legal Framework:**")
                for doc in available_data['traditional_legal'][:2]:
                    response_parts.append(f"• {doc.get('title', 'Legal Document')}")
                    sources.append({
                        "type": "traditional_legal",
                        "title": doc.get('title', ''),
                        "source": "Legal Database",
                        "relevance": doc.get('relevance', 0.8)
                    })
            
            # Add available intelligence sources
            available_sources = []
            if 'government_scraper' not in failed_sources and available_data and available_data.get('government_position'):
                response_parts.append("\n**🏛️ Government Position:**")
                response_parts.append("• Recent government communications analyzed")
                sources.append({
                    "type": "government_social",
                    "title": "Government Communications",
                    "source": "Government Social Media",
                    "relevance": 0.6
                })
                available_sources.append('government_data')
            
            if 'parliamentary_monitor' not in failed_sources and available_data and available_data.get('parliamentary_context'):
                response_parts.append("\n**🏛️ Parliamentary Context:**")
                response_parts.append("• Recent parliamentary discussions reviewed")
                sources.append({
                    "type": "parliamentary",
                    "title": "Parliamentary Sessions",
                    "source": "Parliamentary Records",
                    "relevance": 0.6
                })
                available_sources.append('parliamentary_data')
            
            # Add warnings for failed sources
            if 'government_scraper' in failed_sources:
                warnings.append("Government social media monitoring temporarily unavailable")
            if 'parliamentary_monitor' in failed_sources:
                warnings.append("Parliamentary data monitoring temporarily unavailable")
            if 'qanoun_scraper' in failed_sources:
                warnings.append("9anoun.tn database temporarily unavailable")
            
            response_text = "\n".join(response_parts) if response_parts else "Legal guidance available from traditional sources."
            
            if warnings:
                response_text += f"\n\n**Note:** {'; '.join(warnings)}"
            
            return FallbackResponse(
                response_text=response_text,
                sources=sources,
                confidence_score=0.6,
                fallback_level=FallbackLevel.PARTIAL_INTELLIGENCE,
                available_sources=available_sources,
                failed_sources=failed_sources,
                warnings=warnings,
                processing_time_ms=300
            )
            
        except Exception as e:
            logger.error(f"Error in partial intelligence fallback: {e}")
            return await self._traditional_only_response(query, failed_sources, available_data, language)
    
    async def _traditional_only_response(
        self, 
        query: str, 
        failed_sources: List[str],
        available_data: Dict[str, Any],
        language: str
    ) -> FallbackResponse:
        """Traditional legal RAG only response"""
        try:
            response_parts = ["**📚 Legal Guidance:**"]
            sources = []
            
            # Use traditional legal data if available
            if available_data and available_data.get('traditional_legal'):
                for doc in available_data['traditional_legal'][:3]:
                    response_parts.append(f"• {doc.get('title', 'Legal Document')}")
                    sources.append({
                        "type": "traditional_legal",
                        "title": doc.get('title', ''),
                        "source": "Legal Database",
                        "relevance": doc.get('relevance', 0.7)
                    })
            else:
                # Provide generic legal guidance
                response_parts.append("• Based on Tunisian legal framework")
                response_parts.append("• Consult with qualified legal professional for specific advice")
                sources.append({
                    "type": "traditional_legal",
                    "title": "General Legal Guidance",
                    "source": "Tunisian Legal Code",
                    "relevance": 0.5
                })
            
            response_text = "\n".join(response_parts)
            response_text += "\n\n**Note:** Enhanced legal intelligence temporarily unavailable. Response based on traditional legal sources only."
            
            return FallbackResponse(
                response_text=response_text,
                sources=sources,
                confidence_score=0.4,
                fallback_level=FallbackLevel.TRADITIONAL_ONLY,
                available_sources=['traditional_legal'],
                failed_sources=failed_sources,
                warnings=["Enhanced intelligence sources temporarily unavailable"],
                processing_time_ms=200
            )
            
        except Exception as e:
            logger.error(f"Error in traditional only fallback: {e}")
            return await self._basic_response(query, failed_sources, available_data, language)
    
    async def _basic_response(
        self, 
        query: str, 
        failed_sources: List[str],
        available_data: Dict[str, Any],
        language: str
    ) -> FallbackResponse:
        """Basic response when most services are unavailable"""
        try:
            if language == "ar":
                response_text = """**إرشادات قانونية أساسية:**

• نظام الاستشارة القانونية المتقدم غير متاح مؤقتاً
• يُنصح بالتواصل مع محامٍ مؤهل للحصول على استشارة قانونية محددة
• يمكن مراجعة المواقع الرسمية للوزارات المختصة
• هذه الخدمة ستعود للعمل الطبيعي قريباً

**تنبيه:** هذه معلومات عامة وليست استشارة قانونية محددة."""
            else:
                response_text = """**Basic Legal Guidance:**

• Advanced legal consultation system temporarily unavailable
• Recommend consulting with qualified legal professional for specific advice
• You may review official ministry websites for current information
• This service will return to normal operation soon

**Notice:** This is general information and not specific legal advice."""
            
            return FallbackResponse(
                response_text=response_text,
                sources=[{
                    "type": "basic_guidance",
                    "title": "Basic Legal Information",
                    "source": "System Fallback",
                    "relevance": 0.3
                }],
                confidence_score=0.2,
                fallback_level=FallbackLevel.BASIC_RESPONSE,
                available_sources=[],
                failed_sources=failed_sources,
                warnings=["All enhanced legal services temporarily unavailable"],
                processing_time_ms=100
            )
            
        except Exception as e:
            logger.error(f"Error in basic response fallback: {e}")
            return await self._error_response(query, failed_sources, available_data, language)
    
    async def _error_response(
        self, 
        query: str, 
        failed_sources: List[str],
        available_data: Dict[str, Any],
        language: str
    ) -> FallbackResponse:
        """Error response when system is unavailable"""
        try:
            if language == "ar":
                response_text = """**خدمة الاستشارة القانونية غير متاحة مؤقتاً**

نعتذر، النظام يواجه مشاكل تقنية مؤقتة. يرجى:

• المحاولة مرة أخرى خلال بضع دقائق
• التواصل مع محامٍ مؤهل للاستشارة العاجلة
• مراجعة المواقع الرسمية للوزارات المختصة

نعمل على حل المشكلة في أسرع وقت ممكن."""
            else:
                response_text = """**Legal Consultation Service Temporarily Unavailable**

We apologize, the system is experiencing temporary technical issues. Please:

• Try again in a few minutes
• Contact a qualified lawyer for urgent consultation
• Review official ministry websites for current information

We are working to resolve the issue as quickly as possible."""
            
            return FallbackResponse(
                response_text=response_text,
                sources=[],
                confidence_score=0.0,
                fallback_level=FallbackLevel.ERROR_RESPONSE,
                available_sources=[],
                failed_sources=failed_sources,
                warnings=["System temporarily unavailable"],
                processing_time_ms=50
            )
            
        except Exception as e:
            logger.error(f"Error in error response fallback: {e}")
            # Ultimate fallback - return minimal response
            return FallbackResponse(
                response_text="Service temporarily unavailable. Please try again later.",
                sources=[],
                confidence_score=0.0,
                fallback_level=FallbackLevel.ERROR_RESPONSE,
                available_sources=[],
                failed_sources=failed_sources + ["error_handler"],
                warnings=["Critical system error"],
                processing_time_ms=10
            )
    
    async def handle_government_scraper_failure(self, query: str, error: str) -> Dict[str, Any]:
        """Handle government scraper failures specifically"""
        try:
            await self.update_service_health('government_scraper', False, error_message=error)
            
            logger.warning(f"Government scraper failed: {error}")
            
            # Return empty government data but log the context
            return {
                'government_position': [],
                'government_signals_available': False,
                'fallback_reason': f"Government scraper unavailable: {error}",
                'alternative_sources': ['traditional_legal', 'parliamentary_data', 'qanoun_data']
            }
            
        except Exception as e:
            logger.error(f"Error handling government scraper failure: {e}")
            return {'government_position': [], 'government_signals_available': False}
    
    async def handle_parliamentary_data_failure(self, query: str, error: str) -> Dict[str, Any]:
        """Handle parliamentary data unavailability"""
        try:
            await self.update_service_health('parliamentary_monitor', False, error_message=error)
            
            logger.warning(f"Parliamentary monitor failed: {error}")
            
            # Return empty parliamentary data but log the context
            return {
                'parliamentary_context': [],
                'parliamentary_data_available': False,
                'fallback_reason': f"Parliamentary monitor unavailable: {error}",
                'alternative_sources': ['traditional_legal', 'government_data', 'qanoun_data']
            }
            
        except Exception as e:
            logger.error(f"Error handling parliamentary data failure: {e}")
            return {'parliamentary_context': [], 'parliamentary_data_available': False}
    
    async def handle_qanoun_scraper_failure(self, query: str, error: str) -> Dict[str, Any]:
        """Handle 9anoun.tn scraper failures"""
        try:
            await self.update_service_health('qanoun_scraper', False, error_message=error)
            
            logger.warning(f"Qanoun scraper failed: {error}")
            
            # Return empty qanoun data but log the context
            return {
                'qanoun_references': [],
                'qanoun_data_available': False,
                'fallback_reason': f"9anoun.tn scraper unavailable: {error}",
                'alternative_sources': ['traditional_legal', 'government_data', 'parliamentary_data']
            }
            
        except Exception as e:
            logger.error(f"Error handling qanoun scraper failure: {e}")
            return {'qanoun_references': [], 'qanoun_data_available': False}
    
    async def get_system_health_summary(self) -> Dict[str, Any]:
        """Get comprehensive system health summary"""
        try:
            current_fallback_level = await self.determine_fallback_level()
            
            # Calculate overall system health
            healthy_services = sum(1 for h in self.service_health.values() if h.status == ServiceStatus.HEALTHY)
            total_services = len(self.service_health)
            system_health_percentage = (healthy_services / total_services) * 100
            
            # Get critical services status
            critical_services_status = {
                name: health.status.value
                for name, health in self.service_health.items()
                if health.is_critical
            }
            
            # Get intelligence sources status
            intelligence_sources_status = {
                name: health.status.value
                for name, health in self.service_health.items()
                if name in ['government_scraper', 'parliamentary_monitor', 'qanoun_scraper']
            }
            
            return {
                "timestamp": datetime.now().isoformat(),
                "overall_health_percentage": system_health_percentage,
                "current_fallback_level": current_fallback_level.value,
                "critical_services": critical_services_status,
                "intelligence_sources": intelligence_sources_status,
                "service_details": {
                    name: {
                        "status": health.status.value,
                        "last_success": health.last_success.isoformat() if health.last_success else None,
                        "last_failure": health.last_failure.isoformat() if health.last_failure else None,
                        "consecutive_failures": health.consecutive_failures,
                        "avg_response_time_ms": health.avg_response_time_ms,
                        "is_critical": health.is_critical,
                        "recent_errors": self.error_context.get(name, [])[-3:]  # Last 3 errors
                    }
                    for name, health in self.service_health.items()
                },
                "fallback_cache_size": len(self.fallback_cache)
            }
            
        except Exception as e:
            logger.error(f"Error getting system health summary: {e}")
            return {"error": str(e), "timestamp": datetime.now().isoformat()}
    
    async def health_check(self) -> str:
        """Health check for the graceful degradation service"""
        try:
            fallback_level = await self.determine_fallback_level()
            
            if fallback_level == FallbackLevel.ERROR_RESPONSE:
                return "unhealthy - critical services failed"
            elif fallback_level == FallbackLevel.BASIC_RESPONSE:
                return "degraded - limited functionality"
            elif fallback_level == FallbackLevel.TRADITIONAL_ONLY:
                return "degraded - traditional sources only"
            elif fallback_level == FallbackLevel.PARTIAL_INTELLIGENCE:
                return "degraded - partial intelligence available"
            else:
                return "healthy"
                
        except Exception as e:
            return f"unhealthy - {str(e)}"

# Global graceful degradation service instance
graceful_degradation = GracefulDegradationService()