#!/usr/bin/env python3
"""
Simple test to verify Gemini API key works
"""

import os
import google.generativeai as genai

def test_gemini_api():
    print("🔍 Testing Gemini API key...")
    
    # Check if API key is set
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment")
        return False
    
    print(f"✅ API key found (length: {len(api_key)})")
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Create model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Test simple query
        print("🚀 Testing simple Gemini query...")
        response = model.generate_content("مرحبا، قل لي شيئاً عن القانون التونسي")
        
        if response and response.text:
            print("✅ Gemini API works!")
            print(f"📝 Response: {response.text[:200]}...")
            return True
        else:
            print("❌ No response from Gemini")
            return False
            
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return False

if __name__ == "__main__":
    success = test_gemini_api()
    if success:
        print("\n🎉 Your Gemini API is working! The issue is in the backend integration.")
    else:
        print("\n💡 Fix your Gemini API setup first, then the backend will work.")