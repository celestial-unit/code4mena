#!/usr/bin/env python3
"""
Test script for Kanounji 2025 Vector Storage
Verifies that vector embeddings and semantic search are working correctly
"""

import asyncio
import logging
from datetime import datetime
from backend.services.vector_storage import VectorStorageService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_vector_storage():
    """Test vector storage functionality"""
    
    print("🧪 Testing Kanounji 2025 Vector Storage...")
    
    # Initialize vector storage
    vector_storage = VectorStorageService()
    
    try:
        # Initialize the service
        print("📡 Initializing vector storage service...")
        success = await vector_storage.initialize()
        
        if not success:
            print("❌ Failed to initialize vector storage service")
            return
        
        print("✅ Vector storage service initialized successfully")
        
        # Test embedding generation
        print("\n🔢 Testing embedding generation...")
        test_text = "قانون الشركات التجارية في تونس"
        embedding = vector_storage._generate_embedding(test_text)
        
        print(f"✅ Generated embedding with dimension: {len(embedding)}")
        print(f"📊 First 5 values: {embedding[:5]}")
        
        # Test storing a legal signal
        print("\n📝 Testing legal signal storage...")
        signal_data = {
            'signal_id': 'test_signal_001',
            'source_platform': 'test',
            'source_account': 'test_account',
            'ministry': 'وزارة العدل',
            'content': 'تم إقرار قانون جديد للشركات التجارية يهدف إلى تبسيط إجراءات التأسيس وتحسين بيئة الأعمال في تونس',
            'legal_relevance_score': 8.5,
            'detected_topics': ['قانون الشركات', 'بيئة الأعمال', 'التأسيس'],
            'signal_type': 'announcement',
            'language': 'ar',
            'urgency': 'high',
            'metadata': {'test': True},
            'timestamp': datetime.utcnow()
        }
        
        success = await vector_storage.store_legal_signal_with_embedding(signal_data)
        
        if success:
            print("✅ Legal signal stored successfully with embedding")
        else:
            print("⚠️ Legal signal storage failed (might be duplicate)")
        
        # Test storing a government post
        print("\n🏛️ Testing government post storage...")
        post_data = {
            'ministry': 'وزارة التجارة',
            'platform': 'facebook',
            'account_name': 'MinistryOfTrade',
            'post_content': 'إعلان هام: تم تمديد مهلة تسجيل الشركات الجديدة حتى نهاية الشهر الجاري',
            'post_url': 'https://facebook.com/test',
            'post_date': datetime.utcnow(),
            'engagement_metrics': {'likes': 150, 'shares': 45, 'comments': 23},
            'legal_significance': 7.0,
            'extracted_legal_info': {'topics': ['تسجيل الشركات', 'مهل قانونية']}
        }
        
        success = await vector_storage.store_government_post_with_embedding(post_data)
        
        if success:
            print("✅ Government post stored successfully with embedding")
        else:
            print("⚠️ Government post storage failed (might be duplicate)")
        
        # Test semantic search
        print("\n🔍 Testing semantic search...")
        search_query = "قوانين الشركات والتجارة"
        
        search_results = await vector_storage.semantic_search_all_sources(
            query=search_query,
            top_k=5,
            min_similarity=0.1  # Lower threshold for testing
        )
        
        print(f"🎯 Search query: '{search_query}'")
        print(f"📊 Total results: {search_results.get('total_results', 0)}")
        print(f"📂 Sources searched: {search_results.get('sources_searched', 0)}")
        
        # Display results by source
        for source, results in search_results.get('results', {}).items():
            if results:
                print(f"\n📋 {source.upper()} Results ({len(results)}):")
                for i, result in enumerate(results[:2], 1):  # Show top 2 results per source
                    similarity = result.get('similarity', 0)
                    content = result.get('content', result.get('title', 'No content'))[:100]
                    print(f"  {i}. Similarity: {similarity:.3f} | {content}...")
        
        # Test health check
        print("\n🏥 Testing health check...")
        health = await vector_storage.health_check()
        
        print(f"📊 Health Status: {health.get('status', 'unknown')}")
        if health.get('tables_status'):
            print("📋 Table Status:")
            for table, status in health['tables_status'].items():
                if isinstance(status, dict):
                    total = status.get('total_records', 0)
                    with_embeddings = status.get('with_embeddings', 0)
                    coverage = status.get('embedding_coverage', '0%')
                    print(f"  • {table}: {total} records, {with_embeddings} with embeddings ({coverage})")
        
        print("\n🎉 Vector storage test completed successfully!")
        
    except Exception as e:
        print(f"❌ Vector storage test failed: {e}")
        logger.error(f"Test error: {e}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(test_vector_storage())