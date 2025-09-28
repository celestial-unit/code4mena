"""
Kanounji 2025 - Enhanced Vector Storage Service
Handles vector embeddings and semantic search for ALL scraped legal intelligence data

REVOLUTIONARY: Stores embeddings for government posts, parliamentary sessions, 
9anoun documents, and legal signals for advanced semantic search capabilities
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
import asyncpg
import json
import hashlib
from sentence_transformers import SentenceTransformer
import numpy as np

logger = logging.getLogger(__name__)

class VectorStorageService:
    """
    Advanced vector storage service for Kanounji 2025
    Provides semantic search across all legal intelligence sources
    """
    
    def __init__(self):
        self.db_pool = None
        self.embedding_model = None
        self.model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        self.embedding_dimension = 384
        
    async def initialize(self):
        """Initialize database connection and embedding model"""
        try:
            # Load embedding model
            logger.info(f"Loading embedding model: {self.model_name}")
            self.embedding_model = SentenceTransformer(self.model_name)
            
            # Initialize database connection
            import os
            database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/code4mena_legal")
            
            self.db_pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)
            
            # Ensure pgvector extension is enabled
            async with self.db_pool.acquire() as conn:
                await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            
            logger.info("Vector storage service initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize vector storage service: {e}")
            return False
    
    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text content"""
        try:
            embedding = self.embedding_model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return [0.0] * self.embedding_dimension
    
    def _embedding_to_pgvector(self, embedding: List[float]) -> str:
        """Convert embedding list to PostgreSQL vector format"""
        return '[' + ','.join(map(str, embedding)) + ']'
    
    async def store_legal_signal_with_embedding(self, signal_data: Dict[str, Any]) -> bool:
        """
        Store legal signal with vector embedding
        
        Args:
            signal_data: Legal signal data including content
            
        Returns:
            True if stored successfully
        """
        try:
            content = signal_data.get('content', '')
            content_hash = hashlib.md5(content.encode()).hexdigest()
            
            # Generate embedding
            embedding = self._generate_embedding(content)
            embedding_str = self._embedding_to_pgvector(embedding)
            
            async with self.db_pool.acquire() as conn:
                # Check for duplicate
                existing = await conn.fetchval(
                    "SELECT id FROM legal_signals WHERE content_hash = $1",
                    content_hash
                )
                
                if existing:
                    logger.debug(f"Duplicate legal signal detected, skipping")
                    return False
                
                # Insert new signal with embedding
                await conn.execute("""
                    INSERT INTO legal_signals 
                    (signal_id, source_platform, source_account, ministry, content, 
                     content_hash, legal_relevance_score, detected_topics, signal_type, 
                     language, urgency, metadata, timestamp, embedding)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14::vector)
                """,
                signal_data.get('signal_id', ''),
                signal_data.get('source_platform', ''),
                signal_data.get('source_account', ''),
                signal_data.get('ministry', ''),
                content,
                content_hash,
                signal_data.get('legal_relevance_score', 0.0),
                signal_data.get('detected_topics', []),
                signal_data.get('signal_type', ''),
                signal_data.get('language', 'ar'),
                signal_data.get('urgency', 'normal'),
                json.dumps(signal_data.get('metadata', {})),
                signal_data.get('timestamp', datetime.utcnow()),
                embedding_str
                )
                
                logger.info(f"Stored legal signal with embedding: {signal_data.get('signal_id', 'unknown')}")
                return True
                
        except Exception as e:
            logger.error(f"Error storing legal signal with embedding: {e}")
            return False
    
    async def store_government_post_with_embedding(self, post_data: Dict[str, Any]) -> bool:
        """
        Store government social media post with vector embedding
        
        Args:
            post_data: Government post data
            
        Returns:
            True if stored successfully
        """
        try:
            content = post_data.get('post_content', '')
            content_hash = hashlib.md5(content.encode()).hexdigest()
            
            # Generate embedding
            embedding = self._generate_embedding(content)
            embedding_str = self._embedding_to_pgvector(embedding)
            
            async with self.db_pool.acquire() as conn:
                # Check for duplicate
                existing = await conn.fetchval(
                    "SELECT id FROM government_social_posts WHERE content_hash = $1",
                    content_hash
                )
                
                if existing:
                    logger.debug(f"Duplicate government post detected, skipping")
                    return False
                
                # Insert new post with embedding
                await conn.execute("""
                    INSERT INTO government_social_posts 
                    (ministry, platform, account_name, post_content, post_url,
                     post_date, engagement_metrics, legal_significance, 
                     extracted_legal_info, content_hash, embedding)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::vector)
                """,
                post_data.get('ministry', ''),
                post_data.get('platform', ''),
                post_data.get('account_name', ''),
                content,
                post_data.get('post_url', ''),
                post_data.get('post_date', datetime.utcnow()),
                json.dumps(post_data.get('engagement_metrics', {})),
                post_data.get('legal_significance', 0.0),
                json.dumps(post_data.get('extracted_legal_info', {})),
                content_hash,
                embedding_str
                )
                
                logger.info(f"Stored government post with embedding from {post_data.get('ministry', 'unknown')}")
                return True
                
        except Exception as e:
            logger.error(f"Error storing government post with embedding: {e}")
            return False
    
    async def store_parliamentary_session_with_embedding(self, session_data: Dict[str, Any]) -> bool:
        """
        Store parliamentary session with vector embedding
        
        Args:
            session_data: Parliamentary session data
            
        Returns:
            True if stored successfully
        """
        try:
            # Combine topics and transcripts for embedding
            content_parts = []
            if session_data.get('topics_discussed'):
                content_parts.extend(session_data['topics_discussed'])
            if session_data.get('transcripts'):
                content_parts.append(session_data['transcripts'])
            
            content = ' '.join(content_parts)
            
            # Generate embedding
            embedding = self._generate_embedding(content)
            embedding_str = self._embedding_to_pgvector(embedding)
            
            async with self.db_pool.acquire() as conn:
                # Upsert session with embedding
                await conn.execute("""
                    INSERT INTO parliamentary_activity 
                    (session_id, session_date, session_type, topics_discussed,
                     mp_attendance, voting_results, transcripts, marsad_url,
                     legal_significance, embedding)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector)
                    ON CONFLICT (session_id)
                    DO UPDATE SET
                        topics_discussed = EXCLUDED.topics_discussed,
                        mp_attendance = EXCLUDED.mp_attendance,
                        voting_results = EXCLUDED.voting_results,
                        transcripts = EXCLUDED.transcripts,
                        marsad_url = EXCLUDED.marsad_url,
                        legal_significance = EXCLUDED.legal_significance,
                        embedding = EXCLUDED.embedding,
                        updated_at = CURRENT_TIMESTAMP
                """,
                session_data.get('session_id', ''),
                session_data.get('session_date', datetime.utcnow().date()),
                session_data.get('session_type', ''),
                session_data.get('topics_discussed', []),
                json.dumps(session_data.get('mp_attendance', {})),
                json.dumps(session_data.get('voting_results', {})),
                session_data.get('transcripts', ''),
                session_data.get('marsad_url', ''),
                session_data.get('legal_significance', 0.0),
                embedding_str
                )
                
                logger.info(f"Stored parliamentary session with embedding: {session_data.get('session_id', 'unknown')}")
                return True
                
        except Exception as e:
            logger.error(f"Error storing parliamentary session with embedding: {e}")
            return False
    
    async def store_qanoun_document_with_embedding(self, document_data: Dict[str, Any]) -> bool:
        """
        Store 9anoun.tn document with vector embedding
        
        Args:
            document_data: Document data from 9anoun.tn
            
        Returns:
            True if stored successfully
        """
        try:
            # Combine title, summary, and content for embedding
            content_parts = []
            if document_data.get('title'):
                content_parts.append(document_data['title'])
            if document_data.get('summary'):
                content_parts.append(document_data['summary'])
            if document_data.get('full_content'):
                content_parts.append(document_data['full_content'])
            
            content = ' '.join(content_parts)
            content_hash = hashlib.md5(content.encode()).hexdigest()
            
            # Generate embedding
            embedding = self._generate_embedding(content)
            embedding_str = self._embedding_to_pgvector(embedding)
            
            async with self.db_pool.acquire() as conn:
                # Check for duplicate
                existing = await conn.fetchval(
                    "SELECT id FROM qanoun_documents WHERE content_hash = $1",
                    content_hash
                )
                
                if existing:
                    logger.debug(f"Duplicate 9anoun document detected, skipping")
                    return False
                
                # Parse publication date
                pub_date = None
                if document_data.get('publication_date'):
                    try:
                        if isinstance(document_data['publication_date'], str):
                            pub_date = datetime.fromisoformat(document_data['publication_date']).date()
                        else:
                            pub_date = document_data['publication_date']
                    except:
                        pub_date = None
                
                # Insert new document with embedding
                await conn.execute("""
                    INSERT INTO qanoun_documents 
                    (document_id, title, summary, full_content, document_url, 
                     document_type, legal_category, legal_reference, 
                     publication_date, source_section, content_hash, embedding)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::vector)
                """,
                document_data.get('document_id', f"qanoun_{hash(content)}"),
                document_data.get('title', ''),
                document_data.get('summary', ''),
                document_data.get('full_content', ''),
                document_data.get('document_url', ''),
                document_data.get('document_type', 'other'),
                document_data.get('legal_category', 'general'),
                document_data.get('legal_reference', ''),
                pub_date,
                document_data.get('source_section', ''),
                content_hash,
                embedding_str
                )
                
                logger.info(f"Stored 9anoun document with embedding: {document_data.get('title', 'Unknown')[:50]}...")
                return True
                
        except Exception as e:
            logger.error(f"Error storing 9anoun document with embedding: {e}")
            return False
    
    async def semantic_search_all_sources(
        self, 
        query: str, 
        top_k: int = 10,
        source_filter: Optional[List[str]] = None,
        min_similarity: float = 0.3
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Perform semantic search across all legal intelligence sources
        
        Args:
            query: Search query
            top_k: Number of results per source
            source_filter: Optional list of sources to search ['legal_signals', 'government_posts', 'parliamentary', 'qanoun']
            min_similarity: Minimum similarity threshold
            
        Returns:
            Dictionary with results from each source
        """
        try:
            # Generate query embedding
            query_embedding = self._generate_embedding(query)
            embedding_str = self._embedding_to_pgvector(query_embedding)
            
            results = {}
            
            # Define sources to search
            sources = source_filter or ['legal_signals', 'government_posts', 'parliamentary', 'qanoun']
            
            async with self.db_pool.acquire() as conn:
                
                # Search legal signals
                if 'legal_signals' in sources:
                    signal_results = await conn.fetch("""
                        SELECT signal_id, source_platform, content, legal_relevance_score,
                               detected_topics, signal_type, urgency, timestamp,
                               1 - (embedding <=> $1::vector) as similarity_score
                        FROM legal_signals
                        WHERE embedding IS NOT NULL 
                        AND 1 - (embedding <=> $1::vector) >= $2
                        ORDER BY embedding <=> $1::vector
                        LIMIT $3
                    """, embedding_str, min_similarity, top_k)
                    
                    results['legal_signals'] = [
                        {
                            "signal_id": row["signal_id"],
                            "source": row["source_platform"],
                            "content": row["content"][:200] + "..." if len(row["content"]) > 200 else row["content"],
                            "relevance_score": float(row["legal_relevance_score"]),
                            "topics": row["detected_topics"],
                            "type": row["signal_type"],
                            "urgency": row["urgency"],
                            "timestamp": row["timestamp"].isoformat(),
                            "similarity": float(row["similarity_score"])
                        }
                        for row in signal_results
                    ]
                
                # Search government posts
                if 'government_posts' in sources:
                    gov_results = await conn.fetch("""
                        SELECT ministry, platform, post_content, legal_significance,
                               post_date, account_name,
                               1 - (embedding <=> $1::vector) as similarity_score
                        FROM government_social_posts
                        WHERE embedding IS NOT NULL 
                        AND 1 - (embedding <=> $1::vector) >= $2
                        ORDER BY embedding <=> $1::vector
                        LIMIT $3
                    """, embedding_str, min_similarity, top_k)
                    
                    results['government_posts'] = [
                        {
                            "ministry": row["ministry"],
                            "platform": row["platform"],
                            "account": row["account_name"],
                            "content": row["post_content"][:200] + "..." if len(row["post_content"]) > 200 else row["post_content"],
                            "significance": float(row["legal_significance"]),
                            "date": row["post_date"].isoformat() if row["post_date"] else None,
                            "similarity": float(row["similarity_score"])
                        }
                        for row in gov_results
                    ]
                
                # Search parliamentary activity
                if 'parliamentary' in sources:
                    parl_results = await conn.fetch("""
                        SELECT session_id, session_date, session_type, topics_discussed,
                               legal_significance, marsad_url,
                               1 - (embedding <=> $1::vector) as similarity_score
                        FROM parliamentary_activity
                        WHERE embedding IS NOT NULL 
                        AND 1 - (embedding <=> $1::vector) >= $2
                        ORDER BY embedding <=> $1::vector
                        LIMIT $3
                    """, embedding_str, min_similarity, top_k)
                    
                    results['parliamentary'] = [
                        {
                            "session_id": row["session_id"],
                            "date": row["session_date"].isoformat(),
                            "type": row["session_type"],
                            "topics": row["topics_discussed"],
                            "significance": float(row["legal_significance"]),
                            "url": row["marsad_url"],
                            "similarity": float(row["similarity_score"])
                        }
                        for row in parl_results
                    ]
                
                # Search 9anoun documents
                if 'qanoun' in sources:
                    qanoun_results = await conn.fetch("""
                        SELECT document_id, title, summary, document_type, 
                               legal_category, document_url, publication_date,
                               1 - (embedding <=> $1::vector) as similarity_score
                        FROM qanoun_documents
                        WHERE embedding IS NOT NULL 
                        AND 1 - (embedding <=> $1::vector) >= $2
                        ORDER BY embedding <=> $1::vector
                        LIMIT $3
                    """, embedding_str, min_similarity, top_k)
                    
                    results['qanoun'] = [
                        {
                            "document_id": row["document_id"],
                            "title": row["title"],
                            "summary": row["summary"][:200] + "..." if row["summary"] and len(row["summary"]) > 200 else row["summary"],
                            "type": row["document_type"],
                            "category": row["legal_category"],
                            "url": row["document_url"],
                            "date": row["publication_date"].isoformat() if row["publication_date"] else None,
                            "similarity": float(row["similarity_score"])
                        }
                        for row in qanoun_results
                    ]
            
            # Calculate total results
            total_results = sum(len(source_results) for source_results in results.values())
            
            logger.info(f"Semantic search completed: {total_results} results across {len(results)} sources")
            
            return {
                "query": query,
                "total_results": total_results,
                "sources_searched": len(results),
                "results": results,
                "search_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return {"query": query, "total_results": 0, "sources_searched": 0, "results": {}}
    
    async def get_similar_content(
        self, 
        content: str, 
        source_table: str, 
        top_k: int = 5,
        exclude_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Find similar content within a specific source table
        
        Args:
            content: Content to find similar items for
            source_table: Table to search ('legal_signals', 'government_social_posts', etc.)
            top_k: Number of similar items to return
            exclude_id: Optional ID to exclude from results
            
        Returns:
            List of similar content items
        """
        try:
            # Generate embedding for input content
            content_embedding = self._generate_embedding(content)
            embedding_str = self._embedding_to_pgvector(content_embedding)
            
            # Define table-specific queries
            table_queries = {
                'legal_signals': """
                    SELECT signal_id, content, legal_relevance_score, detected_topics,
                           1 - (embedding <=> $1::vector) as similarity_score
                    FROM legal_signals
                    WHERE embedding IS NOT NULL AND signal_id != COALESCE($2, '')
                    ORDER BY embedding <=> $1::vector
                    LIMIT $3
                """,
                'government_social_posts': """
                    SELECT ministry, platform, post_content, legal_significance,
                           1 - (embedding <=> $1::vector) as similarity_score
                    FROM government_social_posts
                    WHERE embedding IS NOT NULL AND id::text != COALESCE($2, '')
                    ORDER BY embedding <=> $1::vector
                    LIMIT $3
                """,
                'parliamentary_activity': """
                    SELECT session_id, topics_discussed, legal_significance,
                           1 - (embedding <=> $1::vector) as similarity_score
                    FROM parliamentary_activity
                    WHERE embedding IS NOT NULL AND session_id != COALESCE($2, '')
                    ORDER BY embedding <=> $1::vector
                    LIMIT $3
                """,
                'qanoun_documents': """
                    SELECT document_id, title, summary, legal_category,
                           1 - (embedding <=> $1::vector) as similarity_score
                    FROM qanoun_documents
                    WHERE embedding IS NOT NULL AND document_id != COALESCE($2, '')
                    ORDER BY embedding <=> $1::vector
                    LIMIT $3
                """
            }
            
            if source_table not in table_queries:
                logger.error(f"Unknown source table: {source_table}")
                return []
            
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch(
                    table_queries[source_table],
                    embedding_str,
                    exclude_id or '',
                    top_k
                )
                
                return [dict(row) for row in rows]
                
        except Exception as e:
            logger.error(f"Error finding similar content: {e}")
            return []
    
    async def generate_missing_embeddings(self) -> Dict[str, int]:
        """
        Generate embeddings for all records that don't have them
        
        Returns:
            Dictionary with count of embeddings generated per table
        """
        try:
            results = {}
            
            # Tables to process
            tables = {
                'legal_signals': 'content',
                'government_social_posts': 'post_content',
                'parliamentary_activity': 'transcripts',
                'qanoun_documents': 'title'  # We'll combine title + summary + content
            }
            
            async with self.db_pool.acquire() as conn:
                for table, content_column in tables.items():
                    
                    if table == 'qanoun_documents':
                        # Special handling for qanoun documents
                        rows = await conn.fetch(f"""
                            SELECT id, title, summary, full_content 
                            FROM {table} 
                            WHERE embedding IS NULL
                        """)
                        
                        count = 0
                        for row in rows:
                            # Combine title, summary, and content
                            content_parts = []
                            if row['title']:
                                content_parts.append(row['title'])
                            if row['summary']:
                                content_parts.append(row['summary'])
                            if row['full_content']:
                                content_parts.append(row['full_content'])
                            
                            content = ' '.join(content_parts)
                            
                            if content.strip():
                                embedding = self._generate_embedding(content)
                                embedding_str = self._embedding_to_pgvector(embedding)
                                
                                await conn.execute(f"""
                                    UPDATE {table} 
                                    SET embedding = $1::vector 
                                    WHERE id = $2
                                """, embedding_str, row['id'])
                                
                                count += 1
                    
                    else:
                        # Standard handling for other tables
                        rows = await conn.fetch(f"""
                            SELECT id, {content_column} 
                            FROM {table} 
                            WHERE embedding IS NULL AND {content_column} IS NOT NULL
                        """)
                        
                        count = 0
                        for row in rows:
                            content = row[content_column]
                            
                            if content and content.strip():
                                embedding = self._generate_embedding(content)
                                embedding_str = self._embedding_to_pgvector(embedding)
                                
                                await conn.execute(f"""
                                    UPDATE {table} 
                                    SET embedding = $1::vector 
                                    WHERE id = $2
                                """, embedding_str, row['id'])
                                
                                count += 1
                    
                    results[table] = count
                    logger.info(f"Generated {count} embeddings for {table}")
            
            total_generated = sum(results.values())
            logger.info(f"Total embeddings generated: {total_generated}")
            
            return results
            
        except Exception as e:
            logger.error(f"Error generating missing embeddings: {e}")
            return {}
    
    async def health_check(self) -> Dict[str, Any]:
        """Check vector storage service health"""
        try:
            if not self.embedding_model:
                return {"status": "unhealthy", "reason": "embedding model not loaded"}
            
            if not self.db_pool:
                return {"status": "unhealthy", "reason": "database not connected"}
            
            # Test embedding generation
            test_embedding = self._generate_embedding("test query")
            if len(test_embedding) != self.embedding_dimension:
                return {"status": "unhealthy", "reason": "embedding dimension mismatch"}
            
            # Check database tables and embedding counts
            async with self.db_pool.acquire() as conn:
                tables_status = {}
                
                for table in ['legal_signals', 'government_social_posts', 'parliamentary_activity', 'qanoun_documents']:
                    try:
                        total_count = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
                        embedding_count = await conn.fetchval(f"SELECT COUNT(*) FROM {table} WHERE embedding IS NOT NULL")
                        
                        tables_status[table] = {
                            "total_records": total_count,
                            "with_embeddings": embedding_count,
                            "embedding_coverage": f"{(embedding_count/total_count*100):.1f}%" if total_count > 0 else "0%"
                        }
                    except Exception as e:
                        tables_status[table] = {"error": str(e)}
            
            return {
                "status": "healthy",
                "embedding_model": self.model_name,
                "embedding_dimension": self.embedding_dimension,
                "tables_status": tables_status
            }
            
        except Exception as e:
            logger.error(f"Vector storage health check failed: {e}")
            return {"status": "unhealthy", "reason": str(e)}