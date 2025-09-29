#!/usr/bin/env python3
"""
Test script to verify audio endpoints are accessible
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from backend.app.main import app

def test_audio_endpoints():
    """Test that audio endpoints are accessible through the API router"""
    client = TestClient(app)
    
    print("Testing audio endpoints accessibility...")
    
    # Test endpoints that should be available
    endpoints_to_test = [
        "/api/v1/audio/health",
        "/api/v1/audio/languages", 
        "/api/v1/audio/config"
    ]
    
    results = {}
    
    for endpoint in endpoints_to_test:
        try:
            print(f"Testing {endpoint}...")
            response = client.get(endpoint)
            results[endpoint] = {
                "status_code": response.status_code,
                "accessible": response.status_code != 404,
                "response": response.json() if response.status_code != 500 else "Server error"
            }
            print(f"  Status: {response.status_code}")
            if response.status_code == 200:
                print(f"  ✅ Endpoint accessible")
            elif response.status_code == 404:
                print(f"  ❌ Endpoint not found")
            else:
                print(f"  ⚠️  Endpoint accessible but returned error")
                
        except Exception as e:
            results[endpoint] = {
                "status_code": "error",
                "accessible": False,
                "error": str(e)
            }
            print(f"  ❌ Error: {e}")
    
    # Test POST endpoints (these might fail due to missing auth/data, but should not return 404)
    post_endpoints = [
        "/api/v1/audio/query",
        "/api/v1/audio/tts"
    ]
    
    for endpoint in post_endpoints:
        try:
            print(f"Testing {endpoint} (POST)...")
            response = client.post(endpoint)
            results[endpoint] = {
                "status_code": response.status_code,
                "accessible": response.status_code != 404,
                "note": "POST endpoint - expecting auth/validation errors, not 404"
            }
            print(f"  Status: {response.status_code}")
            if response.status_code == 404:
                print(f"  ❌ Endpoint not found")
            else:
                print(f"  ✅ Endpoint accessible (status {response.status_code} expected for POST without data)")
                
        except Exception as e:
            results[endpoint] = {
                "status_code": "error", 
                "accessible": False,
                "error": str(e)
            }
            print(f"  ❌ Error: {e}")
    
    print("\n" + "="*50)
    print("SUMMARY:")
    print("="*50)
    
    all_accessible = True
    for endpoint, result in results.items():
        accessible = result.get("accessible", False)
        status = "✅ ACCESSIBLE" if accessible else "❌ NOT ACCESSIBLE"
        print(f"{endpoint}: {status}")
        if not accessible:
            all_accessible = False
    
    if all_accessible:
        print("\n🎉 All audio endpoints are properly accessible!")
        print("The audio router is correctly enabled in the main API router.")
    else:
        print("\n⚠️  Some endpoints are not accessible.")
        print("Check the router configuration and imports.")
    
    return results

if __name__ == "__main__":
    test_audio_endpoints()