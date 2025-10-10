/**
 * Test with keywords known to have different volumes by country
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testKnownDifferentKeywords() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    const url = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    
    console.log('🧪 Testing keywords with known country differences...\n');
    
    // Keywords that should definitely be different between countries
    const testKeywords = ['football', 'soccer', 'lift', 'elevator', 'mobile phone', 'cell phone'];
    
    const countries = [
        { name: 'Global', country: '', currency: 'USD' },
        { name: 'UK', country: 'UK', currency: 'GBP' },
        { name: 'US', country: 'US', currency: 'USD' }
    ];
    
    for (const keyword of testKeywords) {
        console.log(`\n🔍 Testing keyword: "${keyword}"`);
        console.log('='.repeat(50));
        
        for (const countryConfig of countries) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        kw: [keyword],
                        country: countryConfig.country,
                        currency: countryConfig.currency,
                        dataSource: 'gkp'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.data && data.data.length > 0) {
                    console.log(`${countryConfig.name.padEnd(8)} - Volume: ${data.data[0].vol.toLocaleString().padStart(12)}, CPC: ${data.data[0].cpc?.currency}${data.data[0].cpc?.value}`);
                } else {
                    console.log(`${countryConfig.name.padEnd(8)} - Error:`, data.message || 'Unknown error');
                }
                
            } catch (error) {
                console.error(`${countryConfig.name.padEnd(8)} - Failed:`, error.message);
            }
            
            // Small delay
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

testKnownDifferentKeywords();