/**
 * Debug ValueSERP integration to confirm it's working correctly
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testValueSerpDebug() {
  console.log('🔍 Testing ValueSERP API with debug info...');
  
  // Check if API key is configured
  const apiKey = process.env.VALUESERP_API_KEY;
  if (!apiKey) {
    console.log('❌ VALUESERP_API_KEY not found in environment variables');
    return;
  }
  
  console.log('✅ API key found in environment');
  
  try {
    const { ValueSerpService } = require('./lib/valueSerpService.ts');
    const service = new ValueSerpService();
    
    console.log('📡 Testing specific keyword for vantagehouse.com...');
    
    // Test with a keyword that should rank
    const result = await service.getKeywordRankings(
      'chocolate machines', // This showed as Position 3 in logs
      'vantagehouse.com',
      'United Kingdom',
      10
    );
    
    console.log('✅ ValueSERP API response:');
    console.log(`   Keyword: "${result.keyword}"`);
    console.log(`   Position: ${result.position}`);
    console.log(`   URL: ${result.url}`);
    console.log(`   Total Results: ${result.totalResults}`);
    console.log(`   Raw Response Type: ${typeof result}`);
    console.log(`   Position Type: ${typeof result.position}`);
    console.log(`   Position Value: ${JSON.stringify(result.position)}`);
    
    if (result.position !== null) {
      console.log(`🎯 SUCCESS: Found ranking at position ${result.position}`);
    } else {
      console.log(`❌ No ranking found for this keyword`);
    }
    
  } catch (error) {
    console.log('❌ API test failed:');
    console.log(error.message);
    console.log(error.stack);
  }
}

testValueSerpDebug();