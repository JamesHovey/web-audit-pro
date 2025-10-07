/**
 * Quick test script to verify ValueSERP API connection
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { ValueSerpService } = require('./lib/valueSerpService.ts');

async function testValueSerpConnection() {
  console.log('🔍 Testing ValueSERP API connection...');
  
  // Check if API key is configured
  const apiKey = process.env.VALUESERP_API_KEY;
  if (!apiKey) {
    console.log('❌ VALUESERP_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ API key found in environment');
  console.log(`🔑 API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    const service = new ValueSerpService();
    console.log('📡 Testing API connection with simple query...');
    
    // Test with a simple, common keyword
    const result = await service.getKeywordRankings(
      'google', // Simple test keyword
      'google.com', // Should definitely rank #1
      'United Kingdom',
      10 // Just check top 10
    );
    
    console.log('✅ API connection successful!');
    console.log('📊 Test result:');
    console.log(`   Keyword: ${result.keyword}`);
    console.log(`   Position: ${result.position}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Total Results: ${result.totalResults}`);
    
  } catch (error) {
    console.log('❌ API connection failed:');
    console.log(error.message);
  }
}

testValueSerpConnection();