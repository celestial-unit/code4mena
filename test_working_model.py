#!/usr/bin/env python3
"""
Test the working Gemini model
"""
import google.generativeai as genai

# Configure Gemini
gemini_api_key = "AIzaSyDpWpXaUUe83zGJAOM8gLqMHr2sSznOJpU"
genai.configure(api_key=gemini_api_key)

try:
    print("Testing models/gemini-2.5-flash...")
    model = genai.GenerativeModel('models/gemini-2.5-flash')
    response = model.generate_content("Hello! Can you help me with legal questions about Tunisian law?")
    print(f"✅ Success! Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")