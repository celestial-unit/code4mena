#!/usr/bin/env python3
"""
Script to load scraped Tunisian legal documents into the Legal RAG system
"""

import asyncio
import json
import logging
from pathlib import Path
import asyncpg
from sentence_transformers import SentenceTransformer
import os
import sys

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LegalDataLoader:
    def __init__(self):
        self.embedding_model = None
        self.db_pool = None
        self.model_name = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        
        # Map document names to categories
        self.document_categories = {
            "المجلة التجارية.json": "business_law",
            "مجلة التجارة البحرية.json": "business_law", 
            "مجلة الجماعات المحلية.json": "administrative_law",
            "مجلة الديوانة.json": "administrative_law",
            "مشروع دستور الجمهورية التونسية 2022 (صيغة محيّنة).json": "constitutional_law"
        }
        
        # Map document names to readable titles
        self.document_titles = {
            "المجلة التجارية.json": "مجلة الشركات التجارية",
            "مجلة التجارة البحرية.json": "مجلة التجارة البحرية",
            "مجلة الجماعات المحلية.json": "مجلة الجماعات المحلية", 
            "مجلة الديوانة.json": "مجلة الديوانة",
            "مشروع دستور الجمهورية التونسية 2022 (صيغة محيّنة).json": "مشروع دستور الجمهورية التونسية 2022"
        }
    
    async def initialize(self):
        """Initialize embedding model and database connection"""
        try:
            logger.info("Initializing Legal Data Loader...")
            
            # Load embedding model
            logger.info(f"Loading embedding model: {self.model_name}")
            self.embedding_model = SentenceTransformer(self.model_name)
            
            # Initialize database connection
            database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5433/code4mena_legal")
            self.db_pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)
            
            logger.info("Legal Data Loader initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Legal Data Loader: {e}")
            raise
    
    async def load_json_file(self, file_path: Path) -> int:
        """Load a single JSON file containing legal documents"""
        try:
            logger.info(f"Loading legal documents from: {file_path.name}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                documents = json.load(f)
            
            if not isinstance(documents, list):
                logger.error(f"Expected list of documents in {file_path.name}")
                return 0
            
            category = self.document_categories.get(file_path.name, "general_law")
            source_document = self.document_titles.get(file_path.name, file_path.stem)
            
            loaded_count = 0
            
            for doc in documents:
                try:
                    # Extract article number from URL or use page number
                    article_number = self._extract_article_number(doc.get('url', ''), doc.get('page_number', doc.get('id', 0)))
                    
                    # Generate title from content (first 100 characters)
                    content = doc.get('content', '').strip()
                    if not content:
                        continue
                    
                    title = self._generate_title(content)
                    
                    # Create document record
                    document_record = {
                        "article_number": article_number,
                        "title": title,
                        "content": content,
                        "category": category,
                        "source_document": source_document,
                        "official_url": doc.get('url', ''),
                        "language": "ar"
                    }
                    
                    # Add to database
                    doc_id = await self.add_legal_document(document_record)
                    if doc_id:
                        loaded_count += 1
                        
                        if loaded_count % 10 == 0:
                            logger.info(f"Loaded {loaded_count} documents from {file_path.name}")
                    
                except Exception as e:
                    logger.warning(f"Failed to load document from {file_path.name}: {e}")
                    continue
            
            logger.info(f"Successfully loaded {loaded_count} documents from {file_path.name}")
            return loaded_count
            
        except Exception as e:
            logger.error(f"Error loading file {file_path}: {e}")
            return 0
    
    def _extract_article_number(self, url: str, fallback_id: int) -> str:
        """Extract article number from URL or generate from ID"""
        if url and 'article-' in url:
            try:
                # Extract article number from URL like "code-commerce-article-2"
                parts = url.split('article-')
                if len(parts) > 1:
                    article_num = parts[-1].split('?')[0].split('#')[0]
                    return f"المادة {article_num}"
            except:
                pass
        
        # Fallback to using ID/page number
        return f"المادة {fallback_id + 1}"
    
    def _generate_title(self, content: str) -> str:
        """Generate a title from content (first meaningful sentence)"""
        # Clean content
        content = content.strip()
        
        # Take first sentence or first 100 characters
        sentences = content.split('.')
        if len(sentences) > 0 and len(sentences[0]) > 10:
            title = sentences[0].strip()
            if len(title) > 100:
                title = title[:100] + "..."
            return title
        
        # Fallback to first 80 characters
        if len(content) > 80:
            return content[:80] + "..."
        
        return content
    
    async def add_legal_document(self, document: dict) -> int:
        """Add a legal document to the vector database"""
        try:
            # Check if document already exists (by content hash or URL)
            async with self.db_pool.acquire() as conn:
                existing = await conn.fetchval("""
                    SELECT id FROM legal_documents 
                    WHERE official_url = $1 AND official_url != ''
                    OR (content = $2 AND source_document = $3)
                """, 
                document.get("official_url", ""),
                document["content"],
                document["source_document"]
                )
                
                if existing:
                    logger.debug(f"Document already exists: {document['article_number']}")
                    return None
            
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
                
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding legal document: {e}")
            return None
    
    async def load_all_data(self, data_dir: str = "backend/data"):
        """Load all JSON files from the data directory"""
        try:
            data_path = Path(data_dir)
            if not data_path.exists():
                logger.error(f"Data directory not found: {data_dir}")
                return
            
            json_files = list(data_path.glob("*.json"))
            if not json_files:
                logger.warning(f"No JSON files found in {data_dir}")
                return
            
            logger.info(f"Found {len(json_files)} JSON files to process")
            
            total_loaded = 0
            for json_file in json_files:
                count = await self.load_json_file(json_file)
                total_loaded += count
            
            logger.info(f"✅ Successfully loaded {total_loaded} total legal documents")
            
            # Show final statistics
            await self.show_statistics()
            
        except Exception as e:
            logger.error(f"Error loading all data: {e}")
    
    async def show_statistics(self):
        """Show database statistics"""
        try:
            async with self.db_pool.acquire() as conn:
                # Total documents
                total = await conn.fetchval("SELECT COUNT(*) FROM legal_documents")
                
                # Documents by category
                categories = await conn.fetch("""
                    SELECT category, COUNT(*) as count
                    FROM legal_documents
                    GROUP BY category
                    ORDER BY count DESC
                """)
                
                # Documents by source
                sources = await conn.fetch("""
                    SELECT source_document, COUNT(*) as count
                    FROM legal_documents
                    GROUP BY source_document
                    ORDER BY count DESC
                """)
                
                logger.info(f"📊 Database Statistics:")
                logger.info(f"   Total documents: {total}")
                logger.info(f"   Categories:")
                for cat in categories:
                    logger.info(f"     - {cat['category']}: {cat['count']} documents")
                logger.info(f"   Sources:")
                for src in sources:
                    logger.info(f"     - {src['source_document']}: {src['count']} documents")
                    
        except Exception as e:
            logger.error(f"Error showing statistics: {e}")
    
    async def close(self):
        """Close database connections"""
        if self.db_pool:
            await self.db_pool.close()

async def main():
    """Main function to load legal data"""
    loader = LegalDataLoader()
    
    try:
        await loader.initialize()
        await loader.load_all_data()
        
    except Exception as e:
        logger.error(f"Failed to load legal data: {e}")
        sys.exit(1)
    
    finally:
        await loader.close()

if __name__ == "__main__":
    asyncio.run(main())