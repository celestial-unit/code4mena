"""
Legal RAG Service - Vector database search for Tunisian legal documents
Handles document indexing, embedding, and retrieval
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
import json
import numpy as np
from sentence_transformers import SentenceTransformer
import asyncpg
from pathlib import Path

logger = logging.getLogger(__name__)

class LegalRAGService:
    def __init__(self):
        self.embedding_model = None
        self.db_pool = None
        self.model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        self.embedding_dimension = 384
        
        # Legal document categories
        self.legal_categories = {
            "business_law": "قانون الأعمال",
            "civil_law": "القانون المدني", 
            "criminal_law": "القانون الجنائي",
            "administrative_law": "القانون الإداري",
            "labor_law": "قانون العمل",
            "tax_law": "القانون الضريبي",
            "family_law": "قانون الأسرة",
            "property_law": "قانون الملكية"
        }
    
    async def initialize(self):
        """Initialize embedding model and database connection"""
        try:
            logger.info("Initializing Legal RAG service...")
            
            # Load embedding model
            logger.info(f"Loading embedding model: {self.model_name}")
            self.embedding_model = SentenceTransformer(self.model_name)
            
            # Initialize database connection
            await self._init_database()
            
            # Load legal documents if database is empty
            await self._ensure_legal_documents_loaded()
            
            # Generate embeddings for documents that don't have them
            await self._generate_missing_embeddings()
            
            logger.info("Legal RAG service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Legal RAG service: {e}")
            raise
    
    async def _init_database(self):
        """Initialize PostgreSQL connection with pgvector"""
        try:
            # Database connection parameters from environment
            import os
            database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/code4mena_legal")
            
            # Create connection pool using DATABASE_URL
            self.db_pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)
            
            # Create tables and enable pgvector
            async with self.db_pool.acquire() as conn:
                # Enable pgvector extension
                await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                
                # Create legal documents table
                await conn.execute("""
                    CREATE TABLE IF NOT EXISTS legal_documents (
                        id SERIAL PRIMARY KEY,
                        article_number VARCHAR(50) NOT NULL,
                        title TEXT NOT NULL,
                        content TEXT NOT NULL,
                        category VARCHAR(100),
                        source_document VARCHAR(200),
                        official_url TEXT,
                        language VARCHAR(10) DEFAULT 'ar',
                        embedding vector(384),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
                
                # Create index for vector similarity search
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS legal_documents_embedding_idx 
                    ON legal_documents USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100);
                """)
                
                # Create text search index
                await conn.execute("""
                    CREATE INDEX IF NOT EXISTS legal_documents_content_idx 
                    ON legal_documents USING gin(to_tsvector('arabic', content));
                """)
                
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    async def _ensure_legal_documents_loaded(self):
        """Load legal documents if database is empty"""
        try:
            async with self.db_pool.acquire() as conn:
                # Check if documents exist
                count = await conn.fetchval("SELECT COUNT(*) FROM legal_documents")
                
                if count == 0:
                    logger.info("Loading sample legal documents...")
                    await self._load_sample_documents()
                else:
                    logger.info(f"Found {count} legal documents in database")
                    
        except Exception as e:
            logger.error(f"Error checking legal documents: {e}")
    
    async def _load_sample_documents(self):
        """Load sample Tunisian legal documents"""
        sample_documents = [
            {
                "article_number": "المادة 1",
                "title": "تأسيس الشركات التجارية",
                "content": "يجب على كل من يرغب في تأسيس شركة تجارية أن يقدم طلباً إلى السجل التجاري مرفقاً بالوثائق المطلوبة وهي: عقد التأسيس، رأس المال المطلوب، هوية المؤسسين، عنوان المقر الاجتماعي.",
                "category": "business_law",
                "source_document": "مجلة الشركات التجارية",
                "official_url": "https://legislation.tn/business-law/article-1",
                "language": "ar"
            },
            {
                "article_number": "المادة 15",
                "title": "رخص المؤسسات الغذائية",
                "content": "تخضع المؤسسات التي تمارس أنشطة تحضير أو بيع المواد الغذائية لترخيص مسبق من وزارة الصحة. يجب تقديم شهادة صحية، خطة المحل، وشهادة تكوين في النظافة الغذائية.",
                "category": "administrative_law",
                "source_document": "قانون سلامة الغذاء",
                "official_url": "https://legislation.tn/food-safety/article-15",
                "language": "ar"
            },
            {
                "article_number": "المادة 8",
                "title": "عقود العمل",
                "content": "يجب أن يكون عقد العمل مكتوباً ويتضمن: هوية الطرفين، طبيعة العمل، مدة العقد، الأجر، ساعات العمل، مكان العمل. يحق للعامل الحصول على نسخة من العقد.",
                "category": "labor_law",
                "source_document": "مجلة الشغل",
                "official_url": "https://legislation.tn/labor-law/article-8",
                "language": "ar"
            },
            {
                "article_number": "المادة 22",
                "title": "الضرائب على الدخل",
                "content": "يخضع كل شخص طبيعي أو معنوي يحقق دخلاً في تونس لضريبة على الدخل. المعدلات تتراوح من 0% إلى 35% حسب شرائح الدخل المحددة في القانون.",
                "category": "tax_law",
                "source_document": "مجلة الضرائب",
                "official_url": "https://legislation.tn/tax-law/article-22",
                "language": "ar"
            },
            {
                "article_number": "المادة 5",
                "title": "حقوق الملكية العقارية",
                "content": "يثبت حق الملكية العقارية بالرسم العقاري المسجل لدى إدارة أملاك الدولة. يجب تسجيل كل عملية بيع أو شراء عقار خلال 30 يوماً من تاريخ العقد.",
                "category": "property_law",
                "source_document": "مجلة الحقوق العينية",
                "official_url": "https://legislation.tn/property-law/article-5",
                "language": "ar"
            }
        ]
        
        for doc in sample_documents:
            await self.add_legal_document(doc)
        
        logger.info(f"Loaded {len(sample_documents)} sample legal documents")
    
    async def _generate_missing_embeddings(self):
        """Generate embeddings for documents that don't have them"""
        try:
            async with self.db_pool.acquire() as conn:
                # Find documents without embeddings
                rows = await conn.fetch("""
                    SELECT id, content FROM legal_documents 
                    WHERE embedding IS NULL
                """)
                
                if not rows:
                    logger.info("All documents already have embeddings")
                    return
                
                logger.info(f"Generating embeddings for {len(rows)} documents...")
                
                for row in rows:
                    doc_id = row['id']
                    content = row['content']
                    
                    # Generate embedding
                    embedding = self.embedding_model.encode(content)
                    embedding_list = embedding.tolist()
                    embedding_str = '[' + ','.join(map(str, embedding_list)) + ']'
                    
                    # Update document with embedding
                    await conn.execute("""
                        UPDATE legal_documents 
                        SET embedding = $1::vector 
                        WHERE id = $2
                    """, embedding_str, doc_id)
                    
                    logger.info(f"Generated embedding for document ID {doc_id}")
                
                logger.info(f"Successfully generated embeddings for {len(rows)} documents")
                
        except Exception as e:
            logger.error(f"Error generating missing embeddings: {e}")
            raise
    
    async def add_legal_document(self, document: Dict[str, Any]) -> int:
        """Add a legal document to the vector database"""
        try:
            # Generate embedding for the document content
            embedding = self.embedding_model.encode(document["content"])
            embedding_list = embedding.tolist()
            
            # Convert embedding to string format for PostgreSQL vector type
            embedding_str = '[' + ','.join(map(str, embedding_list)) + ']'
            
            async with self.db_pool.acquire() as conn:
                doc_id = await conn.fetchval("""
                    INSERT INTO legal_documents 
                    (article_number, title, content, category, source_document, official_url, language, embedding)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector)
                    RETURNING id
                """, 
                document["article_number"],
                document["title"],
                document["content"],
                document["category"],
                document["source_document"],
                document.get("official_url", ""),
                document.get("language", "ar"),
                embedding_str
                )
                
            logger.info(f"Added legal document: {document['article_number']}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding legal document: {e}")
            raise
    
    async def search_legal_documents(
        self, 
        query: str, 
        language: str = "ar", 
        top_k: int = 5,
        category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant legal documents using vector similarity
        
        Args:
            query: Search query (already PII-filtered)
            language: Response language
            top_k: Number of results to return
            category: Optional category filter
            
        Returns:
            List of relevant legal documents with similarity scores
        """
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query)
            query_embedding_list = query_embedding.tolist()
            
            # Build SQL query with proper vector format
            sql_query = """
                SELECT 
                    id,
                    article_number,
                    title,
                    content,
                    category,
                    source_document,
                    official_url,
                    language,
                    1 - (embedding <=> $1::vector) as similarity_score
                FROM legal_documents
                WHERE language = $2
            """
            
            # Convert embedding to string format for PostgreSQL vector type
            embedding_str = '[' + ','.join(map(str, query_embedding_list)) + ']'
            params = [embedding_str, language]
            
            # Add category filter if specified
            if category:
                sql_query += " AND category = $3"
                params.append(category)
                sql_query += " ORDER BY embedding <=> $1 LIMIT $4"
                params.append(top_k)
            else:
                sql_query += " ORDER BY embedding <=> $1 LIMIT $3"
                params.append(top_k)
            
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch(sql_query, *params)
                
                results = []
                for row in rows:
                    results.append({
                        "id": row["id"],
                        "article_number": row["article_number"],
                        "title": row["title"],
                        "content": row["content"],
                        "category": row["category"],
                        "source_document": row["source_document"],
                        "official_url": row["official_url"],
                        "language": row["language"],
                        "score": float(row["similarity_score"])
                    })
                
                logger.info(f"Found {len(results)} relevant legal documents")
                return results
                
        except Exception as e:
            logger.error(f"Error searching legal documents: {e}")
            return []
    
    async def get_available_categories(self) -> Dict[str, Any]:
        """Get available legal categories and document counts"""
        try:
            async with self.db_pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT category, COUNT(*) as document_count
                    FROM legal_documents
                    GROUP BY category
                    ORDER BY document_count DESC
                """)
                
                categories = {}
                for row in rows:
                    category_key = row["category"]
                    categories[category_key] = {
                        "name_ar": self.legal_categories.get(category_key, category_key),
                        "name_en": category_key.replace("_", " ").title(),
                        "document_count": row["document_count"]
                    }
                
                return {
                    "categories": categories,
                    "total_documents": sum(cat["document_count"] for cat in categories.values())
                }
                
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            return {"categories": {}, "total_documents": 0}
    
    async def health_check(self) -> str:
        """Check if the Legal RAG service is healthy"""
        try:
            if not self.embedding_model:
                return "unhealthy - embedding model not loaded"
            
            if not self.db_pool:
                return "unhealthy - database not connected"
            
            # Test database connection
            async with self.db_pool.acquire() as conn:
                count = await conn.fetchval("SELECT COUNT(*) FROM legal_documents")
                
            if count == 0:
                return "unhealthy - no legal documents loaded"
            
            # Test embedding generation
            test_embedding = self.embedding_model.encode("test query")
            
            if len(test_embedding) != self.embedding_dimension:
                return "unhealthy - embedding dimension mismatch"
            
            return "healthy"
            
        except Exception as e:
            logger.error(f"Legal RAG health check failed: {e}")
            return f"unhealthy - {str(e)}"