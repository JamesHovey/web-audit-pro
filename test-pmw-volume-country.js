const { KeywordsEverywhereService } = require('./lib/keywordsEverywhereService.ts');

async function testPMWVolumeCountries() {
  const service = new KeywordsEverywhereService();
  
  const testKeywords = [
    'pmw company',
    'pmw',
    'pmwcom'
  ];
  
  try {
    console.log('🔍 Testing "pmw company" volume in different countries...\n');
    
    // Test with UK (gb -> should convert to uk)
    console.log('1️⃣ Testing with country="gb" (should convert to UK)');
    const gbResult = await service.getSearchVolumes(testKeywords, 'gb', 'gbp');
    console.log('GB Result:', gbResult.map(r => ({ keyword: r.keyword, volume: r.volume, cpc: r.cpc })));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test with explicit UK
    console.log('\n2️⃣ Testing with country="uk" (explicit UK)');
    const ukResult = await service.getSearchVolumes(testKeywords, 'uk', 'gbp');
    console.log('UK Result:', ukResult.map(r => ({ keyword: r.keyword, volume: r.volume, cpc: r.cpc })));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test with US for comparison
    console.log('\n3️⃣ Testing with country="us" (for comparison)');
    const usResult = await service.getSearchVolumes(testKeywords, 'us', 'usd');
    console.log('US Result:', usResult.map(r => ({ keyword: r.keyword, volume: r.volume, cpc: r.cpc })));
    
    // Compare results
    console.log('\n📊 Volume Comparison:');
    testKeywords.forEach(keyword => {
      const gbVol = gbResult.find(r => r.keyword === keyword)?.volume || 0;
      const ukVol = ukResult.find(r => r.keyword === keyword)?.volume || 0;
      const usVol = usResult.find(r => r.keyword === keyword)?.volume || 0;
      
      console.log(`"${keyword}": GB=${gbVol}, UK=${ukVol}, US=${usVol}`);
      
      if (gbVol !== ukVol) {
        console.log(`⚠️  WARNING: GB and UK volumes don't match for "${keyword}"!`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing volumes:', error);
  }
}

testPMWVolumeCountries();