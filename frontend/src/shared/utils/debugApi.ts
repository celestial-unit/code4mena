/**
 * Debug utilities for testing API connections
 */

import geminiApiService from '../services/geminiApiService';

export const testBackendConnection = async () => {
    console.log('🔍 Testing Backend Connection...');

    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const health = await geminiApiService.healthCheck();
        console.log('✅ Health check passed:', health);

        // Test query endpoint
        console.log('2. Testing query endpoint...');
        const response = await geminiApiService.sendMessage(
            'مرحبا، ما هي متطلبات تسجيل شركة جديدة في تونس؟',
            'ar',
            'debug-user'
        );
        console.log('✅ Query test passed:', {
            responseLength: response.response.length,
            sourcesCount: response.sources.length,
            queryId: response.query_id
        });

        return {
            success: true,
            health,
            testResponse: response
        };

    } catch (error) {
        console.error('❌ Backend connection test failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const debugChatMessage = async (message: string) => {
    console.log(`🔍 Debug: Sending message "${message}"`);

    try {
        const startTime = Date.now();
        const response = await geminiApiService.sendMessage(message, 'ar', 'debug-user');
        const endTime = Date.now();

        console.log('✅ Debug: Message sent successfully', {
            responseTime: `${endTime - startTime}ms`,
            responsePreview: response.response.substring(0, 100) + '...',
            sourcesCount: response.sources.length
        });

        return response;

    } catch (error) {
        console.error('❌ Debug: Message failed', error);
        throw error;
    }
};