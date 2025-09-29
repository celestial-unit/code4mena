# Integration Testing Documentation

This document describes the integration testing setup for the frontend-backend integration feature.

## Overview

The integration tests verify that:
- ✅ API calls work with the backend
- ✅ Authentication flow works correctly  
- ✅ Error handling works as expected
- ✅ Storage services function properly
- ✅ Network connectivity is handled correctly

## Test Files

### `integrationTest.ts`
Main integration test suite that covers all aspects of the frontend-backend integration.

**Tests included:**
1. **Network Connectivity Check** - Verifies network state detection
2. **API Service Configuration** - Checks API service setup
3. **Storage Service Functionality** - Tests AsyncStorage operations
4. **Authentication Service** - Tests login/logout flow
5. **API Health Check** - Tests backend connectivity
6. **Error Handling** - Verifies error handling mechanisms
7. **API Endpoints Testing** - Tests actual API endpoints

### `testIntegration.ts`
Simple script to run integration tests from command line.

## Running Tests

### In the App
1. Navigate to the Error Test Screen
2. Switch to the "Integration Test" tab
3. Tap "Run Tests" button
4. Review results

### From Command Line
```bash
# If you have a Node.js environment set up
npx ts-node src/scripts/testIntegration.ts
```

## Test Results

### Expected Results (Backend Running)
- ✅ Network Connectivity Check
- ✅ API Service Configuration  
- ✅ Storage Service Functionality
- ✅ Authentication Service
- ✅ API Health Check
- ✅ Error Handling
- ✅ API Endpoints Testing

### Expected Results (Backend Not Running)
- ✅ Network Connectivity Check
- ✅ API Service Configuration
- ✅ Storage Service Functionality  
- ✅ Authentication Service
- ❌ API Health Check (expected failure)
- ✅ Error Handling
- ❌ API Endpoints Testing (expected failure)

## Backend Configuration

The tests expect the backend to be running at the configured URL (default: `http://localhost:8001`).

### Backend Endpoints Tested
- `GET /health` - Health check
- `GET /legal-categories` - Legal categories
- `GET /popular-queries` - Popular queries
- `POST /query` - Legal query submission

## Error Scenarios Tested

1. **Network Errors** - Simulated by using invalid URLs
2. **Timeout Errors** - Simulated by setting very short timeouts
3. **HTTP Errors** - Tested by accessing non-existent endpoints
4. **Authentication Errors** - Tested through auth service

## Storage Testing

Tests verify:
- Setting and getting values
- JSON serialization/deserialization
- Token storage and retrieval
- Data removal and cleanup

## Authentication Testing

Tests verify:
- Mock login flow
- Token storage
- User data persistence
- Logout cleanup
- Authentication state management

## Troubleshooting

### Common Issues

**"Network error" in all API tests**
- Check if backend is running
- Verify API base URL configuration
- Check network connectivity

**Storage tests failing**
- Ensure AsyncStorage is properly installed
- Check device/simulator storage permissions

**Authentication tests failing**
- Verify auth service initialization
- Check storage service functionality

### Debug Mode

Enable debug logging by setting:
```typescript
console.log('[DEBUG] Test details:', testResult);
```

## Integration with Requirements

This test suite covers the following requirements from the spec:

- **Requirement 1.1**: API connection establishment
- **Requirement 2.1**: Authentication with backend
- **Requirement 6.1**: Error logging and handling
- **Requirement 3.1**: Centralized API service usage
- **Requirement 2.3**: Secure token storage

## Next Steps

After running integration tests:

1. **All tests pass**: Integration is working correctly
2. **Some tests fail**: 
   - Check backend availability
   - Verify configuration
   - Review error messages
   - Fix issues and re-test

## Maintenance

Update tests when:
- Adding new API endpoints
- Changing authentication flow
- Modifying error handling
- Adding new storage requirements