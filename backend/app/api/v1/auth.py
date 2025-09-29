"""
Authentication API endpoints for user management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from datetime import datetime, timedelta

from ...services.auth_service import AuthService
from ...models.legal_models import LanguageCode

router = APIRouter()
security = HTTPBearer()

def get_auth_service() -> AuthService:
    """Dependency to get auth service instance"""
    return AuthService()

@router.post("/register", response_model=dict)
async def register_user(
    user_data: dict,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Register a new user
    """
    try:
        user = await auth_service.register_user(user_data)
        return {
            "success": True,
            "user": user,
            "message": "User registered successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=dict)
async def login_user(
    credentials: dict,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Authenticate user and return access token
    """
    try:
        email = credentials.get("email")
        password = credentials.get("password")
        
        if not email or not password:
            raise HTTPException(
                status_code=400, 
                detail="Email and password are required"
            )
        
        result = await auth_service.authenticate_user(email, password)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/logout", response_model=dict)
async def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Logout user and invalidate token
    """
    try:
        await auth_service.logout_user(credentials.credentials)
        return {
            "success": True,
            "message": "Logged out successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")

@router.get("/me", response_model=dict)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Get current user profile
    """
    try:
        user = await auth_service.get_current_user(credentials.credentials)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

@router.put("/me", response_model=dict)
async def update_user_profile(
    profile_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Update current user profile
    """
    try:
        user = await auth_service.get_current_user(credentials.credentials)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        updated_user = await auth_service.update_user_profile(user["id"], profile_data)
        return {
            "success": True,
            "user": updated_user,
            "message": "Profile updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")

@router.post("/refresh", response_model=dict)
async def refresh_token(
    refresh_data: dict,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Refresh access token using refresh token
    """
    try:
        refresh_token = refresh_data.get("refresh_token")
        if not refresh_token:
            raise HTTPException(status_code=400, detail="Refresh token is required")
        
        result = await auth_service.refresh_access_token(refresh_token)
        return result
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    email_data: dict,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Send password reset email
    """
    try:
        email = email_data.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        await auth_service.send_password_reset(email)
        return {
            "success": True,
            "message": "Password reset email sent"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")

@router.post("/reset-password", response_model=dict)
async def reset_password(
    reset_data: dict,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Reset password using reset token
    """
    try:
        token = reset_data.get("token")
        new_password = reset_data.get("new_password")
        
        if not token or not new_password:
            raise HTTPException(
                status_code=400, 
                detail="Reset token and new password are required"
            )
        
        await auth_service.reset_password(token, new_password)
        return {
            "success": True,
            "message": "Password reset successfully"
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password reset failed: {str(e)}")

@router.get("/users/{user_id}", response_model=dict)
async def get_user_by_id(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Get user by ID (admin or self only)
    """
    try:
        current_user = await auth_service.get_current_user(credentials.credentials)
        if not current_user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        # Check if user is requesting their own data or is admin
        if current_user["id"] != user_id and not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Access denied")
        
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

@router.get("/users", response_model=dict)
async def get_users(
    page: int = 1,
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Get users list (admin only)
    """
    try:
        current_user = await auth_service.get_current_user(credentials.credentials)
        if not current_user or not current_user.get("is_admin", False):
            raise HTTPException(status_code=403, detail="Admin access required")
        
        users = await auth_service.get_users(page=page, limit=limit)
        return users
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")

@router.put("/users/{user_id}/preferences", response_model=dict)
async def update_user_preferences(
    user_id: str,
    preferences: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Update user preferences
    """
    try:
        current_user = await auth_service.get_current_user(credentials.credentials)
        if not current_user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        # Check if user is updating their own preferences
        if current_user["id"] != user_id:
            raise HTTPException(status_code=403, detail="Can only update own preferences")
        
        updated_user = await auth_service.update_user_preferences(user_id, preferences)
        return {
            "success": True,
            "user": updated_user,
            "message": "Preferences updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update preferences: {str(e)}")

@router.get("/users/{user_id}/statistics", response_model=dict)
async def get_user_statistics(
    user_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Get user statistics
    """
    try:
        current_user = await auth_service.get_current_user(credentials.credentials)
        if not current_user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        # Check if user is requesting their own stats
        if current_user["id"] != user_id:
            raise HTTPException(status_code=403, detail="Can only view own statistics")
        
        stats = await auth_service.get_user_statistics(user_id)
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")