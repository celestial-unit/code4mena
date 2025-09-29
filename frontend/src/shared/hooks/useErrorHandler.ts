import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { ApiError } from '../services/api';

export interface ErrorState {
  error: string | null;
  isRetrying: boolean;
  retryCount: number;
}

export interface ErrorHandlerOptions {
  maxRetries?: number;
  showAlert?: boolean;
  alertTitle?: string;
  alertMessage?: string;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    maxRetries = 3,
    showAlert = false,
    alertTitle = 'خطأ',
    alertMessage = 'حدث خطأ غير متوقع'
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0
    });
  }, []);

  const handleError = useCallback((error: any, customMessage?: string) => {
    let errorMessage = customMessage || 'حدث خطأ غير متوقع';

    // Handle different error types
    if (error && typeof error === 'object') {
      if ('message' in error) {
        const apiError = error as ApiError;
        
        // Provide user-friendly messages for common error codes
        switch (apiError.code) {
          case 'NETWORK_ERROR':
            errorMessage = 'مشكلة في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.';
            break;
          case 'TIMEOUT':
            errorMessage = 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.';
            break;
          case '401':
            errorMessage = 'انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى.';
            break;
          case '403':
            errorMessage = 'ليس لديك صلاحية للوصول إلى هذا المحتوى.';
            break;
          case '404':
            errorMessage = 'المحتوى المطلوب غير موجود.';
            break;
          case '500':
            errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
            break;
          default:
            errorMessage = apiError.message || errorMessage;
        }
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'مشكلة في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    setErrorState(prev => ({
      error: errorMessage,
      isRetrying: false,
      retryCount: prev.retryCount
    }));

    // Show alert if requested
    if (showAlert) {
      Alert.alert(
        alertTitle,
        errorMessage,
        [{ text: 'موافق', style: 'default' }]
      );
    }

    console.error('Error handled:', error);
  }, [showAlert, alertTitle]);

  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (errorState.retryCount >= maxRetries) {
      Alert.alert(
        'فشل في إعادة المحاولة',
        `تم الوصول للحد الأقصى من المحاولات (${maxRetries}). يرجى المحاولة لاحقاً.`,
        [{ text: 'موافق' }]
      );
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    try {
      await retryFunction();
      clearError();
    } catch (error) {
      handleError(error);
    } finally {
      setErrorState(prev => ({
        ...prev,
        isRetrying: false
      }));
    }
  }, [errorState.retryCount, maxRetries, handleError, clearError]);

  const canRetry = errorState.retryCount < maxRetries;

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry,
    handleError,
    clearError,
    retry
  };
};