from fastapi import APIRouter

api_router = APIRouter()

# Import and include routers when they are created
# from .auth import router as auth_router
from .legal import router as legal_router
# from .chat import router as chat_router
# from .audio import router as audio_router

# api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(legal_router, prefix="/legal", tags=["legal"])
# api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
# api_router.include_router(audio_router, prefix="/audio", tags=["audio"])