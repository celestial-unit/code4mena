"""
Database Service - Handles query logging and analytics
Ensures privacy compliance and audit trails
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncpg
import json
import hashlib

logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.db_pool = None
        
    async def initialize(self):
        """Initialize database connection and create tables"""
        try:
            logger.info("Initializing database service...")
            
            # Database connection parameters from environment
            import os
            database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/code4mena_legal")
            
            # Parse DATABASE_URL or use individual components
            if database_url.startswith("postgresql://"):
                # Use DATABASE_URL directly with asyncpg
                self.db_pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)
            else:
                # Fallback to individual parameters
                db_config = {
                    "host": os.getenv("POSTGRES_HOST", "postgres"),
                    "port": int(os.getenv("POSTGRES_PORT", "5432")),
                    "database": os.getenv("POSTGRES_DB", "code4mena_legal"),
                    "user": os.getenv("POSTGRES_USER", "postgres"),
                    "password": os.getenv("POSTGRES_PASSWORD", "postgres")
                }
                self.db_pool = await asyncpg.create_pool(**db_config, min_size=2, max_size=10)

            
            # Create tables
            await self._create_tables()
            
            logger.info("Database service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize database service: {e}")
            raise
    
    async def _create_tables(self):
        """Create necessary database tables"""
        async with self.db_pool.acquire() as conn:
            # Query logs table (privacy-compliant)
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS query_logs (
                    id UUID PRIMARY KEY,
                    original_query_hash VARCHAR(64) NOT NULL,
                    abstract_query TEXT NOT NULL,
                    user_id VARCHAR(100),
                    language VARCHAR(10) DEFAULT 'ar',
                    pii_detected JSONB,
                    response_generated BOOLEAN DEFAULT FALSE,
                    sources_count INTEGER DEFAULT 0,
                    error_message TEXT,
                    processing_time_ms INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Analytics table for popular queries
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS query_analytics (
                    id SERIAL PRIMARY KEY,
                    abstract_query_hash VARCHAR(64) NOT NULL,
                    abstract_query TEXT NOT NULL,
                    language VARCHAR(10),
                    category VARCHAR(100),
                    query_count INTEGER DEFAULT 1,
                    success_rate DECIMAL(5,2) DEFAULT 0.0,
                    avg_processing_time_ms INTEGER DEFAULT 0,
                    last_queried TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(abstract_query_hash, language)
                );
            """)
            
            # User feedback table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS user_feedback (
                    id SERIAL PRIMARY KEY,
                    query_id UUID REFERENCES query_logs(id),
                    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                    feedback_text TEXT,
                    helpful BOOLEAN,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # System metrics table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS system_metrics (
                    id SERIAL PRIMARY KEY,
                    metric_name VARCHAR(100) NOT NULL,
                    metric_value DECIMAL(10,2),
                    metric_data JSONB,
                    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Create indexes
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_query_logs_created_at 
                ON query_logs(created_at);
            """)
            
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_query_analytics_category 
                ON query_analytics(category);
            """)
            
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_query_analytics_query_count 
                ON query_analytics(query_count DESC);
            """)
    
    async def log_query(
        self,
        query_id: str,
        original_query_hash: int,
        abstract_query: str,
        user_id: Optional[str] = None,
        pii_detected: Dict = None,
        language: str = "ar"
    ) -> bool:
        """
        Log a new query (privacy-compliant)
        
        Args:
            query_id: Unique query identifier
            original_query_hash: Hash of original query (not the query itself)
            abstract_query: PII-stripped abstract query
            user_id: Anonymous user identifier
            pii_detected: Information about detected PII types
            language: Query language
            
        Returns:
            Success status
        """
        try:
            # Convert hash to string for storage
            query_hash_str = hashlib.sha256(str(original_query_hash).encode()).hexdigest()
            
            async with self.db_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO query_logs 
                    (id, original_query_hash, abstract_query, user_id, language, pii_detected)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """,
                query_id,
                query_hash_str,
                abstract_query,
                user_id,
                language,
                json.dumps(pii_detected) if pii_detected else None
                )
                
            logger.info(f"Query logged: {query_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error logging query: {e}")
            return False
    
    async def update_query_result(
        self,
        query_id: str,
        response_generated: bool,
        sources_count: int = 0,
        error_message: Optional[str] = None,
        processing_time_ms: Optional[int] = None
    ) -> bool:
        """Update query log with processing results"""
        try:
            async with self.db_pool.acquire() as conn:
                await conn.execute("""
                    UPDATE query_logs 
                    SET response_generated = $2,
                        sources_count = $3,
                        error_message = $4,
                        processing_time_ms = $5,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $1
                """,
                query_id,
                response_generated,
                sources_count,
                error_message,
                processing_time_ms
                )
                
            # Update analytics if successful
            if response_generated:
                await self._update_query_analytics(query_id, processing_time_ms)
                
            return True
            
        except Exception as e:
            logger.error(f"Error updating query result: {e}")
            return False
    
    async def _update_query_analytics(
        self, 
        query_id: str, 
        processing_time_ms: Optional[int] = None
    ):
        """Update analytics for successful queries"""
        try:
            async with self.db_pool.acquire() as conn:
                # Get query details
                query_data = await conn.fetchrow("""
                    SELECT abstract_query, language FROM query_logs WHERE id = $1
                """, query_id)
                
                if not query_data:
                    return
                
                abstract_query = query_data['abstract_query']
                language = query_data['language']
                
                # Create hash for analytics
                abstract_hash = hashlib.sha256(abstract_query.encode()).hexdigest()
                
                # Update or insert analytics record
                await conn.execute("""
                    INSERT INTO query_analytics 
                    (abstract_query_hash, abstract_query, language, query_count, 
                     avg_processing_time_ms, last_queried)
                    VALUES ($1, $2, $3, 1, $4, CURRENT_TIMESTAMP)
                    ON CONFLICT (abstract_query_hash, language)
                    DO UPDATE SET
                        query_count = query_analytics.query_count + 1,
                        avg_processing_time_ms = CASE 
                            WHEN $4 IS NOT NULL THEN 
                                (query_analytics.avg_processing_time_ms + $4) / 2
                            ELSE query_analytics.avg_processing_time_ms
                        END,
                        last_queried = CURRENT_TIMESTAMP
                """,
                abstract_hash,
                abstract_query,
                language,
                processing_time_ms
                )
                
        except Exception as e:
            logger.error(f"Error updating query analytics: {e}")
    
    async def get_popular_queries(
        self, 
        language: str = "ar", 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get popular anonymized queries for suggestions"""
        try:
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT 
                        abstract_query,
                        query_count,
                        success_rate,
                        avg_processing_time_ms,
                        last_queried
                    FROM query_analytics
                    WHERE language = $1 AND query_count >= 2
                    ORDER BY query_count DESC, last_queried DESC
                    LIMIT $2
                """, language, limit)
                
                popular_queries = []
                for row in rows:
                    popular_queries.append({
                        "query": row['abstract_query'],
                        "popularity": row['query_count'],
                        "success_rate": float(row['success_rate']) if row['success_rate'] else 0.0,
                        "avg_response_time": row['avg_processing_time_ms'],
                        "last_used": row['last_queried'].isoformat()
                    })
                
                return popular_queries
                
        except Exception as e:
            logger.error(f"Error getting popular queries: {e}")
            return []
    
    async def record_user_feedback(
        self,
        query_id: str,
        rating: int,
        feedback_text: Optional[str] = None,
        helpful: Optional[bool] = None
    ) -> bool:
        """Record user feedback for a query"""
        try:
            async with self.db_pool.acquire() as conn:
                await conn.execute("""
                    INSERT INTO user_feedback (query_id, rating, feedback_text, helpful)
                    VALUES ($1, $2, $3, $4)
                """,
                query_id,
                rating,
                feedback_text,
                helpful
                )
                
            logger.info(f"Feedback recorded for query: {query_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error recording feedback: {e}")
            return False
    
    async def get_system_analytics(
        self, 
        days: int = 7
    ) -> Dict[str, Any]:
        """Get system analytics for the specified period"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            async with self.db_pool.acquire() as conn:
                # Query statistics
                query_stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(*) as total_queries,
                        COUNT(*) FILTER (WHERE response_generated = true) as successful_queries,
                        AVG(processing_time_ms) as avg_processing_time,
                        COUNT(DISTINCT user_id) as unique_users
                    FROM query_logs
                    WHERE created_at >= $1
                """, start_date)
                
                # Language distribution
                language_stats = await conn.fetch("""
                    SELECT language, COUNT(*) as count
                    FROM query_logs
                    WHERE created_at >= $1
                    GROUP BY language
                    ORDER BY count DESC
                """, start_date)
                
                # Popular categories
                category_stats = await conn.fetch("""
                    SELECT category, query_count
                    FROM query_analytics
                    WHERE last_queried >= $1
                    ORDER BY query_count DESC
                    LIMIT 5
                """, start_date)
                
                # Feedback statistics
                feedback_stats = await conn.fetchrow("""
                    SELECT 
                        COUNT(*) as total_feedback,
                        AVG(rating) as avg_rating,
                        COUNT(*) FILTER (WHERE helpful = true) as helpful_count
                    FROM user_feedback uf
                    JOIN query_logs ql ON uf.query_id = ql.id
                    WHERE ql.created_at >= $1
                """, start_date)
                
                return {
                    "period_days": days,
                    "query_statistics": {
                        "total_queries": query_stats['total_queries'],
                        "successful_queries": query_stats['successful_queries'],
                        "success_rate": (
                            query_stats['successful_queries'] / query_stats['total_queries'] * 100
                            if query_stats['total_queries'] > 0 else 0
                        ),
                        "avg_processing_time_ms": float(query_stats['avg_processing_time']) if query_stats['avg_processing_time'] else 0,
                        "unique_users": query_stats['unique_users']
                    },
                    "language_distribution": [
                        {"language": row['language'], "count": row['count']}
                        for row in language_stats
                    ],
                    "popular_categories": [
                        {"category": row['category'], "queries": row['query_count']}
                        for row in category_stats
                    ],
                    "feedback_statistics": {
                        "total_feedback": feedback_stats['total_feedback'],
                        "average_rating": float(feedback_stats['avg_rating']) if feedback_stats['avg_rating'] else 0,
                        "helpful_responses": feedback_stats['helpful_count']
                    }
                }
                
        except Exception as e:
            logger.error(f"Error getting system analytics: {e}")
            return {}
    
    async def health_check(self) -> str:
        """Check database health"""
        try:
            if not self.db_pool:
                return "unhealthy - no connection pool"
            
            async with self.db_pool.acquire() as conn:
                # Test basic connectivity
                result = await conn.fetchval("SELECT 1")
                
                if result != 1:
                    return "unhealthy - connection test failed"
                
                # Check table existence
                tables = await conn.fetch("""
                    SELECT table_name FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                
                required_tables = {'query_logs', 'query_analytics', 'user_feedback', 'legal_documents'}
                existing_tables = {row['table_name'] for row in tables}
                
                if not required_tables.issubset(existing_tables):
                    missing = required_tables - existing_tables
                    return f"unhealthy - missing tables: {missing}"
                
                return "healthy"
                
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return f"unhealthy - {str(e)}"