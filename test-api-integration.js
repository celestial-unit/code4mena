#!/usr/bin/env node

// Simple test script to verify API integration
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8001';

async function testApiIntegration() {
  console.log('🧪 Testing API Integration...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Authorization': 'Bearer demo-token'
      }
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health Check: OK');
      console.log('   Services:', Object.keys(healthData).filter(k => k !== 'timestamp').map(k => `${k}: ${healthData[k]}`).join(', '));
    } else {
      console.log('❌ Health Check: Failed');
      return;
    }

    // Test 2: Legal Categories
    console.log('\n2. Testing Legal Categories...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/legal-categories`, {
      headers: {
        'Authorization': 'Bearer demo-token'
      }
    });
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Legal Categories: OK');
      console.log('   Categories:', categoriesData.length || 'No categories returned');
    } else {
      console.log('❌ Legal Categories: Failed');
    }

    // Test 3: Popular Queries
    console.log('\n3. Testing Popular Queries...');
    const queriesResponse = await fetch(`${API_BASE_URL}/popular-queries?language=ar`, {
      headers: {
        'Authorization': 'Bearer demo-token'
      }
    });
    
    if (queriesResponse.ok) {
      const queriesData = await queriesResponse.json();
      console.log('✅ Popular Queries: OK');
      console.log('   Queries:', queriesData.length || 'No queries returned');
      if (queriesData.length > 0) {
        console.log('   Sample:', queriesData[0].query || 'No query text');
      }
    } else {
      console.log('❌ Popular Queries: Failed');
    }

    // Test 4: Legal Query
    console.log('\n4. Testing Legal Query...');
    const queryResponse = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token'
      },
      body: JSON.stringify({
        query: 'كيف أسجل شركة جديدة في تونس؟',
        language: 'ar',
        user_id: 'test-user'
      })
    });
    
    if (queryResponse.ok) {
      const queryData = await queryResponse.json();
      console.log('✅ Legal Query: OK');
      console.log('   Response length:', queryData.response?.length || 0, 'characters');
      console.log('   Sources:', queryData.sources?.length || 0);
      console.log('   Query ID:', queryData.query_id);
    } else {
      const errorText = await queryResponse.text();
      console.log('❌ Legal Query: Failed');
      console.log('   Error:', errorText.substring(0, 200));
    }

    console.log('\n🎉 API Integration Test Complete!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testApiIntegration();