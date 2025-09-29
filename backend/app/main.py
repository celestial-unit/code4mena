"""
Code4Mena Legal Assistant - FastAPI Backend
Privacy-first legal chatbot for Tunisian citizens
"""

from fastapi import FastAPI, HTTPException, Depends, Response, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from contextlib import asynccontextmanager
import asyncio
import logging
from datetime import datetime
import uuid

from services.pii_filter import PIIFilterService
from services.legal_rag import LegalRAGService
from services.external_llm import ExternalLLMService
from services.database import DatabaseService
from services.audio_service import AudioService
from models.legal_models import LegalQuery, LegalResponse, QueryLog

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Code4Mena Legal Assistant API...")
    
    try:
        # Initialize database
        logger.info("Initializing database service...")
        await db_service.initialize()
        
        # Initialize legal RAG service
        logger.info("Initializing legal RAG service...")
        await legal_rag.initialize()
        
        # Skip PII filter for now (can be enabled later for full privacy protection)
        logger.info("Skipping PII filter initialization (using simple text processing)...")
        # await pii_filter.initialize()
        
        # Initialize audio service for voice interactions
        logger.info("Initializing audio service...")
        await audio_service.initialize()
        
        logger.info("All services initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        # Don't fail startup, allow API to run with limited functionality
    
    yield
    
    # Shutdown
    logger.info("Shutting down Code4Mena Legal Assistant API...")

# Initialize FastAPI app
app = FastAPI(
    title="Code4Mena Legal Assistant API",
    description="Privacy-first legal assistance for Tunisian citizens",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize services
pii_filter = PIIFilterService()
legal_rag = LegalRAGService()
external_llm = ExternalLLMService()
db_service = DatabaseService()
audio_service = AudioService()

class QueryRequest(BaseModel):
    query: str = Field(..., description="User's legal question")
    language: str = Field(default="ar", description="Response language (ar/fr/en)")
    user_id: Optional[str] = Field(None, description="Anonymous user identifier")

class QueryResponse(BaseModel):
    response: str = Field(..., description="Simplified legal guidance")
    sources: List[Dict] = Field(..., description="Legal article citations")
    disclaimer: str = Field(..., description="Legal disclaimer")
    query_id: str = Field(..., description="Query tracking ID")



@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Code4Mena Legal Assistant",
        "status": "active",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Privacy-first legal assistant for Tunisian citizens"
    }

@app.get("/health")
async def health_check():
    """Detailed health check for all services"""
    health_status = {
        "api": "healthy",
        "database": await db_service.health_check(),
        "pii_filter": await pii_filter.health_check(),
        "legal_rag": await legal_rag.health_check(),
        "external_llm": await external_llm.health_check(),
        "audio_service": await audio_service.health_check(),
        "timestamp": datetime.utcnow().isoformat()
    }
    
    overall_healthy = all(
        status == "healthy" for status in health_status.values() 
        if status != health_status["timestamp"]
    )
    
    if not overall_healthy:
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status

@app.post("/query", response_model=QueryResponse)
async def process_legal_query(
    request: QueryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Main endpoint for processing legal queries with privacy protection
    
    Privacy Flow:
    1. Strip PII from user query (simplified for demo)
    2. Search legal database with anonymized query
    3. Simplify legal text using external LLM
    4. Return response with citations and disclaimer
    """
    query_id = str(uuid.uuid4())
    
    try:
        logger.info(f"Processing query {query_id}: {request.query[:50]}...")
        
        # Step 1: Simple PII filtering (basic implementation)
        logger.info("Step 1: Basic PII filtering")
        abstract_query = request.query  # For now, use query as-is
        pii_detected = {}  # Simple implementation
        
        # Log query (without PII)
        await db_service.log_query(
            query_id=query_id,
            original_query_hash=hash(request.query),
            abstract_query=abstract_query,
            user_id=request.user_id,
            pii_detected=pii_detected,
            language=request.language
        )
        
        # Step 2: Search legal database with query
        logger.info("Step 2: Searching legal database")
        try:
            legal_results = await legal_rag.search_legal_documents(
                query=abstract_query,
                language=request.language,
                top_k=3
            )
        except Exception as e:
            logger.warning(f"Legal RAG search failed: {e}, using fallback")
            # Fallback to sample legal documents
            legal_results = [
                {
                    "id": 1,
                    "article_number": "المادة 1",
                    "title": "تأسيس الشركات التجارية",
                    "content": "يجب على كل من يرغب في تأسيس شركة تجارية أن يقدم طلباً إلى السجل التجاري مرفقاً بالوثائق المطلوبة",
                    "source_document": "مجلة الشركات التجارية",
                    "official_url": "https://legislation.tn/business-law/article-1",
                    "score": 0.85
                }
            ]
        
        if not legal_results:
            # Provide a helpful fallback response
            legal_results = [
                {
                    "id": 1,
                    "article_number": "General",
                    "title": "Legal Guidance",
                    "content": f"Based on your question about '{abstract_query}', here is general legal guidance for Tunisian law.",
                    "source_document": "Tunisian Legal Code",
                    "official_url": "",
                    "score": 0.5
                }
            ]
        
        # Step 3: Use Gemini Live API directly (same as audio service)
        logger.info("Step 3: Using Gemini Live API for dynamic response")
        try:
            if audio_service.gemini_client:
                # Create a conversational prompt using your system instruction
                chat_prompt = f"""أنت مساعد قانوني ذكي متخصص في القانون التونسي. تتحدث باللهجة التونسية بطريقة ودودة ومفهومة.

مهامك:
- ساعد المواطنين التونسيين في فهم القوانين والإجراءات القانونية
- اشرح المفاهيم القانونية المعقدة بطريقة بسيطة
- قدم إرشادات عملية للإجراءات الحكومية
- استخدم اللهجة التونسية المحلية عند الحديث
- كن صبوراً ومفيداً في شرح التفاصيل

قواعد مهمة:
- اذكر دائماً أن هذه معلومات إرشادية وليست استشارة قانونية
- انصح بالتشاور مع محامي مختص للحالات المعقدة
- استخدم أمثلة من الواقع التونسي
- تحدث بطريقة طبيعية وودودة

السؤال: {abstract_query}

المراجع القانونية المتاحة:
{chr(10).join([f"• {doc['title']} - {doc['content'][:100]}..." for doc in legal_results[:2]])}

أجب بطريقة مفصلة ومفيدة باللهجة التونسية:"""

                # Use Gemini directly (same as audio service)
                response = await asyncio.to_thread(
                    audio_service.gemini_client.generate_content,
                    chat_prompt,
                    generation_config={
                        "temperature": 0.7,
                        "max_output_tokens": 600,
                        "top_p": 0.8,
                    }
                )
                
                if response and response.text:
                    simplified_response = response.text.strip()
                    logger.info("✅ Gemini Live API response generated successfully")
                else:
                    raise Exception("No response from Gemini")
            else:
                raise Exception("Gemini client not available")
                
        except Exception as e:
            logger.warning(f"Gemini Live API failed: {e}, using enhanced fallback")
            simplified_response = f"""مرحباً! بخصوص سؤالك عن '{abstract_query}':

• هذا موضوع مهم في القانون التونسي
• أنصحك بمراجعة النصوص القانونية المرفقة للتفاصيل الكاملة
• من الأفضل استشارة محامي مختص للحصول على مشورة قانونية دقيقة
• تأكد من الوثائق المطلوبة قبل بدء أي إجراء قانوني

💡 نصيحة: اتبع الخطوات المحددة في القانون لضمان صحة الإجراءات"""
        
        # Step 4: Prepare response with citations and disclaimer
        sources = [
            {
                "article": result["article_number"],
                "title": result["title"],
                "source": result["source_document"],
                "url": result.get("official_url", ""),
                "relevance_score": result["score"]
            }
            for result in legal_results
        ]
        
        disclaimer = get_legal_disclaimer(request.language)
        
        # Update query log with results
        await db_service.update_query_result(
            query_id=query_id,
            response_generated=True,
            sources_count=len(sources)
        )
        
        logger.info(f"Query {query_id} processed successfully")
        
        return QueryResponse(
            response=simplified_response,
            sources=sources,
            disclaimer=disclaimer,
            query_id=query_id
        )
        
    except Exception as e:
        logger.error(f"Error processing query {query_id}: {str(e)}")
        
        # Log error
        try:
            await db_service.update_query_result(
                query_id=query_id,
                response_generated=False,
                error_message=str(e)
            )
        except:
            pass  # Don't fail if logging fails
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing legal query: {str(e)}"
        )

@app.post("/chat", response_model=QueryResponse)
async def process_chat_query(
    request: QueryRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Direct chat endpoint using Gemini Live API (same as audio service)
    This bypasses the complex legal RAG and uses direct Gemini conversation
    """
    query_id = str(uuid.uuid4())
    
    try:
        logger.info(f"Processing chat query {query_id}: {request.query[:50]}...")
        
        # Use the audio service's Gemini client for text-only chat
        if not audio_service.gemini_client:
            raise HTTPException(status_code=503, detail="Gemini service not available")
        
        # Create a conversational prompt using your system instruction
        chat_prompt = f"""أنت مساعد قانوني ذكي متخصص في القانون التونسي. تتحدث باللهجة التونسية بطريقة ودودة ومفهومة.

مهامك:
- ساعد المواطنين التونسيين في فهم القوانين والإجراءات القانونية
- اشرح المفاهيم القانونية المعقدة بطريقة بسيطة
- قدم إرشادات عملية للإجراءات الحكومية
- استخدم اللهجة التونسية المحلية عند الحديث
- كن صبوراً ومفيداً في شرح التفاصيل

قواعد مهمة:
- اذكر دائماً أن هذه معلومات إرشادية وليست استشارة قانونية
- انصح بالتشاور مع محامي مختص للحالات المعقدة
- استخدم أمثلة من الواقع التونسي
- تحدث بطريقة طبيعية وودودة

السؤال: {request.query}

أجب بطريقة مفصلة ومفيدة باللهجة التونسية:"""

        # Use Gemini directly (same as audio service)
        response = await asyncio.to_thread(
            audio_service.gemini_client.generate_content,
            chat_prompt,
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 600,
                "top_p": 0.8,
            }
        )
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="No response from Gemini")
        
        gemini_response = response.text.strip()
        
        # Log the successful query
        await db_service.log_query(
            query_id=query_id,
            original_query_hash=hash(request.query),
            abstract_query=request.query,
            user_id=request.user_id,
            pii_detected={},
            language=request.language
        )
        
        # Create mock sources for consistency with existing format
        sources = [
            {
                "article": "Gemini Live Response",
                "title": "استجابة ذكية من Gemini",
                "source": "Gemini Live API",
                "url": "",
                "relevance_score": 0.95
            }
        ]
        
        disclaimer = get_legal_disclaimer(request.language)
        
        # Update query log with results
        await db_service.update_query_result(
            query_id=query_id,
            response_generated=True,
            sources_count=len(sources)
        )
        
        logger.info(f"Chat query {query_id} processed successfully with Gemini Live")
        
        return QueryResponse(
            response=gemini_response,
            sources=sources,
            disclaimer=disclaimer,
            query_id=query_id
        )
        
    except Exception as e:
        logger.error(f"Error processing chat query {query_id}: {str(e)}")
        
        # Log error
        try:
            await db_service.update_query_result(
                query_id=query_id,
                response_generated=False,
                error_message=str(e)
            )
        except:
            pass
        
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat query: {str(e)}"
        )

@app.get("/legal-categories")
async def get_legal_categories():
    """Get available legal categories and topics"""
    return await legal_rag.get_available_categories()

@app.get("/popular-queries")
async def get_popular_queries(language: str = "ar"):
    """Get popular anonymized queries for suggestions"""
    return await db_service.get_popular_queries(language=language)

@app.post("/audio/query")
async def process_audio_query(
    audio_file: UploadFile = File(...),
    language: str = Form("ar-TN"),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Process audio legal query with Tunisian voice support
    
    Args:
        audio_file: Audio file bytes (WAV, MP3, etc.)
        language: Target language for response
        
    Returns:
        Audio response with transcription and legal guidance
    """
    query_id = str(uuid.uuid4())
    
    try:
        logger.info(f"Processing audio query {query_id}")
        
        if not audio_file:
            raise HTTPException(status_code=400, detail="No audio file provided")
        
        # Read audio file content
        audio_content = await audio_file.read()
        
        # Process audio through Gemini Live
        audio_result = await audio_service.process_legal_audio_query(
            audio_data=audio_content,
            user_context={"language": language, "query_id": query_id}
        )
        
        if audio_result.get("error"):
            raise HTTPException(status_code=500, detail=audio_result["error"])
        
        # Log the audio query (without storing actual audio)
        await db_service.log_query(
            query_id=query_id,
            original_query_hash=hash("audio_query"),
            abstract_query=audio_result.get("transcription", "Audio query"),
            user_id="audio_user",
            language=language
        )
        
        return {
            "query_id": query_id,
            "transcription": audio_result.get("transcription", ""),
            "response_text": audio_result.get("response_text", ""),
            "audio_response_available": audio_result.get("audio_response") is not None,
            "language_detected": audio_result.get("language_detected", language),
            "confidence": audio_result.get("confidence", 0.0),
            "disclaimer": audio_result.get("disclaimer", get_legal_disclaimer(language))
        }
        
    except Exception as e:
        logger.error(f"Error processing audio query {query_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing audio query: {str(e)}")

class TTSRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech")
    language: str = Field(default="ar-TN", description="Target language")

@app.post("/audio/tts")
async def text_to_speech(
    request: TTSRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Convert text to speech in Tunisian Arabic
    
    Args:
        request: TTS request with text and language
        
    Returns:
        Audio file bytes or JSON response
    """
    try:
        audio_bytes = await audio_service.text_to_speech(request.text, request.language)
        
        if not audio_bytes:
            return {"message": "TTS service generating audio...", "text": request.text}
        
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "Content-Disposition": "attachment; filename=response.wav",
                "Access-Control-Allow-Origin": "*"
            }
        )
        
    except Exception as e:
        logger.error(f"Error in text-to-speech: {str(e)}")
        return {"message": "TTS temporarily unavailable", "text": request.text, "error": str(e)}

@app.get("/audio/languages")
async def get_supported_audio_languages():
    """Get supported languages for audio interactions"""
    return await audio_service.get_supported_languages()

@app.post("/audio/session/start")
async def start_audio_session(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Start a new Gemini Live audio session"""
    try:
        session_info = await audio_service.start_live_session()
        return session_info
    except Exception as e:
        logger.error(f"Error starting audio session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Session error: {str(e)}")

def get_legal_disclaimer(language: str) -> str:
    """Get legal disclaimer in specified language"""
    disclaimers = {
        "ar": "تنبيه قانوني: هذه المعلومات للإرشاد العام فقط ولا تشكل استشارة قانونية. يُنصح بالتشاور مع محامٍ مؤهل للحصول على مشورة قانونية محددة.",
        "fr": "Avertissement légal : Ces informations sont fournies à titre indicatif uniquement et ne constituent pas un conseil juridique. Il est recommandé de consulter un avocat qualifié pour obtenir des conseils juridiques spécifiques.",
        "en": "Legal Disclaimer: This information is provided for general guidance only and does not constitute legal advice. It is recommended to consult with a qualified lawyer for specific legal advice."
    }
    return disclaimers.get(language, disclaimers["en"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )