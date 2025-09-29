"""
Chat API endpoints for dynamic chat and conversation management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from datetime import datetime

from ...services.chat_service import ChatService
from ...services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

def get_chat_service() -> ChatService:
    """Dependency to get chat service instance"""
    return ChatService()

def get_auth_service() -> AuthService:
    """Dependency to get auth service instance"""
    return AuthService()

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> str:
    """Get current user ID from token"""
    user = await auth_service.get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user["id"]

@router.get("/conversations", response_model=List[dict])
async def get_chat_conversations(
    limit: int = Query(10, ge=1, le=100, description="Number of conversations to return"),
    offset: int = Query(0, ge=0, description="Number of conversations to skip"),
    user_id: str = Depends(get_current_user_id),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Get user's chat conversations
    """
    try:
        conversations = await chat_service.get_user_conversations(
            user_id=user_id,
            limit=limit,
            offset=offset
        )
        return conversations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch conversations: {str(e)}")

@router.post("/conversations", response_model=dict)
async def create_chat_conversation(
    conversation_data: dict,
    user_id: str = Depends(get_current_user_id),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Create a new chat conversation
    """
    try:
        conversation = await chat_service.create_conversation(
            user_id=user_id,
            title=conversation_data.get("title", "New Conversation"),
            category=conversation_data.get("category", "general")
        )
        return conversation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create conversation: {str(e)}")

@router.get("/conversations/{conversation_id}", response_model=dict)
async def get_chat_conversation(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Get a specific chat conversation
    """
    try:
        conversation = await chat_service.get_conversation_by_id(conversation_id, user_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch conversation: {str(e)}")

@router.post("/conversations/{conversation_id}/messages", response_model=dict)
async def send_chat_message(
    conversation_id: str,
    message_data: dict,
    user_id: str = Depends(get_current_user_id),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Send a message in a chat conversation
    """
    try:
        message_content = message_data.get("content")
        if not message_content:
            raise HTTPException(status_code=400, detail="Message content is required")
        
        # Verify user owns the conversation
        conversation = await chat_service.get_conversation_by_id(conversation_id, user_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Send message and get AI response
        updated_conversation = await chat_service.send_message(
            conversation_id=conversation_id,
            user_id=user_id,
            content=message_content,
            language=message_data.get("language", "ar")
        )
        
        return updated_conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.get("/quick-replies", response_model=List[dict])
async def get_quick_replies(
    category: Optional[str] = Query(None, description="Filter by category"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    language: str = Query("ar", description="Language for replies"),
    popular_only: bool = Query(False, description="Return only popular replies"),
    limit: int = Query(20, ge=1, le=100, description="Number of replies to return"),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Get quick reply suggestions
    """
    try:
        quick_replies = await chat_service.get_quick_replies(
            category=category,
            sector=sector,
            language=language,
            popular_only=popular_only,
            limit=limit
        )
        return quick_replies
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch quick replies: {str(e)}")