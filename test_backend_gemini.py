#!/usr/bin/env python3
"""
Test Gemini API in the same environment as your backend
"""

import os
import sys
import asyncio

# Add backend to path
sys.path.insert(0, 'backend')

async def test_gemini_in_backend():
    print("🔍 Testing Gemini API in backend environment...")
    
    # Import your services
    try:
        from services.audio_service import AudioService
        print("✅ Successfully imported AudioService")
    except Exception as e:
        print(f"❌ Failed to import AudioService: {e}")
        return False
    
    # Initialize audio service (which has working Gemini)
    audio_service = AudioService()
    
    try:
        success = await audio_service.initialize()
        if not success:
            print("❌ Audio service initialization failed")
            return False
        print("✅ Audio service initialized successfully")
    except Exception as e:
        print(f"❌ Audio service initialization error: {e}")
        return False
    
    # Test Gemini client
    if not audio_service.gemini_client:
        print("❌ Gemini client is None")
        return False
    
    print("✅ Gemini client is available")
    
    # Test a simple query
    try:
        print("🚀 Testing Gemini API call...")
        
        response = await asyncio.to_thread(
            audio_service.gemini_client.generate_content,
            "مرحبا، أنا مساعد قانوني. أجب بجملة واحدة عن القانون التونسي.",
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 100,
            }
        )
        
        if response and response.text:
            print(f"✅ Gemini API works! Response: {response.text[:100]}...")
            return True
        else:
            print("❌ No response from Gemini")
            return False
            
    except Exception as e:
        print(f"❌ Gemini API call failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_gemini_in_backend())
    if result:
        print("\n🎉 Gemini API is working in your backend environment!")
        print("The issue is in the main.py integration logic.")
    else:
        print("\n💡 Gemini API needs to be fixed in your backend environment.")
        print("Check your GEMINI_API_KEY and dependencies.")