#!/usr/bin/env python3
"""
Test script to check available Gemini models
"""
import os
import google.generativeai as genai

# Configure Gemini
gemini_api_key = "AIzaSyDpWpXaUUe83zGJAOM8gLqMHr2sSznOJpU"
genai.configure(api_key=gemini_api_key)

print("Testing Gemini API connection...")

try:
    # List available models
    print("\nAvailable models:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"- {model.name}")
    
    # Test with gemini-pro
    print("\nTesting gemini-pro model...")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Hello, can you help with legal questions?")
    print(f"Response: {response.text[:100]}...")
    
except Exception as e:
    print(f"Error: {e}")
    
    # Try alternative model names
    alternative_models = [
        'models/gemini-pro',
        'models/gemini-1.5-pro-latest',
        'models/gemini-1.5-flash-latest',
        'gemini-1.5-flash'
    ]
    
    for model_name in alternative_models:
        try:
            print(f"\nTrying {model_name}...")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Test")
            print(f"✅ {model_name} works!")
            print(f"Response: {response.text[:50]}...")
            break
        except Exception as e:
            print(f"❌ {model_name} failed: {e}")