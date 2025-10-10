/**
 * Simple test for Keywords Everywhere countries endpoint
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCountriesEndpoint() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    console.log('🔍 Testing /v1/countries endpoint...');
    
    try {
        const response = await fetch('https://api.keywordseverywhere.com/v1/countries', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Countries endpoint response:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ Countries endpoint error:', response.status, data);
        }
        
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testCountriesEndpoint();