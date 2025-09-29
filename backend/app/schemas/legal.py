"""
Pydantic schemas for legal models
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict, validator


# Legal Category schemas
class LegalCategoryBase(BaseModel):
    """Base legal category schema"""
    name: str = Field(..., max_length=255)
    name_ar: str = Field(..., max_length=255)
    name_fr: Optional[str] = Field(None, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    code: str = Field(..., max_length=50)
    parent_id: Optional[UUID] = None
    sort_order: int = Field(default=0, ge=0)
    is_active: bool = True


class LegalCategoryCreate(LegalCategoryBase):
    """Schema for creating a legal category"""
    pass


class LegalCategoryUpdate(BaseModel):
    """Schema for updating a legal category"""
    name: Optional[str] = Field(None, max_length=255)
    name_ar: Optional[str] = Field(None, max_length=255)
    name_fr: Optional[str] = Field(None, max_length=255)
    name_en: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    parent_id: Optional[UUID] = None
    sort_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class LegalCategoryInDB(LegalCategoryBase):
    """Schema for legal category data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
    updated_at: datetime


class LegalCategory(LegalCategoryInDB):
    """Public legal category schema"""
    pass


# Legal Document schemas
class LegalDocumentBase(BaseModel):
    """Base legal document schema"""
    title: str = Field(..., max_length=500)
    title_ar: str = Field(..., max_length=500)
    title_fr: Optional[str] = Field(None, max_length=500)
    title_en: Optional[str] = Field(None, max_length=500)
    content: str = Field(..., min_length=1)
    content_ar: str = Field(..., min_length=1)
    content_fr: Optional[str] = None
    content_en: Optional[str] = None
    article_number: Optional[str] = Field(None, max_length=100)
    document_type: str = Field(..., max_length=100)
    source: str = Field(..., max_length=255)
    language: str = Field(default="ar", max_length=10)
    category_id: Optional[UUID] = None
    is_active: bool = True
    is_public: bool = True
    version: str = Field(default="1.0", max_length=50)
    metadata: Optional[Dict[str, Any]] = None


class LegalDocumentCreate(LegalDocumentBase):
    """Schema for creating a legal document"""
    pass


class LegalDocumentUpdate(BaseModel):
    """Schema for updating a legal document"""
    title: Optional[str] = Field(None, max_length=500)
    title_ar: Optional[str] = Field(None, max_length=500)
    title_fr: Optional[str] = Field(None, max_length=500)
    title_en: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    content_ar: Optional[str] = None
    content_fr: Optional[str] = None
    content_en: Optional[str] = None
    article_number: Optional[str] = Field(None, max_length=100)
    document_type: Optional[str] = Field(None, max_length=100)
    source: Optional[str] = Field(None, max_length=255)
    language: Optional[str] = Field(None, max_length=10)
    category_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    is_public: Optional[bool] = None
    version: Optional[str] = Field(None, max_length=50)
    metadata: Optional[Dict[str, Any]] = None


class LegalDocumentInDB(LegalDocumentBase):
    """Schema for legal document data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    embedding_model: Optional[str] = None
    view_count: int = 0
    search_count: int = 0
    last_accessed: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None


class LegalDocument(LegalDocumentInDB):
    """Public legal document schema"""
    category: Optional[LegalCategory] = None


class LegalDocumentSummary(BaseModel):
    """Summary schema for legal document listings"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    title_ar: str
    article_number: Optional[str] = None
    document_type: str
    source: str
    language: str
    category_id: Optional[UUID] = None
    is_active: bool
    view_count: int
    created_at: datetime


# Legal Search schemas
class LegalSearchRequest(BaseModel):
    """Schema for legal search requests"""
    query: str = Field(..., min_length=3, max_length=1000)
    language: str = Field(default="ar", max_length=10)
    category_id: Optional[UUID] = None
    document_type: Optional[str] = Field(None, max_length=100)
    source: Optional[str] = Field(None, max_length=255)
    limit: int = Field(default=10, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    include_content: bool = False
    
    @validator('query')
    def validate_query(cls, v):
        """Validate and clean query"""
        return v.strip()


class LegalSearchResultBase(BaseModel):
    """Base legal search result schema"""
    query_id: UUID
    query_text: str
    document_id: UUID
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    similarity_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    rank_position: int = Field(..., ge=1)
    search_language: str = Field(default="ar", max_length=10)
    search_filters: Optional[Dict[str, Any]] = None


class LegalSearchResultCreate(LegalSearchResultBase):
    """Schema for creating a search result"""
    user_id: Optional[UUID] = None


class LegalSearchResultInDB(LegalSearchResultBase):
    """Schema for search result data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: Optional[UUID] = None
    clicked: bool = False
    clicked_at: Optional[datetime] = None
    created_at: datetime


class LegalSearchResult(LegalSearchResultInDB):
    """Public search result schema"""
    document: Optional[LegalDocument] = None


class LegalSearchResponse(BaseModel):
    """Schema for search response"""
    query: str
    language: str
    total_results: int
    processing_time_ms: Optional[int] = None
    results: List[LegalSearchResult]
    suggestions: Optional[List[str]] = None
    filters_applied: Optional[Dict[str, Any]] = None


# Legal Query schemas
class LegalQueryBase(BaseModel):
    """Base legal query schema"""
    original_query: str
    processed_query: str
    language: str = Field(default="ar", max_length=10)
    query_type: str = Field(default="search", max_length=50)
    results_count: int = Field(default=0, ge=0)
    response_generated: bool = False
    processing_time_ms: Optional[int] = Field(None, ge=0)


class LegalQueryCreate(LegalQueryBase):
    """Schema for creating a legal query"""
    user_id: Optional[UUID] = None
    session_id: Optional[str] = Field(None, max_length=255)
    pii_detected: Optional[Dict[str, Any]] = None
    pii_masked: bool = False


class LegalQueryUpdate(BaseModel):
    """Schema for updating a legal query"""
    results_count: Optional[int] = Field(None, ge=0)
    response_generated: Optional[bool] = None
    processing_time_ms: Optional[int] = Field(None, ge=0)
    error_occurred: Optional[bool] = None
    error_message: Optional[str] = None
    user_rating: Optional[int] = Field(None, ge=1, le=5)
    user_feedback: Optional[str] = None
    helpful: Optional[bool] = None
    completed_at: Optional[datetime] = None


class LegalQueryInDB(LegalQueryBase):
    """Schema for legal query data in database"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    query_hash: str
    user_id: Optional[UUID] = None
    session_id: Optional[str] = None
    pii_detected: Optional[Dict[str, Any]] = None
    pii_masked: bool = False
    error_occurred: bool = False
    error_message: Optional[str] = None
    user_rating: Optional[int] = None
    user_feedback: Optional[str] = None
    helpful: Optional[bool] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class LegalQuery(LegalQueryInDB):
    """Public legal query schema"""
    pass


# Analytics schemas
class LegalAnalytics(BaseModel):
    """Schema for legal system analytics"""
    period_days: int
    total_queries: int
    successful_queries: int
    success_rate: float
    avg_processing_time_ms: float
    unique_users: int
    popular_categories: List[Dict[str, Any]]
    language_distribution: List[Dict[str, Any]]
    document_statistics: Dict[str, Any]


class PopularQuery(BaseModel):
    """Schema for popular query suggestions"""
    query: str
    popularity: int
    success_rate: float
    avg_response_time: Optional[int] = None
    last_used: datetime


# Response schemas
class LegalDocumentResponse(BaseModel):
    """Standard legal document response schema"""
    success: bool
    message: str
    data: Optional[LegalDocument] = None


class LegalDocumentsListResponse(BaseModel):
    """Legal documents list response schema"""
    success: bool
    message: str
    data: List[LegalDocumentSummary]
    total: int
    page: int
    per_page: int


class LegalCategoryResponse(BaseModel):
    """Standard legal category response schema"""
    success: bool
    message: str
    data: Optional[LegalCategory] = None


class LegalCategoriesListResponse(BaseModel):
    """Legal categories list response schema"""
    success: bool
    message: str
    data: List[LegalCategory]
    total: int