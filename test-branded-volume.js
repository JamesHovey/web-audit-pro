/**
 * Test branded keyword volume issue
 * Compare API vs estimated volumes
 */

require('dotenv').config({ path: '.env.local' });

async function testBrandedVolume() {
  console.log('🔍 Testing branded keyword volume discrepancy...\n');

  try {
    // Test the Keywords Everywhere API directly for "pmwcom"
    const { KeywordsEverywhereService } = require('./lib/keywordsEverywhereService.ts');
    const service = new KeywordsEverywhereService();
    
    console.log('📊 Testing real API volumes...');
    const apiResult = await service.getSearchVolumes(['pmwcom'], 'gb', 'gbp');
    
    console.log('✅ API Result:');
    apiResult.forEach(k => {
      console.log(`   "${k.keyword}": ${k.volume}/month (API)`);
    });
    
    // Test the estimation function
    console.log('\n🔧 Testing estimation function...');
    
    // Simulate what the enhanced service does
    const estimateVolume = (potential) => {
      switch (potential) {
        case 'high': return 1000;
        case 'medium': return 300;
        case 'low': return 100;
      }
    };
    
    console.log('📈 Estimated Volumes:');
    console.log(`   "pmwcom" (low): ${estimateVolume('low')}/month (estimated)`);
    console.log(`   "pmwcom" (medium): ${estimateVolume('medium')}/month (estimated)`);
    console.log(`   "pmwcom" (high): ${estimateVolume('high')}/month (estimated)`);
    
    console.log('\n❌ PROBLEM IDENTIFIED:');
    console.log(`   Browser plugin: 10/month`);
    console.log(`   API result: ${apiResult[0]?.volume || 'N/A'}/month`);
    console.log(`   App showing: 100/month (estimated 'low' potential)`);
    console.log('\n🔧 SOLUTION: Use real API data instead of estimates for branded keywords');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBrandedVolume();