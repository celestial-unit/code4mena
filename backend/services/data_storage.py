"""
Kanounji 2025 - Data Storage Service with Vector Integration
Handles storage and retrieval of all scraped legal intelligence data with embeddings

REVOLUTIONARY: Combines traditional database storage with vector embeddings
for advanced semantic search across all legal intelligence sources
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncpg
import json
import hashlib
from dataclasses import asdict

from scraping.government_social import SocialMediaPost
from scraping.marsad_integration import ParliamentarySession, MPActivity
from services.legal_intelligence import LegalSignal
from services.vector_storage import VectorStorageService

logger = logging.getLogger(__name__)

class DataStorageService:
    """
    Centralized storage service for all Kanounji 2025 scraped data
    Integrates with vector storage for semantic search capabilities
    """
    
    def __init__(self):
        self.db_pool = None
        self.vector_storage = VectorStorageService()
        
    async def initialize(self):
        """Initialize database connection pool and vector storage"""
        try:
            import os
            database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/code4mena_legal")
            
            self.db_pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)
            
            # Initialize vector storage
            await self.vector_storage.initialize()
            
            logger.info("Data storage service with vector integration initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize data storage service: {e}")
            return False
    
    async def store_legal_signal(self, signal: LegalSignal) -> bool:
        """
        Store a legal signal with vector embedding
        
        Args:
            signal: LegalSignal object to store
            
        Returns:
            True if stored successfully, False if duplicate or error
        """
        try:
            # Prepare signal data for vector storage
            signal_data = {
                'signal_id': signal.signal_id,
                'source_platform': signal.source,
                'source_account': signal.metadata.get('account', ''),
                'ministry': signal.metadata.get('ministry', ''),
                'content': signal.content,
                'legal_relevance_score': signal.legal_relevance_score,
                'detected_topics': signal.detected_topics,
                'signal_type': signal.signal_type,
                'language': signal.metadata.get('language', 'ar'),
                'urgency': signal.metadata.get('urgency', 'normal'),
                'metadata': signal.metadata,
                'timestamp': signal.timestamp
            }
            
            # Store with vector embedding
            success = await self.vector_storage.store_legal_signal_with_embedding(signal_data)
            
            if success:
                logger.info(f"Stored legal signal with embedding: {signal.signal_id}")
            
            return success
                
        except Exception as e:
            logger.error(f"Error storing legal signal: {e}")
            return False
    
    async def store_government_post(self, post: SocialMediaPost) -> bool:
        """
        Store government social media post with vector embedding
        
        Args:
            post: SocialMediaPost object to store
            
        Returns:
            True if stored successfully
        """
        try:
            # Prepare post data for vector storage
            post_data = {
                'ministry': post.ministry,
                'platform': post.platform,
                'account_name': post.account,
                'post_content': post.content,
                'post_url': post.url,
                'post_date': post.timestamp,
                'engagement_metrics': post.engagement,
                'legal_significance': len(post.legal_signals) * 2.0,  # Simple significance calculation
                'extracted_legal_info': {
                    'legal_signals': post.legal_signals,
                    'language': post.language
                }
            }
            
            # Store with vector embedding
            success = await self.vector_storage.store_government_post_with_embedding(post_data)
            
            if success:
                logger.info(f"Stored government post with embedding from {post.ministry} on {post.platform}")
            
            return success
                
        except Exception as e:
            logger.error(f"Error storing government post: {e}")
            return False
    
    async def store_parliamentary_session(self, session: ParliamentarySession) -> bool:
        """
        Store parliamentary session data with vector embedding
        
        Args:
            session: ParliamentarySession object to store
            
        Returns:
            True if stored successfully
        """
        try:
            # Prepare session data for vector storage
            session_data = {
                'session_id': session.session_id,
                'session_date': session.date,
                'session_type': session.session_type,
                'topics_discussed': session.topics,
                'mp_attendance': session.attendance,
                'voting_results': session.voting_results,
                'transcripts': session.transcripts,
                'marsad_url': session.marsad_url,
                'legal_significance': len(session.topics) * 1.5  # Simple significance calculation
            }
            
            # Store with vector embedding
            success = await self.vector_storage.store_parliamentary_session_with_embedding(session_data)
            
            if success:
                logger.info(f"Stored parliamentary session with embedding: {session.session_id}")
            
            return success
                
        except Exception as e:
            logger.error(f"Error storing parliamentary session: {e}")
            return False
    
    async def store_qanoun_document(self, document: Dict[str, Any]) -> bool:
        """
        Store 9anoun.tn legal document with vector embedding
        
        Args:
            document: Document data from 9anoun.tn scraper
            
        Returns:
            True if stored successfully
        """
        try:
            # Store with vector embedding
            success = await self.vector_storage.store_qanoun_document_with_embedding(document)
            
            if success:
                logger.info(f"Stored 9anoun document with embedding: {document.get('title', 'Unknown')[:50]}...")
            
            return success
                
        except Exception as e:
            logger.error(f"Error storing 9anoun document: {e}")
            return False
    
    async def store_mp_activity(self, mp_activity: MPActivity) -> bool:
        """
        Store MP activity data (no embedding needed for this table)
        
        Args:
            mp_activity: MPActivity object to store
            
        Returns:
            True if stored successfully
        """
        try:
            async with self.db_pool.acquire() as conn:
                # Upsert MP activity
                await conn.execute("""
                    INSERT INTO mp_activity 
                    (mp_id, mp_name, party, constituency, attendance_rate,
                     voting_record, questions_asked, interventions, last_activity)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (mp_id, mp_name) 
                    DO UPDATE SET
                        party = EXCLUDED.party,
                        constituency = EXCLUDED.constituency,
                        attendance_rate = EXCLUDED.attendance_rate,
                        voting_record = EXCLUDED.voting_record,
                        questions_asked = EXCLUDED.questions_asked,
                        interventions = EXCLUDED.interventions,
                        last_activity = EXCLUDED.last_activity,
                        updated_at = CURRENT_TIMESTAMP
                """,
                mp_activity.mp_id,
                mp_activity.mp_name,
                mp_activity.party,
                mp_activity.constituency,
                mp_activity.attendance_rate,
                json.dumps(mp_activity.voting_record),
                mp_activity.questions_asked,
                mp_activity.interventions,
                mp_activity.last_activity
                )
                
                logger.info(f"Stored MP activity: {mp_activity.mp_name}")
                return True
                
        except Exception as e:
            logger.error(f"Error storing MP activity: {e}")
            return False
    
    async def store_legal_prediction(self, prediction: Dict[str, Any]) -> bool:
        """
        Store legal prediction data (no embedding needed for this table)
        
        Args:
            prediction: Prediction data from legal intelligence engine
            
        Returns:
            True if stored successfully
        """
        try:
            async with self.db_pool.acquire() as conn:
                # Upsert prediction
                await conn.execute("""
                    INSERT INTO legal_predictions 
                    (prediction_id, law_title, law_category, passage_probability,
                     confidence_score, timeline_estimate, key_factors, risk_factors,
                     prediction_data)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (prediction_id)
                    DO UPDATE SET
                        passage_probability = EXCLUDED.passage_probability,
                        confidence_score = EXCLUDED.confidence_score,
                        timeline_estimate = EXCLUDED.timeline_estimate,
                        key_factors = EXCLUDED.key_factors,
                        risk_factors = EXCLUDED.risk_factors,
                        prediction_data = EXCLUDED.prediction_data,
                        updated_at = CURRENT_TIMESTAMP
                """,
                prediction.get('law_id', f"pred_{hash(prediction.get('title', ''))}"),
                prediction.get('title', ''),
                prediction.get('category', 'general'),
                prediction.get('passage_probability', 0.5),
                prediction.get('confidence', 0.5),
                prediction.get('timeline_estimate', 'unknown'),
                prediction.get('key_factors', []),
                prediction.get('risk_factors', []),
                json.dumps(prediction)
                )
                
                logger.info(f"Stored legal prediction: {prediction.get('title', 'Unknown')[:50]}...")
                return True
                
        except Exception as e:
            logger.error(f"Error storing legal prediction: {e}")
            return False
    
    async def store_intelligence_query(self, query_data: Dict[str, Any]) -> bool:
        """
        Store intelligence query for analytics (no embedding needed)
        
        Args:
            query_data: Query and response data
            
        Returns:
            True if stored successfully
        """
        try:
            async with self.db_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO intelligence_queries 
                    (query_id, original_query, sanitized_query, sources_used,
                     confidence_score, response_generated, processing_time_ms,
                     user_id, language)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """,
                query_data.get('query_id', ''),
                query_data.get('original_query', ''),
                query_data.get('sanitized_query', ''),
                json.dumps(query_data.get('sources_used', {})),
                query_data.get('confidence_score', 0.0),
                query_data.get('response_generated', False),
                query_data.get('processing_time_ms', 0),
                query_data.get('user_id', ''),
                query_data.get('language', 'ar')
                )
                
                logger.info(f"Stored intelligence query: {query_data.get('query_id', 'unknown')}")
                return True
                
        except Exception as e:
            logger.error(f"Error storing intelligence query: {e}")
            return False
    
    async def semantic_search(
        self, 
        query: str, 
        top_k: int = 10,
        source_filter: Optional[List[str]] = None,
        min_similarity: float = 0.3
    ) -> Dict[str, Any]:
        """
        Perform semantic search across all stored legal intelligence data
        
        Args:
            query: Search query
            top_k: Number of results per source
            source_filter: Optional list of sources to search
            min_similarity: Minimum similarity threshold
            
        Returns:
            Search results from vector storage
        """
        try:
            return await self.vector_storage.semantic_search_all_sources(
                query, top_k, source_filter, min_similarity
            )
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return {"query": query, "total_results": 0, "sources_searched": 0, "results": {}}
    
    async def get_recent_legal_signals(self, hours: int = 24, min_relevance: float = 2.0) -> List[Dict[str, Any]]:
        """
        Get recent legal signals with high relevance
        
        Args:
            hours: Number of hours to look back
            min_relevance: Minimum relevance score
            
        Returns:
            List of recent legal signals
        """
        try:
            cutoff_time = datetime.utcnow() - timedelta(hours=hours)
            
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT signal_id, source_platform, content, legal_relevance_score,
                           detected_topics, signal_type, urgency, timestamp
                    FROM legal_signals
                    WHERE timestamp >= $1 AND legal_relevance_score >= $2
                    ORDER BY legal_relevance_score DESC, timestamp DESC
                    LIMIT 50
                """, cutoff_time, min_relevance)
                
                return [dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Error getting recent legal signals: {e}")
            return []
    
    async def get_government_activity_summary(self, days: int = 7) -> Dict[str, Any]:
        """
        Get government social media activity summary
        
        Args:
            days: Number of days to analyze
            
        Returns:
            Activity summary by ministry and platform
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            async with self.db_pool.acquire() as conn:
                # Get activity by ministry
                ministry_activity = await conn.fetch("""
                    SELECT ministry, COUNT(*) as post_count,
                           AVG(legal_significance) as avg_significance
                    FROM government_social_posts
                    WHERE scraped_at >= $1
                    GROUP BY ministry
                    ORDER BY post_count DESC
                """, cutoff_date)
                
                # Get activity by platform
                platform_activity = await conn.fetch("""
                    SELECT platform, COUNT(*) as post_count
                    FROM government_social_posts
                    WHERE scraped_at >= $1
                    GROUP BY platform
                    ORDER BY post_count DESC
                """, cutoff_date)
                
                return {
                    "ministry_activity": [dict(row) for row in ministry_activity],
                    "platform_activity": [dict(row) for row in platform_activity],
                    "period_days": days,
                    "generated_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error getting government activity summary: {e}")
            return {}
    
    async def get_parliamentary_trends(self, days: int = 30) -> Dict[str, Any]:
        """
        Get parliamentary activity trends
        
        Args:
            days: Number of days to analyze
            
        Returns:
            Parliamentary trends and statistics
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            async with self.db_pool.acquire() as conn:
                # Get session activity
                session_activity = await conn.fetch("""
                    SELECT session_type, COUNT(*) as session_count,
                           AVG(legal_significance) as avg_significance
                    FROM parliamentary_activity
                    WHERE created_at >= $1
                    GROUP BY session_type
                    ORDER BY session_count DESC
                """, cutoff_date)
                
                # Get most discussed topics
                topic_trends = await conn.fetch("""
                    SELECT unnest(topics_discussed) as topic, COUNT(*) as mention_count
                    FROM parliamentary_activity
                    WHERE created_at >= $1 AND topics_discussed IS NOT NULL
                    GROUP BY topic
                    ORDER BY mention_count DESC
                    LIMIT 10
                """, cutoff_date)
                
                return {
                    "session_activity": [dict(row) for row in session_activity],
                    "trending_topics": [dict(row) for row in topic_trends],
                    "period_days": days,
                    "generated_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error getting parliamentary trends: {e}")
            return {}
    
    async def generate_missing_embeddings(self) -> Dict[str, int]:
        """
        Generate embeddings for all records that don't have them
        
        Returns:
            Dictionary with count of embeddings generated per table
        """
        try:
            return await self.vector_storage.generate_missing_embeddings()
        except Exception as e:
            logger.error(f"Error generating missing embeddings: {e}")
            return {}
    
    async def health_check(self) -> Dict[str, Any]:
        """Check data storage service health"""
        try:
            if not self.db_pool:
                return {"status": "unhealthy", "reason": "database not connected"}
            
            # Test database connection
            async with self.db_pool.acquire() as conn:
                # Check table counts
                table_counts = {}
                for table in ['legal_signals', 'government_social_posts', 'parliamentary_activity', 'qanoun_documents']:
                    try:
                        count = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
                        table_counts[table] = count
                    except Exception as e:
                        table_counts[table] = f"error: {e}"
            
            # Check vector storage health
            vector_health = await self.vector_storage.health_check()
            
            return {
                "status": "healthy",
                "database_tables": table_counts,
                "vector_storage": vector_health
            }
            
        except Exception as e:
            logger.error(f"Data storage health check failed: {e}")
            return {"status": "unhealthy", "reason": str(e)}