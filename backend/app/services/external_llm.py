"""
External LLM Service - Simplifies legal text using external APIs
Supports Google Gemini, OpenAI GPT-4, and Anthropic Claude
"""

import asyncio
import logging
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime
import httpx
import google.generativeai as genai
import openai
from anthropic import Anthropic

logger = logging.getLogger(__name__)

class ExternalLLMService:
    def __init__(self):
        self.gemini_client = None
        self.openai_client = None
        self.anthropic_client = None
        self.preferred_provider = "gemini"  # Default to Gemini
        
        # Initialize API clients
        self._init_clients()
    
    def _init_clients(self):
        """Initialize external LLM API clients"""
        try:
            # Google Gemini
            gemini_api_key = os.getenv("GEMINI_API_KEY")
            if gemini_api_key:
                genai.configure(api_key=gemini_api_key)
                self.gemini_client = genai.GenerativeModel('gemini-1.5-flash')  # Updated model name
                logger.info("Gemini client initialized")
            
            # OpenAI GPT-4
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if openai_api_key:
                self.openai_client = openai.AsyncOpenAI(api_key=openai_api_key)
                logger.info("OpenAI client initialized")
            
            # Anthropic Claude
            anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
            if anthropic_api_key:
                self.anthropic_client = Anthropic(api_key=anthropic_api_key)
                logger.info("Anthropic client initialized")
            
            # Determine preferred provider based on available keys
            if self.gemini_client:
                self.preferred_provider = "gemini"
            elif self.openai_client:
                self.preferred_provider = "openai"
            elif self.anthropic_client:
                self.preferred_provider = "anthropic"
            else:
                logger.warning("No external LLM API keys found - using fallback responses")
                
        except Exception as e:
            logger.error(f"Error initializing LLM clients: {e}")
    
    async def simplify_legal_text(
        self,
        legal_texts: List[Dict[str, Any]],
        language: str = "ar",
        query_context: str = ""
    ) -> str:
        """
        Simplify complex legal text using external LLM
        
        Args:
            legal_texts: List of legal documents from RAG search
            language: Target language for simplification
            query_context: Original query context for better responses
            
        Returns:
            Simplified legal guidance with citations
        """
        try:
            # Prepare legal content for simplification
            legal_content = self._prepare_legal_content(legal_texts)
            
            # Create simplification prompt
            prompt = self._create_simplification_prompt(
                legal_content, language, query_context
            )
            
            # Get simplified response from preferred provider
            simplified_text = await self._get_llm_response(prompt, language)
            
            # Add citations and formatting
            formatted_response = self._format_response_with_citations(
                simplified_text, legal_texts, language
            )
            
            return formatted_response
            
        except Exception as e:
            logger.error(f"Error in legal text simplification: {e}")
            # Return fallback response
            return self._create_fallback_response(legal_texts, language)
    
    def _prepare_legal_content(self, legal_texts: List[Dict[str, Any]]) -> str:
        """Prepare legal documents for simplification"""
        content_parts = []
        
        for i, doc in enumerate(legal_texts[:3], 1):  # Limit to top 3 results
            content_parts.append(f"""
المادة {doc['article_number']} - {doc['title']}
المصدر: {doc['source_document']}
النص: {doc['content']}
---
""")
        
        return "\n".join(content_parts)
    
    def _create_simplification_prompt(
        self, 
        legal_content: str, 
        language: str, 
        query_context: str
    ) -> str:
        """Create prompt for legal text simplification"""
        
        language_instructions = {
            "ar": {
                "lang_name": "العربية",
                "instruction": "اشرح بلغة عربية بسيطة وواضحة",
                "format": "• النقطة الأولى\n• النقطة الثانية\n• النقطة الثالثة\n• النقطة الرابعة"
            },
            "fr": {
                "lang_name": "français",
                "instruction": "Expliquez en français simple et clair",
                "format": "• Premier point\n• Deuxième point\n• Troisième point\n• Quatrième point"
            },
            "en": {
                "lang_name": "English",
                "instruction": "Explain in simple and clear English",
                "format": "• First point\n• Second point\n• Third point\n• Fourth point"
            }
        }
        
        lang_config = language_instructions.get(language, language_instructions["ar"])
        
        prompt = f"""You are a legal expert specializing in Tunisian law. Your task is to simplify complex legal text for ordinary citizens.

User's Question Context: {query_context}

Legal Articles to Simplify:
{legal_content}

Instructions:
1. {lang_config['instruction']} (niveau lycée)
2. Créez exactement 4 points principaux au format bullet points
3. Chaque point doit être pratique et actionnable
4. Incluez les étapes concrètes à suivre
5. Mentionnez les documents nécessaires
6. Utilisez un langage accessible, évitez le jargon juridique
7. Répondez uniquement en {lang_config['lang_name']}

Format de réponse souhaité:
{lang_config['format']}

Réponse simplifiée:"""

        return prompt
    
    async def _get_llm_response(self, prompt: str, language: str) -> str:
        """Get response from preferred LLM provider"""
        try:
            if self.preferred_provider == "gemini" and self.gemini_client:
                return await self._get_gemini_response(prompt)
            elif self.preferred_provider == "openai" and self.openai_client:
                return await self._get_openai_response(prompt)
            elif self.preferred_provider == "anthropic" and self.anthropic_client:
                return await self._get_anthropic_response(prompt)
            else:
                logger.warning("No LLM provider available, using fallback")
                return self._get_fallback_simplification(language)
                
        except Exception as e:
            logger.error(f"Error getting LLM response: {e}")
            return self._get_fallback_simplification(language)
    
    async def _get_gemini_response(self, prompt: str) -> str:
        """Get response from Google Gemini"""
        try:
            response = await asyncio.to_thread(
                self.gemini_client.generate_content,
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=500,
                    top_p=0.8,
                )
            )
            return response.text.strip()
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise
    
    async def _get_openai_response(self, prompt: str) -> str:
        """Get response from OpenAI GPT-4"""
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[
                    {"role": "system", "content": "You are a legal expert specializing in simplifying Tunisian law for citizens."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    async def _get_anthropic_response(self, prompt: str) -> str:
        """Get response from Anthropic Claude"""
        try:
            response = await asyncio.to_thread(
                self.anthropic_client.messages.create,
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            raise
    
    def _get_fallback_simplification(self, language: str) -> str:
        """Provide fallback response when LLM is unavailable"""
        fallback_responses = {
            "ar": """• راجع النصوص القانونية المرفقة للحصول على التفاصيل الكاملة
• استشر محامياً مختصاً للحصول على مشورة قانونية دقيقة
• تأكد من الوثائق المطلوبة قبل بدء أي إجراء قانوني
• اتبع الخطوات المحددة في القانون لضمان صحة الإجراءات""",
            
            "fr": """• Consultez les textes juridiques joints pour les détails complets
• Demandez conseil à un avocat spécialisé pour des conseils juridiques précis
• Vérifiez les documents requis avant de commencer toute procédure légale
• Suivez les étapes définies par la loi pour assurer la validité des procédures""",
            
            "en": """• Review the attached legal texts for complete details
• Consult with a specialized lawyer for precise legal advice
• Verify required documents before starting any legal procedure
• Follow the steps defined by law to ensure procedure validity"""
        }
        
        return fallback_responses.get(language, fallback_responses["ar"])
    
    def _format_response_with_citations(
        self, 
        simplified_text: str, 
        legal_texts: List[Dict[str, Any]], 
        language: str
    ) -> str:
        """Format response with proper citations"""
        
        # Add citations at the end
        citation_header = {
            "ar": "\n\nالمراجع القانونية:",
            "fr": "\n\nRéférences légales:",
            "en": "\n\nLegal References:"
        }
        
        citations = []
        for doc in legal_texts[:3]:
            citation = f"• {doc['article_number']} - {doc['source_document']}"
            if doc.get('official_url'):
                citation += f" ({doc['official_url']})"
            citations.append(citation)
        
        header = citation_header.get(language, citation_header["ar"])
        formatted_response = simplified_text + header + "\n" + "\n".join(citations)
        
        return formatted_response
    
    def _create_fallback_response(
        self, 
        legal_texts: List[Dict[str, Any]], 
        language: str
    ) -> str:
        """Create fallback response when simplification fails"""
        
        fallback_templates = {
            "ar": """بناءً على النصوص القانونية المتاحة:

• المادة ذات الصلة: {article}
• المصدر: {source}
• يُنصح بمراجعة النص الكامل للحصول على التفاصيل
• استشر محامياً للحصول على مشورة قانونية دقيقة

المراجع القانونية:
{citations}""",
            
            "fr": """Basé sur les textes juridiques disponibles:

• Article pertinent: {article}
• Source: {source}
• Il est conseillé de consulter le texte complet pour les détails
• Consultez un avocat pour des conseils juridiques précis

Références légales:
{citations}""",
            
            "en": """Based on available legal texts:

• Relevant Article: {article}
• Source: {source}
• It is advised to review the complete text for details
• Consult a lawyer for precise legal advice

Legal References:
{citations}"""
        }
        
        if not legal_texts:
            return self._get_fallback_simplification(language)
        
        first_doc = legal_texts[0]
        template = fallback_templates.get(language, fallback_templates["ar"])
        
        citations = []
        for doc in legal_texts[:3]:
            citations.append(f"• {doc['article_number']} - {doc['source_document']}")
        
        return template.format(
            article=first_doc['article_number'],
            source=first_doc['source_document'],
            citations="\n".join(citations)
        )
    
    async def health_check(self) -> str:
        """Check if external LLM service is healthy"""
        try:
            # Check if at least one provider is available
            available_providers = []
            
            if self.gemini_client:
                available_providers.append("gemini")
            if self.openai_client:
                available_providers.append("openai")
            if self.anthropic_client:
                available_providers.append("anthropic")
            
            if not available_providers:
                return "unhealthy - no LLM providers configured"
            
            # Test preferred provider with a simple request
            test_prompt = "Test prompt for health check"
            try:
                response = await self._get_llm_response(test_prompt, "ar")
                if response:
                    return f"healthy - using {self.preferred_provider}"
                else:
                    return "unhealthy - no response from LLM"
            except:
                return f"unhealthy - {self.preferred_provider} API error"
                
        except Exception as e:
            logger.error(f"External LLM health check failed: {e}")
            return f"unhealthy - {str(e)}"