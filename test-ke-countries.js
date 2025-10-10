/**
 * Test available endpoints and country data from Keywords Everywhere API
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testCountriesEndpoint() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in environment');
        return;
    }
    
    console.log('🧪 Testing Keywords Everywhere API endpoints...\n');
    
    const endpoints = [
        'https://api.keywordseverywhere.com/v1/countries',
        'https://api.keywordseverywhere.com/v1/get_countries', 
        'https://api.keywordseverywhere.com/countries',
        'https://api.keywordseverywhere.com/get_countries'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`🔍 Testing: ${endpoint}`);
        
        try {
            // Try GET request
            const getResponse = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            if (getResponse.ok) {
                const getData = await getResponse.json();
                console.log(`✅ GET ${endpoint}:`, getData);
            } else {
                console.log(`❌ GET ${endpoint}: ${getResponse.status} ${getResponse.statusText}`);
            }
            
        } catch (error) {
            console.log(`❌ GET ${endpoint}: ${error.message}`);
        }
        
        try {
            // Try POST request 
            const postResponse = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            if (postResponse.ok) {
                const postData = await postResponse.json();
                console.log(`✅ POST ${endpoint}:`, postData);
            } else {
                console.log(`❌ POST ${endpoint}: ${postResponse.status} ${postResponse.statusText}`);
            }
            
        } catch (error) {
            console.log(`❌ POST ${endpoint}: ${error.message}`);
        }
        
        console.log('');
    }
}

testCountriesEndpoint();