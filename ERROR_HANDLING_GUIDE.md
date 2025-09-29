# Error Handling Implementation Guide

This document describes the error handling features implemented for the Tunisian Legal App frontend.

## Overview

The error handling system provides:
- User-friendly error messages in Arabic
- Retry functionality for failed requests
- Network connectivity monitoring
- Different error types with appropriate styling
- Automatic error recovery mechanisms

## Components

### 1. useErrorHandler Hook

A custom hook that provides comprehensive error handling functionality.

```typescript
import { useErrorHandler } from '../hooks';

const { error, isRetrying, handleError, clearError, retry } = useErrorHandler({
  maxRetries: 3,
  showAlert: false
});
```

**Features:**
- Automatic error message translation
- Retry mechanism with configurable max attempts
- Error type detection (network, server, auth, etc.)
- Optional alert display

### 2. ErrorDisplay Component

A reusable component for displaying errors with retry functionality.

```typescript
import { ErrorDisplay } from '../components/common';

<ErrorDisplay
  error={error}
  onRetry={handleRetry}
  type="network"
  isRetrying={isRetrying}
  showRetry={true}
  showDismiss={true}
  onDismiss={clearError}
/>
```

**Props:**
- `error`: Error message to display
- `onRetry`: Function to call when retry button is pressed
- `type`: Error type ('network', 'server', 'auth', 'generic')
- `isRetrying`: Whether a retry is in progress
- `showRetry`: Whether to show retry button
- `showDismiss`: Whether to show dismiss button

### 3. NetworkStatusIndicator Component

Shows network connectivity status and provides retry functionality.

```typescript
import { NetworkStatusIndicator } from '../components/common';

<NetworkStatusIndicator onRetry={handleRetry} />
```

**Features:**
- Automatic network status monitoring
- Shows when offline or connection is limited
- Animated indicator with pulse effect
- Retry button for manual connection attempts

### 4. Network Utilities

Provides network connectivity monitoring and utilities.

```typescript
import { useNetworkState, networkUtils } from '../utils/networkUtils';

const networkState = useNetworkState();
// networkState.isConnected
// networkState.isInternetReachable
// networkState.type
```

**Features:**
- Real-time network status monitoring
- Connection type detection (WiFi, cellular, etc.)
- Automatic connectivity alerts
- Wait for connection utility

## Implementation Examples

### Basic Error Handling in a Screen

```typescript
import React, { useState } from 'react';
import { useErrorHandler } from '../hooks';
import { useNetworkState } from '../utils/networkUtils';
import { ErrorDisplay, NetworkStatusIndicator } from '../components/common';

export const MyScreen = () => {
  const { error, isRetrying, handleError, clearError, retry } = useErrorHandler({
    maxRetries: 3,
    showAlert: false
  });
  const networkState = useNetworkState();

  const loadData = async () => {
    try {
      clearError();
      
      // Check network connectivity
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        throw new Error('لا يوجد اتصال بالإنترنت');
      }

      // Make API call
      const data = await apiService.getData();
      // Handle success
    } catch (err) {
      handleError(err, 'فشل في تحميل البيانات');
    }
  };

  const handleRetry = async () => {
    await retry(async () => {
      await loadData();
    });
  };

  if (error) {
    return (
      <View>
        <NetworkStatusIndicator onRetry={handleRetry} />
        <ErrorDisplay
          error={error}
          onRetry={handleRetry}
          type="network"
          isRetrying={isRetrying}
        />
      </View>
    );
  }

  return (
    <View>
      <NetworkStatusIndicator onRetry={handleRetry} />
      {/* Your screen content */}
    </View>
  );
};
```

### API Service Integration

The API service automatically handles common error types:

```typescript
// Network errors are automatically detected
// Server errors (500, 404, etc.) are handled
// Authentication errors (401) trigger auth flow
// Timeout errors are properly formatted
```

## Error Types and Messages

### Network Errors
- **Code**: `NETWORK_ERROR`
- **Message**: "مشكلة في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى."
- **Icon**: WiFi off
- **Color**: Red

### Server Errors
- **Code**: `500`, `502`, `503`, etc.
- **Message**: "خطأ في الخادم. يرجى المحاولة لاحقاً."
- **Icon**: Server
- **Color**: Orange

### Authentication Errors
- **Code**: `401`, `403`
- **Message**: "انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى."
- **Icon**: Lock
- **Color**: Purple

### Timeout Errors
- **Code**: `TIMEOUT`
- **Message**: "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى."
- **Icon**: Time
- **Color**: Orange

## Testing

Use the `ErrorTestScreen` to test different error scenarios:

```typescript
import { ErrorTestScreen } from '../screens';

// Navigate to ErrorTestScreen to test:
// - Network error simulation
// - Server error simulation
// - Timeout error simulation
// - Authentication error simulation
// - Real API connection testing
```

## Best Practices

1. **Always check network connectivity** before making API calls
2. **Use appropriate error types** for better user experience
3. **Provide retry functionality** for recoverable errors
4. **Clear errors** when starting new operations
5. **Show network status indicator** on screens with API calls
6. **Use Arabic error messages** for better user understanding
7. **Limit retry attempts** to prevent infinite loops
8. **Handle offline scenarios** gracefully

## Configuration

### Error Handler Options

```typescript
const errorHandler = useErrorHandler({
  maxRetries: 3,        // Maximum retry attempts
  showAlert: false,     // Show native alert on error
  alertTitle: 'خطأ',    // Alert title (if showAlert is true)
  alertMessage: '...'   // Custom alert message
});
```

### Network Utils Configuration

The network utilities automatically handle:
- Connection state monitoring
- Connectivity alerts
- Connection type detection
- Internet reachability checks

## Dependencies

- `@react-native-community/netinfo`: Network connectivity monitoring
- `expo-linear-gradient`: Gradient backgrounds for error displays
- `react-native-reanimated`: Animations for error components
- `@expo/vector-icons`: Icons for error displays

## Future Enhancements

1. **Offline data caching** for better offline experience
2. **Error analytics** to track common error patterns
3. **Custom error recovery strategies** per error type
4. **Internationalization** for multiple languages
5. **Error reporting** to backend for debugging