"""
Pydantic schemas for chat models
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, validator

from backend.app.models.chat import MessageType, MessageRole, ConversationStatus


# Chat Conversation schemas
class ChatConversationBase(BaseModel):
    """Base chat conversation schema"""
    title: str = Field(..., max_length=255)
    title_ar: Optional[str] = Field(None, max_length=255)
    title_fr: Optional[str] = Field(None, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    language: str = Field(default="ar", max_length=10)
    status: ConversationStatus = ConversationStatus.ACTIVE
    context: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    is_private: bool = True
    shared_with: Optional[List[str]] = None


class ChatConversationCreate(ChatConversationBase):
    """Schema for creating a chat conversation"""
    user_id: UUID


class ChatConversationUpdate(BaseModel):
    """Schema for updating a chat conversation"""
    title: Optional[str] = Field(None, max_length=255)
    title_ar: Optional[str] = Field(None, max_length=255)
    title_fr: Optional[str] = Field(None, max_length=255)
    title_en: Optional[str] = Field(None, max_length=255)
    language: Optional[str] = Field(None, max_length=10)
    status: Optional[ConversationStatus] = None
    context: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    is_private: Optional[bool] = None
    shared_with: Optional[List[str]] = None


class ChatConversationInDB(ChatConversationBase):
    """Schema for chat conversation data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    message_count: int = 0
    total_tokens: int = 0
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime] = None
    archived_at: Optional[datetime] = None


class ChatConversation(ChatConversationInDB):
    """Public chat conversation schema"""
    pass


class ChatConversationWithMessages(ChatConversation):
    """Chat conversation schema with messages"""
    messages: List['ChatMessage'] = []


# Chat Message schemas
class ChatMessageBase(BaseModel):
    """Base chat message schema"""
    content: str = Field(..., min_length=1)
    content_ar: Optional[str] = None
    content_fr: Optional[str] = None
    content_en: Optional[str] = None
    role: MessageRole
    message_type: MessageType = MessageType.TEXT
    attachments: Optional[List[Dict[str, Any]]] = None
    media_urls: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class ChatMessageCreate(ChatMessageBase):
    """Schema for creating a chat message"""
    conversation_id: UUID
    sequence_number: Optional[int] = None


class ChatMessageUpdate(BaseModel):
    """Schema for updating a chat message"""
    content: Optional[str] = Field(None, min_length=1)
    content_ar: Optional[str] = None
    content_fr: Optional[str] = None
    content_en: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None
    media_urls: Optional[List[str]] = None
    is_edited: Optional[bool] = None
    is_deleted: Optional[bool] = None
    is_flagged: Optional[bool] = None
    user_rating: Optional[int] = Field(None, ge=1, le=5)
    user_feedback: Optional[str] = None
    helpful: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class ChatMessageInDB(ChatMessageBase):
    """Schema for chat message data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    conversation_id: UUID
    sequence_number: int
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    model_used: Optional[str] = None
    processing_time_ms: Optional[int] = None
    is_edited: bool = False
    is_deleted: bool = False
    is_flagged: bool = False
    error_occurred: bool = False
    error_message: Optional[str] = None
    user_rating: Optional[int] = None
    user_feedback: Optional[str] = None
    helpful: Optional[bool] = None
    created_at: datetime
    updated_at: datetime
    edited_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None


class ChatMessage(ChatMessageInDB):
    """Public chat message schema"""
    pass


# Chat Template schemas
class ChatTemplateBase(BaseModel):
    """Base chat template schema"""
    name: str = Field(..., max_length=255)
    name_ar: str = Field(..., max_length=255)
    name_fr: Optional[str] = Field(None, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    category: str = Field(..., max_length=100)
    language: str = Field(default="ar", max_length=10)
    initial_messages: List[Dict[str, Any]] = Field(..., min_items=1)
    suggested_responses: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    difficulty_level: Optional[str] = Field(None, max_length=20)
    estimated_duration: Optional[int] = Field(None, ge=1)  # in minutes
    is_active: bool = True
    is_public: bool = True


class ChatTemplateCreate(ChatTemplateBase):
    """Schema for creating a chat template"""
    pass


class ChatTemplateUpdate(BaseModel):
    """Schema for updating a chat template"""
    name: Optional[str] = Field(None, max_length=255)
    name_ar: Optional[str] = Field(None, max_length=255)
    name_fr: Optional[str] = Field(None, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    language: Optional[str] = Field(None, max_length=10)
    initial_messages: Optional[List[Dict[str, Any]]] = None
    suggested_responses: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    difficulty_level: Optional[str] = Field(None, max_length=20)
    estimated_duration: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None


class ChatTemplateInDB(ChatTemplateBase):
    """Schema for chat template data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    usage_count: int = 0
    success_rate: Optional[float] = None
    created_at: datetime
    updated_at: datetime


class ChatTemplate(ChatTemplateInDB):
    """Public chat template schema"""
    pass


# Chat Session schemas
class ChatSessionBase(BaseModel):
    """Base chat session schema"""
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    language: str = Field(default="ar", max_length=10)
    theme: str = Field(default="light", max_length=20)
    is_anonymous: bool = False


class ChatSessionCreate(ChatSessionBase):
    """Schema for creating a chat session"""
    user_id: Optional[UUID] = None
    session_token: str = Field(..., max_length=255)
    expires_at: Optional[datetime] = None


class ChatSessionUpdate(BaseModel):
    """Schema for updating a chat session"""
    language: Optional[str] = Field(None, max_length=10)
    theme: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    last_activity: Optional[datetime] = None


class ChatSessionInDB(ChatSessionBase):
    """Schema for chat session data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    session_token: str
    user_id: Optional[UUID] = None
    conversation_count: int = 0
    message_count: int = 0
    total_tokens: int = 0
    is_active: bool = True
    created_at: datetime
    last_activity: datetime
    expires_at: Optional[datetime] = None


class ChatSession(ChatSessionInDB):
    """Public chat session schema"""
    pass


# Request/Response schemas
class ChatRequest(BaseModel):
    """Schema for chat requests"""
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[UUID] = None
    message_type: MessageType = MessageType.TEXT
    language: str = Field(default="ar", max_length=10)
    attachments: Optional[List[Dict[str, Any]]] = None
    context: Optional[Dict[str, Any]] = None
    
    @validator('message')
    def validate_message(cls, v):
        """Validate and clean message"""
        return v.strip()


class ChatResponse(BaseModel):
    """Schema for chat responses"""
    message_id: UUID
    conversation_id: UUID
    content: str
    role: MessageRole = MessageRole.ASSISTANT
    message_type: MessageType = MessageType.TEXT
    processing_time_ms: Optional[int] = None
    model_used: Optional[str] = None
    tokens_used: Optional[int] = None
    suggestions: Optional[List[str]] = None
    sources: Optional[List[Dict[str, Any]]] = None
    created_at: datetime


class ConversationListRequest(BaseModel):
    """Schema for conversation list requests"""
    user_id: UUID
    status: Optional[ConversationStatus] = None
    language: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    search: Optional[str] = Field(None, max_length=255)


class MessageListRequest(BaseModel):
    """Schema for message list requests"""
    conversation_id: UUID
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)
    before_message_id: Optional[UUID] = None
    after_message_id: Optional[UUID] = None


class ChatAnalytics(BaseModel):
    """Schema for chat analytics"""
    period_days: int
    total_conversations: int
    total_messages: int
    active_users: int
    avg_messages_per_conversation: float
    avg_conversation_duration_minutes: float
    popular_templates: List[Dict[str, Any]]
    language_distribution: List[Dict[str, Any]]
    message_type_distribution: List[Dict[str, Any]]


# Response schemas
class ChatConversationResponse(BaseModel):
    """Standard chat conversation response schema"""
    success: bool
    message: str
    data: Optional[ChatConversation] = None


class ChatConversationsListResponse(BaseModel):
    """Chat conversations list response schema"""
    success: bool
    message: str
    data: List[ChatConversation]
    total: int
    page: int
    per_page: int


class ChatMessageResponse(BaseModel):
    """Standard chat message response schema"""
    success: bool
    message: str
    data: Optional[ChatMessage] = None


class ChatMessagesListResponse(BaseModel):
    """Chat messages list response schema"""
    success: bool
    message: str
    data: List[ChatMessage]
    total: int
    has_more: bool


class ChatTemplateResponse(BaseModel):
    """Standard chat template response schema"""
    success: bool
    message: str
    data: Optional[ChatTemplate] = None


class ChatTemplatesListResponse(BaseModel):
    """Chat templates list response schema"""
    success: bool
    message: str
    data: List[ChatTemplate]
    total: int