"""
Legal Models - Pydantic models for legal assistant API
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class LanguageCode(str, Enum):
    ARABIC = "ar"
    FRENCH = "fr"
    ENGLISH = "en"

class LegalCategory(str, Enum):
    BUSINESS_LAW = "business_law"
    CIVIL_LAW = "civil_law"
    CRIMINAL_LAW = "criminal_law"
    ADMINISTRATIVE_LAW = "administrative_law"
    LABOR_LAW = "labor_law"
    TAX_LAW = "tax_law"
    FAMILY_LAW = "family_law"
    PROPERTY_LAW = "property_law"

class PIIType(str, Enum):
    NAME = "name"
    PHONE = "phone"
    EMAIL = "email"
    ID_NUMBER = "id_number"
    ADDRESS = "address"

class LegalQuery(BaseModel):
    """Model for incoming legal queries"""
    query: str = Field(..., min_length=10, max_length=1000, description="User's legal question")
    language: LanguageCode = Field(default=LanguageCode.ARABIC, description="Response language")
    user_id: Optional[str] = Field(None, max_length=100, description="Anonymous user identifier")
    category: Optional[LegalCategory] = Field(None, description="Legal category filter")
    
    @validator('query')
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError('Query cannot be empty')
        return v.strip()

class PIIDetectionResult(BaseModel):
    """Model for PII detection results"""
    pii_types: List[PIIType] = Field(default_factory=list, description="Types of PII detected")
    confidence_scores: Dict[str, float] = Field(default_factory=dict, description="Confidence scores for each PII type")
    masked_entities: Dict[str, List[str]] = Field(default_factory=dict, description="Masked entities by type")

class LegalDocument(BaseModel):
    """Model for legal documents in the database"""
    id: Optional[int] = Field(None, description="Document ID")
    article_number: str = Field(..., description="Legal article number")
    title: str = Field(..., description="Document title")
    content: str = Field(..., description="Legal text content")
    category: LegalCategory = Field(..., description="Legal category")
    source_document: str = Field(..., description="Source document name")
    official_url: Optional[str] = Field(None, description="Official URL")
    language: LanguageCode = Field(default=LanguageCode.ARABIC, description="Document language")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Update timestamp")

class LegalSearchResult(BaseModel):
    """Model for legal document search results"""
    document: LegalDocument = Field(..., description="Legal document")
    similarity_score: float = Field(..., ge=0.0, le=1.0, description="Similarity score")
    relevance_rank: int = Field(..., ge=1, description="Relevance ranking")

class LegalSource(BaseModel):
    """Model for legal source citations"""
    article_number: str = Field(..., description="Article number")
    title: str = Field(..., description="Article title")
    source_document: str = Field(..., description="Source document")
    official_url: Optional[str] = Field(None, description="Official URL")
    relevance_score: float = Field(..., ge=0.0, le=1.0, description="Relevance score")

class LegalResponse(BaseModel):
    """Model for legal assistant responses"""
    response: str = Field(..., description="Simplified legal guidance")
    sources: List[LegalSource] = Field(..., description="Legal source citations")
    disclaimer: str = Field(..., description="Legal disclaimer")
    query_id: str = Field(..., description="Query tracking ID")
    language: LanguageCode = Field(..., description="Response language")
    processing_time_ms: Optional[int] = Field(None, description="Processing time in milliseconds")
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Response confidence")

class QueryLog(BaseModel):
    """Model for query logging"""
    id: str = Field(..., description="Query ID")
    original_query_hash: str = Field(..., description="Hash of original query")
    abstract_query: str = Field(..., description="PII-stripped abstract query")
    user_id: Optional[str] = Field(None, description="Anonymous user ID")
    language: LanguageCode = Field(..., description="Query language")
    pii_detected: Optional[Dict[str, Any]] = Field(None, description="PII detection results")
    response_generated: bool = Field(default=False, description="Whether response was generated")
    sources_count: int = Field(default=0, description="Number of sources found")
    error_message: Optional[str] = Field(None, description="Error message if any")
    processing_time_ms: Optional[int] = Field(None, description="Processing time")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Update time")

class UserFeedback(BaseModel):
    """Model for user feedback"""
    query_id: str = Field(..., description="Related query ID")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    feedback_text: Optional[str] = Field(None, max_length=500, description="Optional feedback text")
    helpful: Optional[bool] = Field(None, description="Whether response was helpful")
    
    @validator('feedback_text')
    def validate_feedback_text(cls, v):
        if v is not None:
            return v.strip()
        return v

class PopularQuery(BaseModel):
    """Model for popular query suggestions"""
    query: str = Field(..., description="Abstract query text")
    popularity: int = Field(..., ge=1, description="Number of times queried")
    success_rate: float = Field(..., ge=0.0, le=100.0, description="Success rate percentage")
    avg_response_time: Optional[int] = Field(None, description="Average response time in ms")
    last_used: datetime = Field(..., description="Last time this query was used")

class SystemAnalytics(BaseModel):
    """Model for system analytics"""
    period_days: int = Field(..., description="Analytics period in days")
    total_queries: int = Field(..., description="Total number of queries")
    successful_queries: int = Field(..., description="Number of successful queries")
    success_rate: float = Field(..., ge=0.0, le=100.0, description="Success rate percentage")
    avg_processing_time_ms: float = Field(..., description="Average processing time")
    unique_users: int = Field(..., description="Number of unique users")
    language_distribution: List[Dict[str, Any]] = Field(..., description="Query distribution by language")
    popular_categories: List[Dict[str, Any]] = Field(..., description="Popular legal categories")

class HealthStatus(BaseModel):
    """Model for service health status"""
    service: str = Field(..., description="Service name")
    status: str = Field(..., description="Health status")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional health details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Health check timestamp")

class ErrorResponse(BaseModel):
    """Model for error responses"""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Error timestamp")
    query_id: Optional[str] = Field(None, description="Related query ID if applicable")