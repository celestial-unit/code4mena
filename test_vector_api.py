#!/usr/bin/env python3
"""
Test Kanounji 2025 Vector Storage via API
Tests the vector storage functionality through HTTP endpoints
"""

import requests
import json
import time

API_BASE = "http://localhost:8001"

def test_api_health():
    """Test if the API is running"""
    print("🏥 Testing API health...")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ API is healthy")
            
            # Check if vector storage is initialized
            if 'vector_storage' in str(health_data):
                print("✅ Vector storage detected in health check")
            else:
                print("⚠️ Vector storage not yet visible in health check")
            
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API connection failed: {e}")
        return False

def test_vector_health():
    """Test vector storage health endpoint"""
    print("\n🧠 Testing vector storage health...")
    try:
        response = requests.get(f"{API_BASE}/api/v2/vector-health", timeout=30)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Vector storage health endpoint working")
            print(f"📊 Health data: {json.dumps(health_data, indent=2)}")
            return True
        else:
            print(f"❌ Vector health check failed: {response.status_code}")
            if response.text:
                print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Vector health check error: {e}")
        return False

def test_semantic_search():
    """Test semantic search endpoint"""
    print("\n🔍 Testing semantic search...")
    try:
        # Test query in Arabic
        query_data = {
            "query": "قوانين الشركات التجارية في تونس",
            "language": "ar",
            "max_results": 5
        }
        
        response = requests.post(
            f"{API_BASE}/api/v2/semantic-search",
            json=query_data,
            timeout=60
        )
        
        if response.status_code == 200:
            search_results = response.json()
            print("✅ Semantic search endpoint working")
            print(f"🎯 Query: '{query_data['query']}'")
            
            if search_results.get('success'):
                results = search_results.get('search_results', {})
                total_results = results.get('total_results', 0)
                sources_searched = results.get('sources_searched', 0)
                
                print(f"📊 Total results: {total_results}")
                print(f"📂 Sources searched: {sources_searched}")
                
                # Show results by source
                for source, source_results in results.get('results', {}).items():
                    if source_results:
                        print(f"\n📋 {source.upper()} Results ({len(source_results)}):")
                        for i, result in enumerate(source_results[:2], 1):
                            similarity = result.get('similarity', 0)
                            content = result.get('content', result.get('title', 'No content'))
                            if len(content) > 100:
                                content = content[:100] + "..."
                            print(f"  {i}. Similarity: {similarity:.3f} | {content}")
                
                return True
            else:
                print("⚠️ Search completed but no success flag")
                return False
        else:
            print(f"❌ Semantic search failed: {response.status_code}")
            if response.text:
                print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Semantic search error: {e}")
        return False

def test_generate_embeddings():
    """Test embedding generation endpoint"""
    print("\n🔢 Testing embedding generation...")
    try:
        response = requests.post(f"{API_BASE}/api/v2/generate-embeddings", timeout=120)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Embedding generation endpoint working")
            
            if result.get('success'):
                embeddings_generated = result.get('embeddings_generated', {})
                total_generated = result.get('total_generated', 0)
                processing_time = result.get('processing_time_ms', 0)
                
                print(f"📊 Total embeddings generated: {total_generated}")
                print(f"⏱️ Processing time: {processing_time}ms")
                
                for table, count in embeddings_generated.items():
                    if count > 0:
                        print(f"  • {table}: {count} embeddings")
                
                return True
            else:
                print("⚠️ Embedding generation completed but no success flag")
                return False
        else:
            print(f"❌ Embedding generation failed: {response.status_code}")
            if response.text:
                print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Embedding generation error: {e}")
        return False

def test_enhanced_legal_query():
    """Test the enhanced legal intelligence endpoint"""
    print("\n🚀 Testing enhanced legal intelligence...")
    try:
        query_data = {
            "query": "ما هي إجراءات تأسيس شركة في تونس؟",
            "language": "ar",
            "max_results": 3
        }
        
        response = requests.post(
            f"{API_BASE}/api/v2/legal-intelligence",
            json=query_data,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Enhanced legal intelligence endpoint working")
            
            if result.get('success'):
                intelligence = result.get('legal_intelligence', {})
                confidence = intelligence.get('confidence_score', 0)
                sources_count = sum(intelligence.get('sources_summary', {}).values())
                
                print(f"🎯 Query: '{query_data['query']}'")
                print(f"📊 Confidence: {confidence:.1%}")
                print(f"📂 Sources used: {sources_count}")
                
                return True
            else:
                print("⚠️ Query completed but no success flag")
                return False
        else:
            print(f"❌ Enhanced legal query failed: {response.status_code}")
            if response.text:
                print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Enhanced legal query error: {e}")
        return False

def main():
    """Run all vector storage tests"""
    print("🧪 Testing Kanounji 2025 Vector Storage via API")
    print("=" * 50)
    
    # Wait a bit for services to fully start
    print("⏳ Waiting for services to initialize...")
    time.sleep(5)
    
    tests = [
        ("API Health", test_api_health),
        ("Vector Health", test_vector_health),
        ("Generate Embeddings", test_generate_embeddings),
        ("Semantic Search", test_semantic_search),
        ("Enhanced Legal Query", test_enhanced_legal_query),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results[test_name] = False
        
        # Small delay between tests
        time.sleep(2)
    
    # Summary
    print(f"\n{'='*50}")
    print("📊 TEST SUMMARY")
    print(f"{'='*50}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All vector storage tests passed! Kanounji 2025 is working perfectly!")
    elif passed > 0:
        print("⚠️ Some tests passed. Vector storage is partially working.")
    else:
        print("❌ All tests failed. Check the Docker logs for issues.")
        print("💡 Try: docker-compose logs -f backend")

if __name__ == "__main__":
    main()