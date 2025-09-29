"""
Mascot API endpoints for dynamic mascot management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any

from ...services.mascot_service import MascotService
from ...services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

def get_mascot_service() -> MascotService:
    """Dependency to get mascot service instance"""
    return MascotService()

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

@router.get("/mascots", response_model=List[dict])
async def get_mascots(
    sector: Optional[str] = Query(None, description="Filter by sector"),
    language: str = Query("ar", description="Language for mascot names and descriptions"),
    include_locked: bool = Query(False, description="Include locked mascots"),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Get available mascots
    """
    try:
        mascots = await mascot_service.get_mascots(
            sector=sector,
            language=language,
            include_locked=include_locked
        )
        return mascots
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch mascots: {str(e)}")

@router.get("/mascots/{mascot_id}", response_model=dict)
async def get_mascot(
    mascot_id: str,
    language: str = Query("ar", description="Language for mascot details"),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Get a specific mascot by ID
    """
    try:
        mascot = await mascot_service.get_mascot_by_id(mascot_id, language=language)
        if not mascot:
            raise HTTPException(status_code=404, detail="Mascot not found")
        return mascot
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch mascot: {str(e)}")

@router.get("/mascots/sector/{sector}", response_model=dict)
async def get_mascot_by_sector(
    sector: str,
    language: str = Query("ar", description="Language for mascot details"),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Get mascot for a specific sector
    """
    try:
        mascot = await mascot_service.get_mascot_by_sector(sector, language=language)
        if not mascot:
            raise HTTPException(status_code=404, detail="No mascot found for this sector")
        return mascot
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch mascot: {str(e)}")

@router.get("/mascots/{mascot_id}/animations", response_model=List[dict])
async def get_mascot_animations(
    mascot_id: str,
    animation_type: Optional[str] = Query(None, description="Filter by animation type"),
    language: str = Query("ar", description="Language for animation descriptions"),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Get animations for a specific mascot
    """
    try:
        animations = await mascot_service.get_mascot_animations(
            mascot_id=mascot_id,
            animation_type=animation_type,
            language=language
        )
        return animations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch animations: {str(e)}")

@router.get("/mascots/{mascot_id}/customizations", response_model=List[dict])
async def get_mascot_customizations(
    mascot_id: str,
    user_id: str = Depends(get_current_user_id),
    language: str = Query("ar", description="Language for customization descriptions"),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Get customizations for a specific mascot
    """
    try:
        customizations = await mascot_service.get_mascot_customizations(
            mascot_id=mascot_id,
            user_id=user_id,
            language=language
        )
        return customizations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch customizations: {str(e)}")

@router.post("/mascots/{mascot_id}/unlock")
async def unlock_mascot(
    mascot_id: str,
    user_id: str = Depends(get_current_user_id),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Unlock a mascot for the user
    """
    try:
        result = await mascot_service.unlock_mascot(mascot_id, user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unlock mascot: {str(e)}")

@router.post("/mascots/{mascot_id}/customizations/{customization_id}/unlock")
async def unlock_mascot_customization(
    mascot_id: str,
    customization_id: str,
    user_id: str = Depends(get_current_user_id),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Unlock a mascot customization for the user
    """
    try:
        result = await mascot_service.unlock_customization(
            mascot_id=mascot_id,
            customization_id=customization_id,
            user_id=user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unlock customization: {str(e)}")

@router.put("/users/mascot-preferences")
async def update_user_mascot_preferences(
    preferences: dict,
    user_id: str = Depends(get_current_user_id),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Update user's mascot preferences
    """
    try:
        result = await mascot_service.update_user_mascot_preferences(user_id, preferences)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update preferences: {str(e)}")

@router.get("/users/mascot-preferences")
async def get_user_mascot_preferences(
    user_id: str = Depends(get_current_user_id),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Get user's mascot preferences
    """
    try:
        preferences = await mascot_service.get_user_mascot_preferences(user_id)
        return preferences
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch preferences: {str(e)}")

@router.get("/cultural-elements", response_model=List[dict])
async def get_cultural_elements(
    element_type: Optional[str] = Query(None, description="Filter by element type"),
    region: Optional[str] = Query(None, description="Filter by region"),
    language: str = Query("ar", description="Language for element descriptions"),
    mascot_service: MascotService = Depends(get_mascot_service)
):
    """
    Get Tunisian cultural elements used in mascots
    """
    try:
        elements = await mascot_service.get_cultural_elements(
            element_type=element_type,
            region=region,
            language=language
        )
        return elements
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cultural elements: {str(e)}")