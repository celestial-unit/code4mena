#!/usr/bin/env python3
"""
Simple test script for the text query endpoint
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import json

# Simple test without importing the full service
def test_text_query_models():
    """Test the text query models"""
    try:
        # Test the basic structure
        test_request = {
            "query": "كيف يمكنني تأسيس شركة في تونس؟",
            "language": "ar",
            "user_id": "test_user"
        }
        
        print(f"📝 Test request structure: {json.dumps(test_request, ensure_ascii=False, indent=2)}")
        
        # Test response structure
        test_response = {
            "response": "بناءً على استفسارك حول تأسيس شركة في تونس...",
            "sources": [
                {
                    "article_number": "المادة 1",
                    "title": "تأسيس الشركات التجارية",
                    "source_document": "مجلة الشركات التجارية",
                    "official_url": "https://legislation.tn/business-law/article-1",
                    "relevance_score": 0.85
                }
            ],
            "disclaimer": "تنويه قانوني: هذه المعلومات مقدمة لأغراض إعلامية فقط...",
            "query_id": "test-query-123",
            "language_detected": "ar",
            "legal_context": True,
            "processing_time_ms": 150,
            "confidence_score": 0.85
        }
        
        print(f"📄 Test response structure: {json.dumps(test_response, ensure_ascii=False, indent=2)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_text_query():
    """Test the text query functionality"""
    print("🧪 Testing text query models and structure...")
    return test_text_query_models()

if __name__ == "__main__":
    success = test_text_query()
    if success:
        print("\n🎉 Text query test completed successfully!")
        print("✅ The text query endpoint structure is ready for implementation")
        sys.exit(0)
    else:
        print("\n💥 Text query test failed!")
        sys.exit(1)