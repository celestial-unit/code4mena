#!/usr/bin/env python3
"""
Test the text query endpoint with a simple HTTP request
"""

import requests
import json
import time

def test_text_query_endpoint():
    """Test the /api/v1/query endpoint"""
    
    # Backend URL
    base_url = "http://localhost:8000"
    
    # Test data
    test_request = {
        "query": "كيف يمكنني تأسيس شركة في تونس؟",
        "language": "ar",
        "user_id": "test_user"
    }
    
    # Headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token"
    }
    
    try:
        print("🧪 Testing /api/v1/query endpoint...")
        print(f"📝 Request: {json.dumps(test_request, ensure_ascii=False, indent=2)}")
        
        # Make request to the endpoint
        response = requests.post(
            f"{base_url}/api/v1/query",
            json=test_request,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Response received:")
            print(f"🆔 Query ID: {result.get('query_id', 'N/A')}")
            print(f"🗣️ Language: {result.get('language_detected', 'N/A')}")
            print(f"⚖️ Legal context: {result.get('legal_context', False)}")
            print(f"📚 Sources: {len(result.get('sources', []))}")
            print(f"📄 Response preview: {result.get('response', '')[:100]}...")
            return True
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is the backend server running?")
        print("💡 Start the backend with: python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_root_query_endpoint():
    """Test the root /query endpoint"""
    
    # Backend URL
    base_url = "http://localhost:8000"
    
    # Test data
    test_request = {
        "query": "ما هي الوثائق المطلوبة لتأسيس شركة؟",
        "language": "ar",
        "user_id": "test_user"
    }
    
    # Headers
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token"
    }
    
    try:
        print("\n🧪 Testing root /query endpoint...")
        print(f"📝 Request: {json.dumps(test_request, ensure_ascii=False, indent=2)}")
        
        # Make request to the endpoint
        response = requests.post(
            f"{base_url}/query",
            json=test_request,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Response received:")
            print(f"🆔 Query ID: {result.get('query_id', 'N/A')}")
            print(f"🗣️ Language: {result.get('language_detected', 'N/A')}")
            print(f"⚖️ Legal context: {result.get('legal_context', False)}")
            print(f"📚 Sources: {len(result.get('sources', []))}")
            print(f"📄 Response preview: {result.get('response', '')[:100]}...")
            return True
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - is the backend server running?")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing text query endpoints...")
    
    # Test both endpoints
    v1_success = test_text_query_endpoint()
    root_success = test_root_query_endpoint()
    
    if v1_success and root_success:
        print("\n🎉 All endpoint tests completed successfully!")
        print("✅ Both /api/v1/query and /query endpoints are working")
    else:
        print("\n💥 Some endpoint tests failed!")
        if not v1_success:
            print("❌ /api/v1/query endpoint failed")
        if not root_success:
            print("❌ /query endpoint failed")