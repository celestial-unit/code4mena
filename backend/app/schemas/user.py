"""
Pydantic schemas for user models
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Base schemas
class UserBase(BaseModel):
    """Base user schema with common fields"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=20)
    preferred_language: str = Field(default="ar", max_length=10)


class UserCreate(UserBase):
    """Schema for creating a new user"""
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)
    
    def validate_passwords_match(self) -> 'UserCreate':
        """Validate that passwords match"""
        if self.password != self.confirm_password:
            raise ValueError('Passwords do not match')
        return self


class UserUpdate(BaseModel):
    """Schema for updating user information"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    phone_number: Optional[str] = Field(None, max_length=20)
    preferred_language: Optional[str] = Field(None, max_length=10)


class UserPasswordUpdate(BaseModel):
    """Schema for updating user password"""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_new_password: str = Field(..., min_length=8, max_length=100)
    
    def validate_passwords_match(self) -> 'UserPasswordUpdate':
        """Validate that new passwords match"""
        if self.new_password != self.confirm_new_password:
            raise ValueError('New passwords do not match')
        return self


class UserInDB(UserBase):
    """Schema for user data stored in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    is_active: bool
    is_verified: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None


class User(UserInDB):
    """Public user schema (excludes sensitive data)"""
    pass


class UserProfile(User):
    """Extended user profile schema"""
    preferences: Optional['UserPreferences'] = None


# Session schemas
class UserSessionBase(BaseModel):
    """Base session schema"""
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class UserSessionCreate(UserSessionBase):
    """Schema for creating a new session"""
    user_id: UUID
    session_token: str
    refresh_token: Optional[str] = None
    expires_at: datetime


class UserSessionInDB(UserSessionBase):
    """Schema for session data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    session_token: str
    refresh_token: Optional[str] = None
    is_active: bool
    expires_at: datetime
    created_at: datetime
    last_accessed: datetime


class UserSession(UserSessionInDB):
    """Public session schema"""
    pass


# Preferences schemas
class UserPreferencesBase(BaseModel):
    """Base preferences schema"""
    email_notifications: bool = True
    push_notifications: bool = True
    legal_updates: bool = True
    theme: str = Field(default="light", max_length=20)
    font_size: str = Field(default="medium", max_length=20)
    data_collection_consent: bool = False
    analytics_consent: bool = False


class UserPreferencesCreate(UserPreferencesBase):
    """Schema for creating user preferences"""
    user_id: UUID


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences"""
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    legal_updates: Optional[bool] = None
    theme: Optional[str] = Field(None, max_length=20)
    font_size: Optional[str] = Field(None, max_length=20)
    data_collection_consent: Optional[bool] = None
    analytics_consent: Optional[bool] = None


class UserPreferencesInDB(UserPreferencesBase):
    """Schema for preferences data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class UserPreferences(UserPreferencesInDB):
    """Public preferences schema"""
    pass


# Authentication schemas
class Token(BaseModel):
    """JWT token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token payload data schema"""
    user_id: Optional[UUID] = None
    username: Optional[str] = None
    scopes: list[str] = []


class LoginRequest(BaseModel):
    """Login request schema"""
    username: str = Field(..., min_length=1)
    password: str = Field(..., min_length=1)
    remember_me: bool = False


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str


class PasswordResetRequest(BaseModel):
    """Password reset request schema"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)
    confirm_new_password: str = Field(..., min_length=8, max_length=100)
    
    def validate_passwords_match(self) -> 'PasswordResetConfirm':
        """Validate that passwords match"""
        if self.new_password != self.confirm_new_password:
            raise ValueError('Passwords do not match')
        return self


# Response schemas
class UserResponse(BaseModel):
    """Standard user response schema"""
    success: bool
    message: str
    data: Optional[User] = None


class UsersListResponse(BaseModel):
    """Users list response schema"""
    success: bool
    message: str
    data: list[User]
    total: int
    page: int
    per_page: int


class AuthResponse(BaseModel):
    """Authentication response schema"""
    success: bool
    message: str
    data: Optional[Token] = None
    user: Optional[User] = None