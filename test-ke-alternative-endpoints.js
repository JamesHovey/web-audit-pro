/**
 * Test alternative API endpoints that might provide country-specific data
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAlternativeEndpoints() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    const testKeywords = ['henryadams'];
    
    console.log('🧪 Testing alternative API endpoints...\n');
    
    const endpoints = [
        'https://api.keywordseverywhere.com/v1/get_keyword_data',
        'https://api.keywordseverywhere.com/v2/get_keyword_data',
        'https://api.keywordseverywhere.com/get_keyword_data',
        'https://api.keywordseverywhere.com/v1/keyword_data',
        'https://api.keywordseverywhere.com/v1/search_volume',
        'https://api.keywordseverywhere.com/v1/volume',
        'https://api.keywordseverywhere.com/search_volume'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`🔍 Testing: ${endpoint}`);
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    kw: testKeywords,
                    country: 'UK',
                    currency: 'GBP',
                    dataSource: 'gkp'
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.data && data.data.length > 0) {
                console.log(`✅ ${endpoint} - Volume: ${data.data[0].vol}`);
            } else if (response.status === 404) {
                console.log(`❌ ${endpoint} - 404 Not Found`);
            } else {
                console.log(`❌ ${endpoint} - Error ${response.status}:`, data.message || JSON.stringify(data).substring(0, 100));
            }
            
        } catch (error) {
            console.log(`❌ ${endpoint} - Failed: ${error.message}`);
        }
        
        console.log('');
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

testAlternativeEndpoints();