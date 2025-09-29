"""
Chat Repository - Data access layer for chat and conversation information
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import copy

class ChatRepository:
    """Repository class for chat data access"""
    
    def __init__(self):
        # Mock data based on the original chat-conversations.json and quick-replies.json
        self._mock_conversations = [
            {
                "id": "conversation-001",
                "userId": "user-001",
                "title": "Starting an E-commerce Business in Tunisia",
                "titleAr": "بدء عمل تجاري إلكتروني في تونس",
                "titleFr": "Démarrer une entreprise de commerce électronique en Tunisie",
                "category": "business_law",
                "messages": [
                    {
                        "id": "msg-001",
                        "conversationId": "conversation-001",
                        "type": "user",
                        "content": "I want to start an e-commerce business in Tunisia. What legal requirements do I need to know?",
                        "contentAr": "أريد بدء عمل تجاري إلكتروني في تونس. ما هي المتطلبات القانونية التي أحتاج لمعرفتها؟",
                        "contentFr": "Je veux démarrer une entreprise de commerce électronique en Tunisie. Quelles sont les exigences légales que je dois connaître ?",
                        "timestamp": "2024-01-15T10:00:00Z",
                        "isEdited": False,
                        "metadata": {
                            "legalReferences": [],
                            "suggestedActions": [],
                            "relatedTopics": ["business registration", "e-commerce law", "tax obligations"],
                            "culturalContext": {
                                "culturalReferences": [],
                                "dialectTerms": [],
                                "regionalRelevance": []
                            }
                        }
                    },
                    {
                        "id": "msg-002",
                        "conversationId": "conversation-001",
                        "type": "ai",
                        "content": "مرحباً أحمد! أهلاً وسهلاً بك في عالم التجارة الإلكترونية التونسية. لبدء عملك التجاري الإلكتروني، تحتاج إلى معرفة عدة متطلبات قانونية مهمة:\n\n1. **تسجيل الشركة**: يجب تسجيل شركتك لدى المركز الوحيد للمؤسسات (CFE)\n2. **الترخيص التجاري**: الحصول على رخصة تجارية مناسبة لنشاط التجارة الإلكترونية\n3. **التسجيل الضريبي**: التسجيل في النظام الضريبي الرقمي الجديد\n4. **حماية البيانات**: الامتثال لقوانين حماية البيانات الشخصية\n\nهل تريد التفاصيل حول أي من هذه النقاط؟",
                        "contentAr": "مرحباً أحمد! أهلاً وسهلاً بك في عالم التجارة الإلكترونية التونسية. لبدء عملك التجاري الإلكتروني، تحتاج إلى معرفة عدة متطلبات قانونية مهمة:\n\n1. **تسجيل الشركة**: يجب تسجيل شركتك لدى المركز الوحيد للمؤسسات (CFE)\n2. **الترخيص التجاري**: الحصول على رخصة تجارية مناسبة لنشاط التجارة الإلكترونية\n3. **التسجيل الضريبي**: التسجيل في النظام الضريبي الرقمي الجديد\n4. **حماية البيانات**: الامتثال لقوانين حماية البيانات الشخصية\n\nهل تريد التفاصيل حول أي من هذه النقاط؟",
                        "contentFr": "Bonjour Ahmed ! Bienvenue dans le monde du commerce électronique tunisien. Pour démarrer votre entreprise de commerce électronique, vous devez connaître plusieurs exigences légales importantes :\n\n1. **Enregistrement de l'entreprise** : Vous devez enregistrer votre entreprise auprès du Centre de Formalités des Entreprises (CFE)\n2. **Licence commerciale** : Obtenir une licence commerciale appropriée pour l'activité de commerce électronique\n3. **Enregistrement fiscal** : S'inscrire au nouveau système fiscal numérique\n4. **Protection des données** : Se conformer aux lois sur la protection des données personnelles\n\nVoulez-vous des détails sur l'un de ces points ?",
                        "timestamp": "2024-01-15T10:01:30Z",
                        "isEdited": False,
                        "metadata": {
                            "confidence": 0.92,
                            "sources": ["legal-database", "ministry-commerce"],
                            "processingTime": 1.2,
                            "legalReferences": [
                                {
                                    "id": "ref-001",
                                    "title": "Commercial Code - E-commerce Provisions",
                                    "titleAr": "المجلة التجارية - أحكام التجارة الإلكترونية",
                                    "titleFr": "Code de commerce - Dispositions sur le commerce électronique",
                                    "type": "law",
                                    "source": "Official Gazette",
                                    "relevanceScore": 0.95,
                                    "excerpt": "All e-commerce businesses must register with appropriate authorities"
                                }
                            ],
                            "suggestedActions": [
                                "Visit CFE office for registration",
                                "Prepare required documentation",
                                "Consult with business lawyer"
                            ],
                            "relatedTopics": ["business registration", "digital tax", "data protection"],
                            "culturalContext": {
                                "culturalReferences": ["traditional_business_greeting"],
                                "dialectTerms": ["مرحباً", "أهلاً وسهلاً"],
                                "regionalRelevance": ["tunis", "national"]
                            }
                        },
                        "mascotAnimation": {
                            "type": "greeting",
                            "sector": "business",
                            "duration": 2.5,
                            "culturalElements": ["traditional_gesture", "business_attire"],
                            "voiceSync": True
                        }
                    }
                ],
                "createdAt": "2024-01-15T10:00:00Z",
                "updatedAt": "2024-01-15T10:01:30Z",
                "isActive": True,
                "messageCount": 2,
                "lastMessageAt": "2024-01-15T10:01:30Z",
                "metadata": {
                    "language": "ar",
                    "topics": ["e-commerce", "business registration", "legal requirements"],
                    "sentiment": "positive",
                    "complexity": "intermediate"
                }
            }
        ]
        
        self._mock_quick_replies = [
            {
                "id": "qr-business-001",
                "text": "How do I register a new business in Tunisia?",
                "textAr": "كيف أسجل شركة جديدة في تونس؟",
                "textFr": "Comment enregistrer une nouvelle entreprise en Tunisie ?",
                "category": "business_law",
                "sector": "business",
                "isPopular": True,
                "usageCount": 1250
            },
            {
                "id": "qr-business-002",
                "text": "What are the tax obligations for e-commerce businesses?",
                "textAr": "ما هي الالتزامات الضريبية لشركات التجارة الإلكترونية؟",
                "textFr": "Quelles sont les obligations fiscales pour les entreprises de commerce électronique ?",
                "category": "business_law",
                "sector": "business",
                "isPopular": True,
                "usageCount": 980
            },
            {
                "id": "qr-tax-001",
                "text": "How do I calculate VAT for my business?",
                "textAr": "كيف أحسب ضريبة القيمة المضافة لعملي؟",
                "textFr": "Comment calculer la TVA pour mon entreprise ?",
                "category": "tax_law",
                "sector": "money",
                "isPopular": True,
                "usageCount": 1350
            },
            {
                "id": "qr-labor-001",
                "text": "What are the minimum wage requirements?",
                "textAr": "ما هي متطلبات الحد الأدنى للأجور؟",
                "textFr": "Quelles sont les exigences du salaire minimum ?",
                "category": "labor_law",
                "sector": "business",
                "isPopular": True,
                "usageCount": 920
            },
            {
                "id": "qr-labor-003",
                "text": "What are the new remote work regulations?",
                "textAr": "ما هي لوائح العمل عن بُعد الجديدة؟",
                "textFr": "Quelles sont les nouvelles réglementations sur le télétravail ?",
                "category": "labor_law",
                "sector": "business",
                "isPopular": True,
                "usageCount": 1050
            },
            {
                "id": "qr-family-003",
                "text": "How to register a newborn child?",
                "textAr": "كيفية تسجيل طفل حديث الولادة؟",
                "textFr": "Comment enregistrer un nouveau-né ?",
                "category": "family_law",
                "sector": "family",
                "isPopular": True,
                "usageCount": 1200
            }
        ]
    
    async def get_user_conversations(
        self,
        user_id: str,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """
        Get user's conversations with pagination
        """
        user_conversations = [
            conv for conv in self._mock_conversations 
            if conv["userId"] == user_id and conv["isActive"]
        ]
        
        # Sort by last message time (most recent first)
        user_conversations.sort(
            key=lambda x: x.get("lastMessageAt", x["updatedAt"]), 
            reverse=True
        )
        
        return user_conversations[offset:offset + limit]
    
    async def create_conversation(self, conversation: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new conversation
        """
        self._mock_conversations.append(conversation)
        return copy.deepcopy(conversation)
    
    async def get_conversation_by_id(
        self,
        conversation_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific conversation by ID
        """
        for conv in self._mock_conversations:
            if conv["id"] == conversation_id and conv["userId"] == user_id and conv["isActive"]:
                return copy.deepcopy(conv)
        return None
    
    async def add_messages_to_conversation(
        self,
        conversation_id: str,
        user_id: str,
        messages: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Add messages to a conversation
        """
        for i, conv in enumerate(self._mock_conversations):
            if conv["id"] == conversation_id and conv["userId"] == user_id:
                self._mock_conversations[i]["messages"].extend(messages)
                self._mock_conversations[i]["messageCount"] = len(self._mock_conversations[i]["messages"])
                self._mock_conversations[i]["lastMessageAt"] = messages[-1]["timestamp"]
                self._mock_conversations[i]["updatedAt"] = datetime.utcnow().isoformat()
                return copy.deepcopy(self._mock_conversations[i])
        
        raise ValueError("Conversation not found")
    
    async def update_conversation(
        self,
        conversation_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a conversation
        """
        for i, conv in enumerate(self._mock_conversations):
            if conv["id"] == conversation_id and conv["userId"] == user_id:
                # Update allowed fields
                allowed_fields = ["title", "titleAr", "titleFr", "category"]
                for field in allowed_fields:
                    if field in update_data:
                        self._mock_conversations[i][field] = update_data[field]
                
                self._mock_conversations[i]["updatedAt"] = datetime.utcnow().isoformat()
                return copy.deepcopy(self._mock_conversations[i])
        
        raise ValueError("Conversation not found")
    
    async def delete_conversation(self, conversation_id: str, user_id: str) -> None:
        """
        Delete a conversation (soft delete)
        """
        for i, conv in enumerate(self._mock_conversations):
            if conv["id"] == conversation_id and conv["userId"] == user_id:
                self._mock_conversations[i]["isActive"] = False
                self._mock_conversations[i]["updatedAt"] = datetime.utcnow().isoformat()
                return
        
        raise ValueError("Conversation not found")
    
    async def get_message_by_id(
        self,
        message_id: str,
        user_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get a specific message by ID
        """
        for conv in self._mock_conversations:
            if conv["userId"] == user_id and conv["isActive"]:
                for message in conv["messages"]:
                    if message["id"] == message_id:
                        return copy.deepcopy(message)
        return None
    
    async def update_message(
        self,
        message_id: str,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a message
        """
        for conv in self._mock_conversations:
            if conv["userId"] == user_id and conv["isActive"]:
                for i, message in enumerate(conv["messages"]):
                    if message["id"] == message_id:
                        # Update allowed fields
                        if "content" in update_data:
                            conv["messages"][i]["content"] = update_data["content"]
                            conv["messages"][i]["isEdited"] = True
                        
                        return copy.deepcopy(conv["messages"][i])
        
        raise ValueError("Message not found")
    
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
        replies = copy.deepcopy(self._mock_quick_replies)
        
        # Apply filters
        if category:
            replies = [r for r in replies if r["category"] == category]
        
        if sector:
            replies = [r for r in replies if r["sector"] == sector]
        
        if popular_only:
            replies = [r for r in replies if r["isPopular"]]
        
        # Sort by usage count (most popular first)
        replies.sort(key=lambda x: x["usageCount"], reverse=True)
        
        # Limit results
        replies = replies[:limit]
        
        # Return appropriate language text
        for reply in replies:
            if language == "ar":
                reply["displayText"] = reply["textAr"]
            elif language == "fr":
                reply["displayText"] = reply["textFr"]
            else:
                reply["displayText"] = reply["text"]
        
        return replies
    
    async def record_quick_reply_usage(self, reply_id: str, user_id: str) -> None:
        """
        Record usage of a quick reply
        """
        for reply in self._mock_quick_replies:
            if reply["id"] == reply_id:
                reply["usageCount"] += 1
                break
    
    async def get_conversation_analytics(
        self,
        user_id: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get conversation analytics for the user
        """
        user_conversations = [
            conv for conv in self._mock_conversations 
            if conv["userId"] == user_id and conv["isActive"]
        ]
        
        # Calculate analytics
        total_conversations = len(user_conversations)
        total_messages = sum(conv["messageCount"] for conv in user_conversations)
        
        # Mock analytics data
        return {
            "totalConversations": total_conversations,
            "totalMessages": total_messages,
            "averageMessagesPerConversation": total_messages / max(total_conversations, 1),
            "mostActiveCategory": "business_law",
            "conversationsByCategory": {
                "business_law": total_conversations // 2,
                "tax_law": total_conversations // 4,
                "labor_law": total_conversations // 4
            },
            "dailyActivity": [
                {
                    "date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"),
                    "conversations": max(0, total_conversations // days + (i % 3) - 1),
                    "messages": max(0, total_messages // days + (i % 5) - 2)
                }
                for i in range(days)
            ]
        }