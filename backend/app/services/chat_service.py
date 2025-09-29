"""
Chat Service - Business logic for chat and conversation management
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..repositories.chat_repository import ChatRepository

class ChatService:
    """Service class for chat operations"""
    
    def __init__(self):
        self.repository = ChatRepository()
    
    async def get_user_conversations(
        self,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get user's chat conversations
        """
        return await self.repository.get_user_conversations(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
    
    async def create_conversation(
        self,
        user_id: str,
        title: str = "New Conversation",
        category: str = "general"
    ) -> Dict[str, Any]:
        """
        Create a new chat conversation
        """
        conversation_id = str(uuid.uuid4())
        conversation = {
            "id": conversation_id,
            "userId": user_id,
            "title": title,
            "titleAr": title,
            "titleFr": title,
            "category": category,
            "messages": [],
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "isActive": True,
            "messageCount": 0,
            "lastMessageAt": None,
            "metadata": {
                "language": "ar",
                "topics": [],
                "sentiment": "neutral",
                "complexity": "beginner"
            }
        }
        
        return await self.repository.create_conversation(conversation)
    
    async def get_conversation_by_id(
        self,
        conversation_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific conversation by ID
        """
        return await self.repository.get_conversation_by_id(conversation_id, user_id)
    
    async def send_message(
        self,
        conversation_id: str,
        user_id: str,
        content: str,
        language: str = "ar"
    ) -> Dict[str, Any]:
        """
        Send a message and generate AI response
        """
        # Create user message
        user_message = {
            "id": str(uuid.uuid4()),
            "conversationId": conversation_id,
            "type": "user",
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "isEdited": False,
            "metadata": {
                "legalReferences": [],
                "suggestedActions": [],
                "relatedTopics": [],
                "culturalContext": {
                    "culturalReferences": [],
                    "dialectTerms": [],
                    "regionalRelevance": []
                }
            }
        }
        
        # Generate AI response
        ai_response = await self._generate_ai_response(content, language)
        
        ai_message = {
            "id": str(uuid.uuid4()),
            "conversationId": conversation_id,
            "type": "ai",
            "content": ai_response["content"],
            "contentAr": ai_response["contentAr"],
            "contentFr": ai_response["contentFr"],
            "timestamp": datetime.utcnow().isoformat(),
            "isEdited": False,
            "metadata": ai_response["metadata"],
            "mascotAnimation": ai_response.get("mascotAnimation")
        }
        
        # Add messages to conversation
        return await self.repository.add_messages_to_conversation(
            conversation_id, user_id, [user_message, ai_message]
        )
    
    async def update_conversation(
        self,
        conversation_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a conversation
        """
        return await self.repository.update_conversation(
            conversation_id, user_id, update_data
        )
    
    async def delete_conversation(
        self,
        conversation_id: str,
        user_id: str
    ) -> None:
        """
        Delete a conversation
        """
        await self.repository.delete_conversation(conversation_id, user_id)
    
    async def get_message_by_id(
        self,
        message_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific message by ID
        """
        return await self.repository.get_message_by_id(message_id, user_id)
    
    async def update_message(
        self,
        message_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a message
        """
        return await self.repository.update_message(message_id, user_id, update_data)
    
    async def get_quick_replies(
        self,
        category: Optional[str] = None,
        sector: Optional[str] = None,
        language: str = "ar",
        popular_only: bool = False,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get quick reply suggestions
        """
        return await self.repository.get_quick_replies(
            category=category,
            sector=sector,
            language=language,
            popular_only=popular_only,
            limit=limit
        )
    
    async def record_quick_reply_usage(
        self,
        reply_id: str,
        user_id: str
    ) -> None:
        """
        Record usage of a quick reply
        """
        await self.repository.record_quick_reply_usage(reply_id, user_id)
    
    async def export_conversation(
        self,
        conversation_id: str,
        user_id: str,
        format: str = "json"
    ) -> Dict[str, Any]:
        """
        Export a conversation in various formats
        """
        conversation = await self.repository.get_conversation_by_id(conversation_id, user_id)
        if not conversation:
            raise ValueError("Conversation not found")
        
        if format == "json":
            return conversation
        elif format == "txt":
            return await self._export_as_text(conversation)
        elif format == "pdf":
            return await self._export_as_pdf(conversation)
        else:
            raise ValueError(f"Unsupported export format: {format}")
    
    async def get_conversation_analytics(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get conversation analytics for the user
        """
        return await self.repository.get_conversation_analytics(user_id, days)
    
    async def _generate_ai_response(
        self,
        user_message: str,
        language: str = "ar"
    ) -> Dict[str, Any]:
        """
        Generate AI response to user message
        """
        # Mock AI response generation
        # In a real implementation, this would call the legal RAG service
        
        responses = {
            "ar": {
                "content": f"بناءً على استفسارك حول '{user_message}'، إليك الإرشادات القانونية المناسبة...",
                "contentAr": f"بناءً على استفسارك حول '{user_message}'، إليك الإرشادات القانونية المناسبة...",
                "contentFr": f"Basé sur votre question concernant '{user_message}', voici les conseils juridiques appropriés..."
            },
            "fr": {
                "content": f"Basé sur votre question concernant '{user_message}', voici les conseils juridiques appropriés...",
                "contentAr": f"بناءً على استفسارك حول '{user_message}'، إليك الإرشادات القانونية المناسبة...",
                "contentFr": f"Basé sur votre question concernant '{user_message}', voici les conseils juridiques appropriés..."
            },
            "en": {
                "content": f"Based on your question about '{user_message}', here are the appropriate legal guidelines...",
                "contentAr": f"بناءً على استفسارك حول '{user_message}'، إليك الإرشادات القانونية المناسبة...",
                "contentFr": f"Basé sur votre question concernant '{user_message}', voici les conseils juridiques appropriés..."
            }
        }
        
        response = responses.get(language, responses["ar"])
        
        return {
            **response,
            "metadata": {
                "confidence": 0.85 + (0.1 * hash(user_message) % 10) / 100,
                "sources": ["legal-database", "ministry-official"],
                "processingTime": 1.2 + (hash(user_message) % 100) / 100,
                "legalReferences": [
                    {
                        "id": f"ref-{hash(user_message) % 1000}",
                        "title": "Relevant Legal Article",
                        "titleAr": "المادة القانونية ذات الصلة",
                        "titleFr": "Article juridique pertinent",
                        "type": "law",
                        "source": "Official Gazette",
                        "relevanceScore": 0.9,
                        "excerpt": "Legal text excerpt..."
                    }
                ],
                "suggestedActions": [
                    "Consult with a legal professional",
                    "Review official documentation",
                    "Contact relevant ministry"
                ],
                "relatedTopics": ["legal compliance", "documentation", "procedures"],
                "culturalContext": {
                    "culturalReferences": [],
                    "dialectTerms": [],
                    "regionalRelevance": ["tunis", "national"]
                }
            },
            "mascotAnimation": {
                "type": "explaining",
                "sector": "business",
                "duration": 3.5,
                "culturalElements": ["traditional_gesture", "professional_attire"],
                "voiceSync": True
            }
        }
    
    async def _export_as_text(self, conversation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export conversation as plain text
        """
        text_content = f"Conversation: {conversation['title']}\n"
        text_content += f"Created: {conversation['createdAt']}\n\n"
        
        for message in conversation.get("messages", []):
            sender = "User" if message["type"] == "user" else "AI Assistant"
            text_content += f"{sender}: {message['content']}\n\n"
        
        return {
            "format": "txt",
            "content": text_content,
            "filename": f"conversation_{conversation['id']}.txt"
        }
    
    async def _export_as_pdf(self, conversation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Export conversation as PDF (mock implementation)
        """
        # In a real implementation, this would generate a PDF
        return {
            "format": "pdf",
            "content": "PDF content would be generated here",
            "filename": f"conversation_{conversation['id']}.pdf",
            "note": "PDF generation not implemented in mock version"
        }