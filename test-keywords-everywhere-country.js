/**
 * Test script to verify Keywords Everywhere API country parameter
 */

const { KeywordsEverywhereService } = require('./lib/keywordsEverywhereService.ts');

async function testCountryParameters() {
    console.log('🧪 Testing Keywords Everywhere API country parameters...\n');
    
    const service = new KeywordsEverywhereService();
    const testKeywords = ['henryadams', 'henry adams'];
    
    try {
        // Test 1: UK (should return 3,600 for henryadams)
        console.log('1️⃣ Testing with country="uk", currency="gbp"');
        const ukResult = await service.getSearchVolumes(testKeywords, 'uk', 'gbp');
        console.log('UK Results:', ukResult);
        console.log('');
        
        // Test 2: US (should return 9,900 for henryadams)  
        console.log('2️⃣ Testing with country="us", currency="usd"');
        const usResult = await service.getSearchVolumes(testKeywords, 'us', 'usd');
        console.log('US Results:', usResult);
        console.log('');
        
        // Test 3: GB (transformed to UK)
        console.log('3️⃣ Testing with country="gb", currency="gbp" (should transform to uk)');
        const gbResult = await service.getSearchVolumes(testKeywords, 'gb', 'gbp');
        console.log('GB Results:', gbResult);
        console.log('');
        
        console.log('📊 Summary:');
        console.log(`UK henryadams volume: ${ukResult.find(k => k.keyword === 'henryadams')?.volume || 'N/A'}`);
        console.log(`US henryadams volume: ${usResult.find(k => k.keyword === 'henryadams')?.volume || 'N/A'}`);
        console.log(`GB henryadams volume: ${gbResult.find(k => k.keyword === 'henryadams')?.volume || 'N/A'}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testCountryParameters();