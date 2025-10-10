/**
 * Test Keywords Everywhere API backlinks endpoints
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testBacklinksEndpoints() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    const testDomain = 'henryadams.co.uk';
    
    console.log('🔗 Testing Keywords Everywhere backlinks endpoints...\n');
    
    const endpoints = [
        'https://api.keywordseverywhere.com/v1/backlinks',
        'https://api.keywordseverywhere.com/v1/get_backlinks',
        'https://api.keywordseverywhere.com/v1/backlink_data',
        'https://api.keywordseverywhere.com/v1/get_backlink_data',
        'https://api.keywordseverywhere.com/backlinks',
        'https://api.keywordseverywhere.com/get_backlinks'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`🔍 Testing: ${endpoint}`);
        
        // Try GET method
        try {
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
            } else if (getResponse.status === 405) {
                console.log(`⚠️ GET ${endpoint}: Method not allowed (405) - trying POST`);
            } else {
                console.log(`❌ GET ${endpoint}: ${getResponse.status} ${getResponse.statusText}`);
            }
            
        } catch (error) {
            console.log(`❌ GET ${endpoint}: ${error.message}`);
        }
        
        // Try POST method with domain
        try {
            const postResponse = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    domain: testDomain,
                    url: testDomain,
                    website: testDomain
                })
            });
            
            if (postResponse.ok) {
                const postData = await postResponse.json();
                console.log(`✅ POST ${endpoint}:`, postData);
            } else if (postResponse.status === 404) {
                console.log(`❌ POST ${endpoint}: 404 Not Found`);
            } else {
                console.log(`❌ POST ${endpoint}: ${postResponse.status} ${postResponse.statusText}`);
            }
            
        } catch (error) {
            console.log(`❌ POST ${endpoint}: ${error.message}`);
        }
        
        console.log('');
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

testBacklinksEndpoints();