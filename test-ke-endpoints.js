/**
 * Test different Keywords Everywhere API endpoints
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAPIEndpoints() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    console.log('🔍 Testing Keywords Everywhere API endpoints...\n');
    
    const endpoints = [
        { url: 'https://api.keywordseverywhere.com/v1/countries', method: 'GET' },
        { url: 'https://api.keywordseverywhere.com/v1/currencies', method: 'GET' },
        { url: 'https://api.keywordseverywhere.com/v1/get_countries', method: 'GET' },
        { url: 'https://api.keywordseverywhere.com/v1/get_currencies', method: 'GET' },
        { url: 'https://api.keywordseverywhere.com/countries', method: 'GET' },
        { url: 'https://api.keywordseverywhere.com/currencies', method: 'GET' }
    ];
    
    for (const endpoint of endpoints) {
        console.log(`🌍 Testing: ${endpoint.method} ${endpoint.url}`);
        
        try {
            const response = await fetch(endpoint.url, {
                method: endpoint.method,
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                console.log(`✅ Success:`, data);
            } else {
                console.log(`❌ Error ${response.status}:`, data);
            }
            
        } catch (error) {
            console.log(`❌ Failed:`, error.message);
        }
        
        console.log('');
    }
}

testAPIEndpoints();