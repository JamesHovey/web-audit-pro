/**
 * Test different formats for country parameter in Keywords Everywhere API
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY;

if (!API_KEY) {
    console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in .env.local');
    process.exit(1);
}

async function testCountryFormats() {
    console.log('🧪 Testing Different Country Parameter Formats\n');
    console.log('=' .repeat(60));
    
    const testKeyword = 'insurance';
    const endpoint = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    
    // Try different formats for specifying country
    const formatTests = [
        { 
            name: 'Uppercase country code',
            body: { kw: [testKeyword], country: 'GB', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'Lowercase country code', 
            body: { kw: [testKeyword], country: 'gb', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'ISO 3166-1 alpha-3 code',
            body: { kw: [testKeyword], country: 'GBR', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'Full country name',
            body: { kw: [testKeyword], country: 'United Kingdom', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'With location parameter instead',
            body: { kw: [testKeyword], location: 'UK', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'With geo parameter',
            body: { kw: [testKeyword], geo: 'UK', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'With region parameter',
            body: { kw: [testKeyword], region: 'UK', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'With market parameter',
            body: { kw: [testKeyword], market: 'UK', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'With country_code parameter',
            body: { kw: [testKeyword], country_code: 'UK', currency: 'GBP', dataSource: 'gkp' }
        },
        {
            name: 'Multiple parameters (country + location)',
            body: { kw: [testKeyword], country: 'UK', location: 'UK', currency: 'GBP', dataSource: 'gkp' }
        }
    ];
    
    const results = [];
    
    for (const test of formatTests) {
        console.log(`\n📍 Testing: ${test.name}`);
        console.log('-'.repeat(40));
        console.log('Request body:', JSON.stringify(test.body, null, 2));
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test.body)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`❌ HTTP ${response.status}: ${errorText.substring(0, 200)}`);
                results.push({ format: test.name, success: false, volume: null });
                continue;
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.log(`❌ API Error: ${data.error}`);
                results.push({ format: test.name, success: false, volume: null });
                continue;
            }
            
            const keywordData = data.data?.[0];
            if (keywordData) {
                console.log(`✅ Success!`);
                console.log(`   Volume: ${keywordData.vol?.toLocaleString()} searches/month`);
                console.log(`   CPC: ${keywordData.cpc?.value} ${keywordData.cpc?.currency}`);
                results.push({ 
                    format: test.name, 
                    success: true, 
                    volume: keywordData.vol,
                    cpc: keywordData.cpc?.value,
                    currency: keywordData.cpc?.currency
                });
            } else {
                console.log('⚠️ No data returned');
                results.push({ format: test.name, success: false, volume: null });
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            results.push({ format: test.name, success: false, volume: null });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY OF RESULTS\n');
    
    const successfulFormats = results.filter(r => r.success);
    const uniqueVolumes = [...new Set(successfulFormats.map(r => r.volume))];
    
    console.log(`✅ Successful formats: ${successfulFormats.length}/${results.length}`);
    console.log(`📈 Unique volumes found: ${uniqueVolumes.length}`);
    
    if (uniqueVolumes.length > 1) {
        console.log('\n🎯 DIFFERENT VOLUMES DETECTED!');
        successfulFormats.forEach(r => {
            console.log(`   ${r.format}: ${r.volume?.toLocaleString()} (${r.currency})`);
        });
    } else if (uniqueVolumes.length === 1) {
        console.log(`\n⚠️  All successful formats returned the same volume: ${uniqueVolumes[0]?.toLocaleString()}`);
        console.log('   This suggests the API might not be respecting country parameters');
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Contact Keywords Everywhere support for clarification');
    console.log('2. Check if country-specific data requires a specific plan tier');
    console.log('3. Verify the correct parameter format with their documentation');
}

// Run the test
testCountryFormats().catch(console.error);