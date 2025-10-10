/**
 * Direct test of Keywords Everywhere API to check country parameters
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testKeywordsEverywhereCountry() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in environment');
        return;
    }
    
    const testKeywords = ['henryadams']; // Back to the original test
    const url = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    
    console.log('🧪 Testing Keywords Everywhere API directly...\n');
    
    const countryTests = [
        { name: 'UK', country: 'UK', currency: 'GBP' },
        { name: 'US', country: 'US', currency: 'USD' },
        { name: 'GB', country: 'GB', currency: 'GBP' },
        { name: 'United Kingdom', country: 'United Kingdom', currency: 'GBP' }
    ];
    
    for (const test of countryTests) {
        console.log(`🌍 Testing ${test.name} (country: ${test.country}, currency: ${test.currency})`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    kw: testKeywords,
                    country: test.country,
                    currency: test.currency,
                    dataSource: 'gkp'
                })
            });
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                console.log(`✅ ${test.name} - henryadams volume: ${data.data[0].vol}, CPC: ${data.data[0].cpc?.currency}${data.data[0].cpc?.value}`);
            } else {
                console.log(`❌ ${test.name} - No data returned:`, data);
            }
            console.log('');
            
        } catch (error) {
            console.error(`❌ ${test.name} test failed:`, error.message);
        }
    }
}

testKeywordsEverywhereCountry();