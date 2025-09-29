"""
Audio API endpoints for Tunisia-specific Gemini Live API integration
Handles voice queries, text-to-speech, and audio processing for legal assistance
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Optional
import io
import logging

from ...services.audio_service import AudioService

logger = logging.getLogger(__name__)

router = APIRouter()

def get_audio_service() -> AudioService:
    """Dependency to get audio service instance"""
    return AudioService()

@router.post("/query")
async def process_audio_query(
    audio_file: UploadFile = File(..., description="Audio file (webm, wav, mp3, ogg)"),
    language: str = Form("ar-TN", description="Expected language of the audio"),
    user_id: Optional[str] = Form(None, description="Optional user ID for context"),
    audio_service: AudioService = Depends(get_audio_service)
) -> Dict[str, Any]:
    """
    Process audio query and return transcription with legal response
    
    Args:
        audio_file: Audio file upload
        language: Expected language (ar-TN, ar, fr, en)
        user_id: Optional user ID for personalization
        
    Returns:
        Dict containing transcription, response text, audio response, and metadata
    """
    try:
        # Validate file type
        if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Please upload an audio file (webm, wav, mp3, ogg)"
            )
        
        # Check file size (limit to 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        audio_data = await audio_file.read()
        
        if len(audio_data) > max_size:
            raise HTTPException(
                status_code=413,
                detail="Audio file too large. Maximum size is 10MB"
            )
        
        if len(audio_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty audio file received"
            )
        
        # Check for mock data (development/testing)
        if audio_data == b'mock audio data':
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Mock audio data detected",
                    "message": "ميزة التسجيل الصوتي قيد التطوير حالياً. يرجى استخدام الكتابة النصية.",
                    "fallback": "يمكنك كتابة سؤالك في المحادثة النصية كبديل.",
                    "status": "audio_recording_not_implemented"
                }
            )
        
        logger.info(f"Processing audio query: {len(audio_data)} bytes, type: {audio_file.content_type}")
        
        # Initialize audio service if needed
        if not hasattr(audio_service, 'gemini_client') or audio_service.gemini_client is None:
            await audio_service.initialize()
        
        # Process the audio query with legal context
        user_context = {"user_id": user_id, "language": language} if user_id else {"language": language}
        
        result = await audio_service.process_legal_audio_query(
            audio_data=audio_data,
            user_context=user_context
        )
        
        # Add request metadata
        result.update({
            "query_id": f"audio_{hash(audio_data) % 1000000}",
            "file_info": {
                "filename": audio_file.filename,
                "content_type": audio_file.content_type,
                "size_bytes": len(audio_data)
            }
        })
        
        logger.info(f"Audio query processed successfully: {result.get('transcription', '')[:50]}...")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing audio query: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to process audio query",
                "message": "عذراً، حدث خطأ في معالجة الاستفسار الصوتي. يرجى المحاولة مرة أخرى.",
                "fallback": "يمكنك كتابة سؤالك في المحادثة النصية كبديل.",
                "details": str(e)
            }
        )

@router.post("/tts")
async def text_to_speech(
    text: str = Form(..., description="Text to convert to speech"),
    language: str = Form("ar-TN", description="Target language for speech"),
    voice_name: str = Form("Aoede", description="Voice name to use"),
    audio_service: AudioService = Depends(get_audio_service)
) -> StreamingResponse:
    """
    Convert text to speech using Gemini's audio generation
    
    Args:
        text: Text to convert to speech
        language: Target language (ar-TN, ar, fr, en)
        voice_name: Voice configuration
        
    Returns:
        StreamingResponse with audio data
    """
    try:
        if not text or len(text.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Text content is required for text-to-speech conversion"
            )
        
        if len(text) > 1000:
            raise HTTPException(
                status_code=400,
                detail="Text too long. Maximum length is 1000 characters"
            )
        
        logger.info(f"Generating speech for text: {text[:50]}...")
        
        # Initialize audio service if needed
        if not hasattr(audio_service, 'gemini_client') or audio_service.gemini_client is None:
            await audio_service.initialize()
        
        # Generate audio
        audio_data = await audio_service.text_to_speech(text=text, language=language)
        
        if not audio_data or len(audio_data) == 0:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to generate audio",
                    "message": "عذراً، لم أتمكن من تحويل النص إلى صوت. يرجى المحاولة مرة أخرى.",
                    "fallback": "يمكنك قراءة النص المكتوب أدناه.",
                    "text": text
                }
            )
        
        logger.info(f"Generated audio response: {len(audio_data)} bytes")
        
        # Return audio as streaming response
        audio_stream = io.BytesIO(audio_data)
        
        return StreamingResponse(
            audio_stream,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=response.wav",
                "Content-Length": str(len(audio_data)),
                "Cache-Control": "no-cache"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in text-to-speech: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Text-to-speech conversion failed",
                "message": "عذراً، حدث خطأ في تحويل النص إلى صوت.",
                "details": str(e)
            }
        )

@router.get("/languages")
async def get_supported_languages(
    audio_service: AudioService = Depends(get_audio_service)
) -> Dict[str, str]:
    """
    Get list of supported languages for voice interaction
    
    Returns:
        Dict mapping language codes to display names
    """
    try:
        languages = await audio_service.get_supported_languages()
        return {
            "success": True,
            "message": "Supported languages retrieved successfully",
            "data": languages
        }
    except Exception as e:
        logger.error(f"Error getting supported languages: {e}")
        # Return fallback languages even if service fails
        return {
            "success": False,
            "message": "Using fallback language list",
            "data": {
                "ar-TN": "العربية التونسية (Tunisian Arabic)",
                "ar": "العربية الفصحى (Modern Standard Arabic)", 
                "fr-TN": "Français Tunisien (Tunisian French)",
                "fr": "Français (French)",
                "en": "English"
            },
            "error": str(e)
        }

@router.get("/health")
async def audio_health_check(
    audio_service: AudioService = Depends(get_audio_service)
) -> Dict[str, Any]:
    """
    Check audio service health and availability
    
    Returns:
        Health status with details about service availability
    """
    try:
        # Initialize service if needed
        if not hasattr(audio_service, 'gemini_client'):
            await audio_service.initialize()
        
        # Perform health check
        health_status = await audio_service.health_check()
        
        # Parse health status
        is_healthy = health_status == "healthy"
        gemini_available = audio_service.gemini_client is not None
        
        supported_languages = await audio_service.get_supported_languages()
        
        return {
            "status": "healthy" if is_healthy else "unhealthy",
            "details": health_status,
            "gemini_available": gemini_available,
            "supported_languages": list(supported_languages.keys()),
            "features": {
                "audio_query": gemini_available,
                "text_to_speech": gemini_available,
                "tunisian_dialect": True,
                "multi_language": True
            },
            "configuration": {
                "max_file_size_mb": 10,
                "supported_formats": ["webm", "wav", "mp3", "ogg"],
                "default_language": "ar-TN",
                "voice_name": "Aoede"
            }
        }
        
    except Exception as e:
        logger.error(f"Audio health check failed: {e}")
        return {
            "status": "unhealthy",
            "details": f"Health check failed: {str(e)}",
            "gemini_available": False,
            "supported_languages": [],
            "error": str(e)
        }

@router.get("/config")
async def get_audio_config() -> Dict[str, Any]:
    """
    Get audio service configuration and limits
    
    Returns:
        Configuration details for client applications
    """
    return {
        "max_file_size_mb": 10,
        "supported_formats": ["webm", "wav", "mp3", "ogg"],
        "supported_languages": {
            "ar-TN": "العربية التونسية (Tunisian Arabic)",
            "ar": "العربية الفصحى (Modern Standard Arabic)", 
            "fr-TN": "Français Tunisien (Tunisian French)",
            "fr": "Français (French)",
            "en": "English"
        },
        "default_language": "ar-TN",
        "voice_config": {
            "default_voice": "Aoede",
            "available_voices": ["Aoede"]
        },
        "features": {
            "real_time_processing": True,
            "legal_context": True,
            "tunisia_specific": True,
            "multi_language": True,
            "fallback_text": True
        },
        "rate_limits": {
            "requests_per_minute": 30,
            "max_concurrent": 5
        }
    }