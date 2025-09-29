#!/usr/bin/env python3
"""
Test script to verify Gemini API integration
"""

import asyncio
import os
import sys
sys.path.append('backend')

from backend.services.external_llm import ExternalLLMService

async def test_gemini():
    print("🔍 Testing Gemini API integration...")
    
    service = ExternalLLMService()
    
    # Check if Gemini client is initialized
    if service.gemini_client:
        print("✅ Gemini client is initialized")
        print(f"✅ Preferred provider: {service.preferred_provider}")
    else:
        print("❌ Gemini client is NOT initialized")
        return
    
    # Test with simple legal documents
    legal_texts = [
        {
            'article_number': 'المادة 1',
            'title': 'تأسيس الشركات التجارية',
            'content': 'يجب على كل من يرغب في تأسيس شركة تجارية أن يقدم طلباً إلى السجل التجاري مرفقاً بالوثائق المطلوبة',
            'source_document': 'مجلة الشركات التجارية',
            'score': 0.9
        }
    ]
    
    try:
        print("🚀 Calling Gemini API...")
        result = await service.simplify_legal_text(
            legal_texts, 
            'ar', 
            'كيف يمكنني تسجيل شركة جديدة في تونس؟'
        )
        print('✅ Gemini API call successful!')
        print('📝 Response preview:', result[:300] + '...' if len(result) > 300 else result)
        
        # Check if it's a real Gemini response or fallback
        if "راجع النصوص القانونية المرفقة" in result:
            print("⚠️  This looks like a fallback response, not a real Gemini response")
        else:
            print("🎉 This appears to be a real Gemini-generated response!")
            
    except Exception as e:
        print('❌ Gemini API call failed:', str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_gemini())