"""
Legal API endpoints for dynamic legal data management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from ...services.legal_service import LegalService
from ...models.legal_models import (
    LegalQuery,
    LegalResponse,
    LegalDocument,
    LegalSearchResult,
    LegalCategory,
    LanguageCode,
    TextQueryRequest,
    TextQueryResponse
)

router = APIRouter()

def get_legal_service() -> LegalService:
    """Dependency to get legal service instance"""
    return LegalService()

@router.get("/updates", response_model=List[dict])
async def get_legal_updates(
    category: Optional[str] = Query(None, description="Filter by legal category"),
    priority: Optional[str] = Query(None, description="Filter by priority (high, medium, low)"),
    language: Optional[str] = Query("ar", description="Language for content (ar, fr, en)"),
    limit: int = Query(10, ge=1, le=100, description="Number of updates to return"),
    offset: int = Query(0, ge=0, description="Number of updates to skip"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get legal updates with filtering and pagination
    """
    try:
        updates = await legal_service.get_legal_updates(
            category=category,
            priority=priority,
            language=language,
            limit=limit,
            offset=offset
        )
        return updates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch legal updates: {str(e)}")

@router.get("/categories", response_model=List[dict])
async def get_legal_categories(
    language: Optional[str] = Query("ar", description="Language for category names"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get available legal categories
    """
    try:
        categories = await legal_service.get_legal_categories(language=language)
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch legal categories: {str(e)}")

@router.get("/documents", response_model=List[LegalDocument])
async def get_legal_documents(
    category: Optional[LegalCategory] = Query(None, description="Filter by legal category"),
    language: Optional[LanguageCode] = Query(LanguageCode.ARABIC, description="Document language"),
    search: Optional[str] = Query(None, description="Search term"),
    limit: int = Query(10, ge=1, le=100, description="Number of documents to return"),
    offset: int = Query(0, ge=0, description="Number of documents to skip"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get legal documents with filtering and search
    """
    try:
        documents = await legal_service.get_legal_documents(
            category=category,
            language=language,
            search=search,
            limit=limit,
            offset=offset
        )
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch legal documents: {str(e)}")

@router.get("/documents/{document_id}", response_model=LegalDocument)
async def get_legal_document(
    document_id: int,
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get a specific legal document by ID
    """
    try:
        document = await legal_service.get_legal_document_by_id(document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Legal document not found")
        return document
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch legal document: {str(e)}")

@router.post("/query", response_model=LegalResponse)
async def query_legal_documents(
    query: LegalQuery,
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Query legal documents using natural language
    """
    try:
        response = await legal_service.process_legal_query(query)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process legal query: {str(e)}")

@router.get("/search", response_model=List[LegalSearchResult])
async def search_legal_documents(
    q: str = Query(..., min_length=3, description="Search query"),
    category: Optional[LegalCategory] = Query(None, description="Filter by legal category"),
    language: Optional[LanguageCode] = Query(LanguageCode.ARABIC, description="Document language"),
    limit: int = Query(10, ge=1, le=50, description="Number of results to return"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Search legal documents with similarity scoring
    """
    try:
        results = await legal_service.search_legal_documents(
            query=q,
            category=category,
            language=language,
            limit=limit
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search legal documents: {str(e)}")

@router.get("/updates/{update_id}", response_model=dict)
async def get_legal_update(
    update_id: str,
    language: Optional[str] = Query("ar", description="Language for content"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get a specific legal update by ID
    """
    try:
        update = await legal_service.get_legal_update_by_id(update_id, language=language)
        if not update:
            raise HTTPException(status_code=404, detail="Legal update not found")
        return update
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch legal update: {str(e)}")

@router.get("/ministries", response_model=List[dict])
async def get_ministries(
    language: Optional[str] = Query("ar", description="Language for ministry names"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get list of government ministries and sources
    """
    try:
        ministries = await legal_service.get_ministries(language=language)
        return ministries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch ministries: {str(e)}")

@router.get("/tags", response_model=List[dict])
async def get_legal_tags(
    language: Optional[str] = Query("ar", description="Language for tag names"),
    category: Optional[str] = Query(None, description="Filter tags by category"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get available legal tags for filtering
    """
    try:
        tags = await legal_service.get_legal_tags(language=language, category=category)
        return tags
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch legal tags: {str(e)}")

@router.get("/search-results", response_model=List[dict])
async def get_search_results(
    query: str = Query(..., min_length=1, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    language: str = Query("ar", description="Language for results"),
    limit: int = Query(10, ge=1, le=50, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get search results with filtering and pagination
    """
    try:
        results = await legal_service.get_search_results(
            query=query,
            category=category,
            sector=sector,
            language=language,
            limit=limit,
            offset=offset
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch search results: {str(e)}")

@router.get("/search-suggestions", response_model=List[str])
async def get_search_suggestions(
    query: str = Query(..., min_length=1, description="Partial search query"),
    language: str = Query("ar", description="Language for suggestions"),
    limit: int = Query(5, ge=1, le=20, description="Number of suggestions to return"),
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Get search suggestions based on partial query
    """
    try:
        suggestions = await legal_service.get_search_suggestions(
            query=query,
            language=language,
            limit=limit
        )
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch search suggestions: {str(e)}")

@router.post("/text-query", response_model=TextQueryResponse)
async def process_text_query(
    request: TextQueryRequest,
    legal_service: LegalService = Depends(get_legal_service)
):
    """
    Process a text query with Tunisia-specific legal context and LLM integration
    """
    try:
        response = await legal_service.process_text_query(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process text query: {str(e)}")