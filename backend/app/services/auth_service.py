"""
Authentication Service - Business logic for user authentication and management
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import hashlib
import jwt
import uuid

from ..repositories.user_repository import UserRepository

class AuthService:
    """Service class for authentication operations"""
    
    def __init__(self):
        self.repository = UserRepository()
        self.secret_key = "your-secret-key-here"  # In production, use environment variable
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 30
        self.refresh_token_expire_days = 7
    
    async def register_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a new user
        """
        # Validate required fields
        required_fields = ["name", "email", "password"]
        for field in required_fields:
            if field not in user_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Check if user already exists
        existing_user = await self.repository.get_user_by_email(user_data["email"])
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password
        password_hash = self._hash_password(user_data["password"])
        
        # Create user data
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "name": user_data["name"],
            "nameAr": user_data.get("nameAr", user_data["name"]),
            "email": user_data["email"],
            "phone": user_data.get("phone"),
            "avatar": user_data.get("avatar"),
            "password_hash": password_hash,
            "profile": user_data.get("profile", self._get_default_profile()),
            "preferences": user_data.get("preferences", self._get_default_preferences()),
            "achievements": [],
            "statistics": self._get_default_statistics(),
            "createdAt": datetime.utcnow().isoformat(),
            "lastActiveAt": datetime.utcnow().isoformat(),
            "isVerified": False,
            "is_admin": False
        }
        
        # Save user
        created_user = await self.repository.create_user(user)
        
        # Remove password hash from response
        created_user.pop("password_hash", None)
        return created_user
    
    async def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate user and return tokens
        """
        user = await self.repository.get_user_by_email(email)
        if not user:
            raise ValueError("Invalid email or password")
        
        # Verify password
        if not self._verify_password(password, user.get("password_hash", "")):
            raise ValueError("Invalid email or password")
        
        # Generate tokens
        access_token = self._create_access_token(user["id"])
        refresh_token = self._create_refresh_token(user["id"])
        
        # Update last active
        await self.repository.update_last_active(user["id"])
        
        # Remove password hash from response
        user.pop("password_hash", None)
        
        return {
            "success": True,
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": self.access_token_expire_minutes * 60
        }
    
    async def logout_user(self, token: str) -> None:
        """
        Logout user and invalidate token
        """
        # In a real implementation, you would add the token to a blacklist
        # For now, we'll just pass
        pass
    
    async def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Get current user from token
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            if not user_id:
                return None
            
            user = await self.repository.get_user_by_id(user_id)
            if user:
                user.pop("password_hash", None)
            return user
        except jwt.PyJWTError:
            return None
    
    async def update_user_profile(self, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update user profile
        """
        updated_user = await self.repository.update_user_profile(user_id, profile_data)
        if updated_user:
            updated_user.pop("password_hash", None)
        return updated_user
    
    async def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh access token using refresh token
        """
        try:
            payload = jwt.decode(refresh_token, self.secret_key, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            token_type = payload.get("type")
            
            if not user_id or token_type != "refresh":
                raise ValueError("Invalid refresh token")
            
            # Check if user exists
            user = await self.repository.get_user_by_id(user_id)
            if not user:
                raise ValueError("User not found")
            
            # Generate new access token
            access_token = self._create_access_token(user_id)
            
            return {
                "success": True,
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": self.access_token_expire_minutes * 60
            }
        except jwt.PyJWTError:
            raise ValueError("Invalid refresh token")
    
    async def send_password_reset(self, email: str) -> None:
        """
        Send password reset email
        """
        user = await self.repository.get_user_by_email(email)
        if not user:
            # Don't reveal if email exists or not
            return
        
        # In a real implementation, you would:
        # 1. Generate a reset token
        # 2. Store it in the database with expiration
        # 3. Send email with reset link
        pass
    
    async def reset_password(self, token: str, new_password: str) -> None:
        """
        Reset password using reset token
        """
        # In a real implementation, you would:
        # 1. Verify the reset token
        # 2. Get user ID from token
        # 3. Update password
        # 4. Invalidate the reset token
        pass
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user by ID
        """
        user = await self.repository.get_user_by_id(user_id)
        if user:
            user.pop("password_hash", None)
        return user
    
    async def get_users(self, page: int = 1, limit: int = 10) -> Dict[str, Any]:
        """
        Get users list (admin only)
        """
        users = await self.repository.get_users(page=page, limit=limit)
        
        # Remove password hashes
        for user in users.get("items", []):
            user.pop("password_hash", None)
        
        return users
    
    async def update_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update user preferences
        """
        updated_user = await self.repository.update_user_preferences(user_id, preferences)
        if updated_user:
            updated_user.pop("password_hash", None)
        return updated_user
    
    async def get_user_statistics(self, user_id: str) -> Dict[str, Any]:
        """
        Get user statistics
        """
        return await self.repository.get_user_statistics(user_id)
    
    def _hash_password(self, password: str) -> str:
        """
        Hash password using SHA-256 (in production, use bcrypt or similar)
        """
        return hashlib.sha256(password.encode()).hexdigest()
    
    def _verify_password(self, password: str, password_hash: str) -> bool:
        """
        Verify password against hash
        """
        return self._hash_password(password) == password_hash
    
    def _create_access_token(self, user_id: str) -> str:
        """
        Create JWT access token
        """
        expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        payload = {
            "sub": user_id,
            "type": "access",
            "exp": expire,
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def _create_refresh_token(self, user_id: str) -> str:
        """
        Create JWT refresh token
        """
        expire = datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)
        payload = {
            "sub": user_id,
            "type": "refresh",
            "exp": expire,
            "iat": datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def _get_default_profile(self) -> Dict[str, Any]:
        """
        Get default user profile
        """
        return {
            "sectors": [],
            "legalCategories": [],
            "businessType": "",
            "region": "",
            "language": "ar",
            "experienceLevel": "beginner",
            "interests": [],
            "interestsAr": [],
            "interestsFr": [],
            "occupation": "",
            "occupationAr": "",
            "occupationFr": "",
            "companySize": ""
        }
    
    def _get_default_preferences(self) -> Dict[str, Any]:
        """
        Get default user preferences
        """
        return {
            "notifications": {
                "pushNotifications": True,
                "emailNotifications": True,
                "smsNotifications": False,
                "legalUpdates": True,
                "achievements": True,
                "reminders": True,
                "governmentAlerts": True,
                "parliamentaryUpdates": False,
                "quietHours": {
                    "enabled": False,
                    "startTime": "22:00",
                    "endTime": "07:00"
                },
                "categories": {
                    "business_law": True,
                    "civil_law": True,
                    "administrative_law": True,
                    "labor_law": True,
                    "tax_law": True,
                    "family_law": True,
                    "criminal_law": False,
                    "constitutional_law": False,
                    "commercial_law": True,
                    "environmental_law": True
                }
            },
            "privacy": {
                "dataSharing": False,
                "analytics": True,
                "personalization": True,
                "locationTracking": False,
                "voiceRecording": False,
                "communityFeatures": True,
                "profileVisibility": "private"
            },
            "display": {
                "theme": "light",
                "fontSize": "medium",
                "animations": True,
                "reducedMotion": False,
                "highContrast": False,
                "rtlLayout": True,
                "colorScheme": "default"
            },
            "language": "ar",
            "mascot": {
                "enabled": True,
                "preferredSector": "business",
                "animationLevel": "full",
                "voiceSync": True,
                "celebrations": True,
                "customizations": []
            },
            "voice": {
                "enabled": True,
                "dialect": "tunis",
                "voiceSpeed": 1.0,
                "voiceGender": "male",
                "noiseReduction": True,
                "autoTranscription": True
            }
        }
    
    def _get_default_statistics(self) -> Dict[str, Any]:
        """
        Get default user statistics
        """
        return {
            "totalLegalUpdatesRead": 0,
            "totalChatConversations": 0,
            "totalSearchQueries": 0,
            "totalDaysActive": 0,
            "currentStreak": 0,
            "longestStreak": 0,
            "totalAchievements": 0,
            "totalPoints": 0,
            "favoriteCategory": "",
            "mostActiveSector": "",
            "averageSessionDuration": 0,
            "lastWeekActivity": [],
            "monthlyStats": []
        }