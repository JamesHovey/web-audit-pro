/**
 * Test the fixed Keywords Everywhere service
 */

require('dotenv').config({ path: '.env.local' });

async function testFixedService() {
  console.log('🔍 Testing FIXED Keywords Everywhere Service...\n');
  
  try {
    // Import the compiled TypeScript service
    const { KeywordsEverywhereService } = require('./lib/keywordsEverywhereService.ts');
    const service = new KeywordsEverywhereService();
    
    const testKeywords = ['digital marketing', 'seo services'];
    console.log(`🧪 Testing with keywords: ${testKeywords.join(', ')}`);
    
    const result = await service.getSearchVolumes(testKeywords, 'gb', 'gbp');
    
    console.log('✅ Service Response:');
    result.forEach(keyword => {
      console.log(`\n📊 "${keyword.keyword}"`);
      console.log(`   Volume: ${keyword.volume.toLocaleString()}/month`);
      console.log(`   Competition: ${keyword.competition}`);
      console.log(`   CPC: £${keyword.cpc}`);
    });
    
    console.log(`\n💳 Total credits used: ${service.getCreditsUsed()}`);
    
  } catch (error) {
    console.error('❌ Service Error:', error.message);
  }
}

testFixedService();