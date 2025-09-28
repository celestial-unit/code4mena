# Design Document

## Overview

This design enhances the existing Code4Mena legal assistant by making both `/query` and `/audio/query` endpoints use the same enhanced legal intelligence pipeline that you already have in `/api/v2/legal-intelligence`. Instead of building new components, we'll modify the existing endpoints to leverage your comprehensive multi-source intelligence system.

The key enhancement is ensuring your scraped data (government social media, parliamentary data, 9anoun.tn) is efficiently used as contextual references in all responses, making the scraping investment worthwhile and creating a robust, resource-efficient pipeline.

## Architecture

### Current State Analysis

The system currently has two separate processing paths:

1. **Text Endpoint (`/query`)**: Uses basic legal RAG + external LLM simplification
2. **Audio Endpoint (`/audio/query`)**: Uses Gemini Live API directly for transcription and response

### Enhanced Architecture

Instead of creating new components, we enhance existing endpoints to use your existing `/api/v2/legal-intelligence` pipeline:

```mermaid
graph TD
    A[/query endpoint] --> B[Enhanced Query Processing]
    C[/audio/query endpoint] --> D[Audio Transcription] --> B
    
    B --> E[Your Existing LegalIntelligenceEngine.process_enhanced_legal_query]
    
    E --> F[Efficient Data Retrieval]
    F --> G[Cached Government Signals]
    F --> H[Cached Parliamentary Data]
    F --> I[Cached 9anoun References]
    F --> J[Traditional Legal RAG]
    
    G --> K[Smart Context Selection]
    H --> K
    I --> K
    J --> K
    
    K --> L[Your Existing ExternalLLMService]
    L --> M[Consistent Response Format]
    
    M --> N[Text Response]
    M --> O[Audio Response via AudioService]
```

### Resource Efficiency Enhancements

1. **Smart Caching**: Cache scraped data with TTL to avoid redundant API calls
2. **Relevance Filtering**: Only include scraped data that's actually relevant to the query
3. **Batch Processing**: Process multiple queries against the same cached data
4. **Lazy Loading**: Only fetch additional data when confidence is low

## Components and Interfaces

### 1. Enhanced Existing Endpoints

Instead of new components, we enhance your existing endpoints to use the legal intelligence pipeline:

#### Enhanced `/query` Endpoint
```python
@app.post("/query", response_model=QueryResponse)
async def process_legal_query(request: QueryRequest):
    """Enhanced to use legal intelligence pipeline"""
    
    # Use your existing legal intelligence engine
    intelligence = await legal_intelligence.process_enhanced_legal_query(
        request.query, 
        user_context={
            'language': request.language,
            'user_id': request.user_id
        }
    )
    
    # Use your existing response synthesis
    enhanced_response = await _synthesize_enhanced_response(intelligence, request.language)
    
    return QueryResponse(
        response=enhanced_response["response"],
        sources=enhanced_response["sources"],
        disclaimer=get_legal_disclaimer(request.language),
        query_id=str(uuid.uuid4())
    )
```

#### Enhanced `/audio/query` Endpoint
```python
@app.post("/audio/query")
async def process_audio_query(audio_file: UploadFile, language: str = "ar-TN"):
    """Enhanced to use legal intelligence pipeline after transcription"""
    
    # Your existing audio processing
    audio_content = await audio_file.read()
    audio_result = await audio_service.process_legal_audio_query(audio_content)
    
    # NEW: Use legal intelligence for the transcribed text
    if audio_result.get("transcription"):
        intelligence = await legal_intelligence.process_enhanced_legal_query(
            audio_result["transcription"],
            user_context={'language': language}
        )
        
        # Enhance the response with intelligence data
        enhanced_text = await _synthesize_enhanced_response(intelligence, language)
        
        # Generate audio for the enhanced response
        enhanced_audio = await audio_service.text_to_speech(
            enhanced_text["response"], 
            language
        )
        
        return {
            "transcription": audio_result["transcription"],
            "response_text": enhanced_text["response"],
            "audio_response": enhanced_audio,
            "legal_intelligence_summary": intelligence.sources_summary,
            "confidence": intelligence.confidence_score
        }
    
    # Fallback to existing audio processing
    return audio_result
```

### 2. Efficient Data Utilization Strategy

Instead of new models, we enhance your existing `LegalIntelligenceEngine` to be more efficient:

```python
class EnhancedLegalIntelligenceEngine(LegalIntelligenceEngine):
    def __init__(self):
        super().__init__()
        self.data_cache = {}  # Cache scraped data
        self.relevance_threshold = 0.3  # Only use relevant scraped data
    
    async def process_enhanced_legal_query(self, query: str, user_context: Dict = None):
        """Enhanced to use cached data efficiently"""
        
        # Get cached or fresh scraped data
        scraped_data = await self._get_relevant_scraped_data(query)
        
        # Only use scraped data that's actually relevant
        filtered_data = self._filter_relevant_data(scraped_data, query)
        
        # Your existing intelligence processing with filtered data
        return await super().process_enhanced_legal_query(query, user_context)
    
    async def _get_relevant_scraped_data(self, query: str):
        """Get only relevant scraped data to avoid waste"""
        cache_key = f"scraped_data_{hash(query[:50])}"
        
        if cache_key in self.data_cache:
            return self.data_cache[cache_key]
        
        # Only scrape if we don't have recent relevant data
        relevant_data = await self._smart_scrape(query)
        self.data_cache[cache_key] = relevant_data
        
        return relevant_data
    
    def _filter_relevant_data(self, scraped_data, query):
        """Only include scraped data that's relevant to the query"""
        relevant_data = []
        
        for data_item in scraped_data:
            relevance_score = self._calculate_relevance(data_item, query)
            if relevance_score > self.relevance_threshold:
                relevant_data.append(data_item)
        
        return relevant_data
```

### 3. Resource Efficiency Improvements

#### Smart Scraping Strategy
```python
class EfficientScrapingManager:
    def __init__(self):
        self.scrape_cache = {}
        self.last_scrape_time = {}
        self.scrape_interval = 3600  # 1 hour
    
    async def get_relevant_government_signals(self, query: str):
        """Only scrape government data if it's relevant and not recently cached"""
        
        # Check if we have recent data
        if self._has_recent_data('government', query):
            return self.scrape_cache.get(f'government_{hash(query)}', [])
        
        # Only scrape if query is government-related
        if not self._is_government_related(query):
            return []
        
        # Efficient targeted scraping
        signals = await self.gov_scraper.get_targeted_signals(query)
        self.scrape_cache[f'government_{hash(query)}'] = signals
        
        return signals
    
    def _is_government_related(self, query: str) -> bool:
        """Check if query is related to government topics"""
        gov_keywords = ['حكومة', 'وزارة', 'قرار', 'مرسوم', 'government', 'ministry']
        return any(keyword in query.lower() for keyword in gov_keywords)
```

#### Efficient Data Pipeline
```python
async def _synthesize_enhanced_response(intelligence: LegalIntelligence, language: str):
    """Enhanced synthesis that only uses relevant scraped data"""
    
    response_parts = []
    sources = []
    
    # Always include traditional legal (your existing RAG)
    if intelligence.traditional_legal:
        response_parts.append("**📚 Legal Framework:**")
        for doc in intelligence.traditional_legal[:2]:
            response_parts.append(f"• {doc.get('title', 'Legal Document')}")
            sources.append({
                "type": "traditional_legal",
                "title": doc.get('title', ''),
                "relevance": doc.get('relevance', 0.8)
            })
    
    # Only add government data if it's actually relevant and recent
    if intelligence.government_position and len(intelligence.government_position) > 0:
        high_relevance_signals = [
            s for s in intelligence.government_position 
            if s.legal_relevance_score > 3.0
        ]
        
        if high_relevance_signals:
            response_parts.append("\n**🏛️ Recent Government Position:**")
            for signal in high_relevance_signals[:1]:  # Only most relevant
                response_parts.append(f"• Government communication detected (Relevance: {signal.legal_relevance_score:.1f}/10)")
                sources.append({
                    "type": "government_social",
                    "title": f"Government Signal - {signal.signal_type}",
                    "relevance": signal.legal_relevance_score / 10
                })
    
    # Only add parliamentary data if it's recent and relevant
    if intelligence.parliamentary_context:
        recent_relevant = [
            s for s in intelligence.parliamentary_context 
            if s.get('relevance', 0) > 0.5
        ]
        
        if recent_relevant:
            response_parts.append("\n**🏛️ Parliamentary Context:**")
            for session in recent_relevant[:1]:  # Only most relevant
                response_parts.append(f"• Recent parliamentary discussion: {', '.join(session.get('topics', [])[:2])}")
                sources.append({
                    "type": "parliamentary",
                    "title": f"Parliamentary Session",
                    "relevance": session.get('relevance', 0.7)
                })
    
    return {
        "response": "\n".join(response_parts),
        "sources": sources
    }
```

## Data Models

### Enhanced Existing Models

We enhance your existing `LegalIntelligence` class to include efficiency metrics:

```python
@dataclass
class LegalIntelligence:
    # Your existing fields
    query: str
    traditional_legal: List[Dict[str, Any]]
    government_position: List[LegalSignal]
    parliamentary_context: List[Dict[str, Any]]
    qanoun_references: List[Dict[str, Any]]
    predictive_analysis: Dict[str, Any]
    confidence_score: float
    last_updated: datetime
    sources_summary: Dict[str, int]
    
    # New efficiency fields
    cache_hits: Dict[str, bool] = None
    data_freshness: Dict[str, datetime] = None
    relevance_scores: Dict[str, float] = None
    processing_time_ms: int = 0
```

### Efficiency Tracking

```python
@dataclass
class ProcessingMetrics:
    total_time_ms: int
    cache_hit_rate: float
    scraped_data_used: int
    scraped_data_available: int
    relevance_filter_efficiency: float
    gemini_api_calls: int
    fallback_used: bool
```

## Error Handling

### Graceful Degradation Strategy

The system implements a multi-level fallback approach:

1. **Full Intelligence Available**: All sources provide data
2. **Partial Intelligence**: Some sources fail, continue with available data
3. **Basic Intelligence**: Only traditional legal RAG available
4. **Fallback Mode**: Use existing simple query processing

### Error Recovery Flow

```python
async def process_with_fallback(query: str, context: QueryContext) -> ResponseData:
    try:
        # Attempt full intelligence gathering
        intelligence = await legal_intelligence.process_enhanced_legal_query(query)
        return await synthesize_full_response(intelligence, context)
    
    except IntelligenceGatheringError as e:
        logger.warning(f"Intelligence gathering failed: {e}")
        # Fallback to basic legal RAG
        basic_results = await legal_rag.search_legal_documents(query)
        return await synthesize_basic_response(basic_results, context)
    
    except Exception as e:
        logger.error(f"All processing failed: {e}")
        # Ultimate fallback
        return create_fallback_response(query, context)
```

### Audio-Specific Error Handling

```python
async def handle_audio_errors(audio_data: bytes, context: QueryContext) -> ResponseData:
    try:
        # Attempt transcription
        transcription = await audio_service.transcribe_audio(audio_data)
        return await process_transcribed_query(transcription.text, context)
    
    except TranscriptionError:
        # Return audio error response
        return create_audio_error_response("Unable to transcribe audio")
    
    except Exception as e:
        # Fallback to text-only error response
        return create_text_error_response(str(e))
```

## Testing Strategy

### Unit Testing

1. **UnifiedQueryProcessor Tests**
   - Test intelligence gathering with mocked services
   - Test response synthesis with various intelligence combinations
   - Test error handling and fallback scenarios

2. **Integration Tests**
   - Test full pipeline with real services
   - Test audio transcription and response generation
   - Test database logging and analytics

3. **Service Integration Tests**
   - Test LegalIntelligenceEngine integration
   - Test AudioService integration
   - Test ExternalLLMService integration

### Performance Testing

1. **Response Time Benchmarks**
   - Text queries: Target 5 seconds for 90% of requests
   - Audio queries: Target 8 seconds for 90% of requests
   - Intelligence gathering: Target 3 seconds

2. **Load Testing**
   - Concurrent request handling
   - Database connection pool performance
   - External API rate limiting

3. **Audio Quality Testing**
   - Transcription accuracy testing
   - Audio response quality validation
   - Language detection accuracy

### End-to-End Testing

1. **User Journey Tests**
   - Complete text query flow
   - Complete audio query flow
   - Cross-modal consistency validation

2. **Data Quality Tests**
   - Legal intelligence accuracy
   - Source attribution correctness
   - Response relevance validation

### Monitoring and Observability

1. **Performance Metrics**
   - Response time percentiles
   - Intelligence source success rates
   - Audio processing success rates
   - Gemini API usage and costs

2. **Quality Metrics**
   - Response confidence scores
   - User feedback ratings
   - Source diversity in responses
   - Fallback usage frequency

3. **System Health Metrics**
   - Service availability
   - Database performance
   - External API health
   - Error rates by component

### Implementation Strategy

#### Phase 1: Efficiency Enhancements
- Add smart caching to your existing `LegalIntelligenceEngine`
- Implement relevance filtering for scraped data
- Add processing metrics and monitoring

#### Phase 2: Text Endpoint Enhancement
- Modify existing `/query` endpoint to use `legal_intelligence.process_enhanced_legal_query`
- Maintain exact same response format for backward compatibility
- Add efficiency tracking

#### Phase 3: Audio Endpoint Enhancement  
- Modify existing `/audio/query` endpoint to use legal intelligence after transcription
- Keep existing audio processing quality
- Add intelligence summary to audio responses

#### Phase 4: Resource Optimization
- Implement smart scraping schedules based on query patterns
- Add data freshness tracking
- Optimize Gemini API usage

### Key Benefits

1. **Resource Efficiency**: Only scrape and use data that's actually relevant
2. **Robust Pipeline**: Graceful degradation when scraped data is unavailable
3. **Consistent Quality**: Both endpoints get the same comprehensive intelligence
4. **Cost Optimization**: Reduce unnecessary API calls and processing
5. **Data Utilization**: Make your scraping investment worthwhile by using it as contextual reference

This approach enhances your existing system without rebuilding, ensures efficient resource usage, and makes your scraped data a valuable contextual reference for all legal queries.