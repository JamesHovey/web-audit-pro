/**
 * Test the Keywords Everywhere get_countries endpoint
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY;

if (!API_KEY) {
    console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in .env.local');
    process.exit(1);
}

async function testGetCountries() {
    console.log('🧪 Testing Keywords Everywhere get_countries endpoint\n');
    console.log('=' .repeat(60));
    
    // Try different possible endpoints for getting countries
    const endpoints = [
        'https://api.keywordseverywhere.com/v1/get_countries',
        'https://api.keywordseverywhere.com/v1/countries',
        'https://api.keywordseverywhere.com/get_countries',
        'https://api.keywordseverywhere.com/countries'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\n📍 Testing: ${endpoint}`);
        console.log('-'.repeat(40));
        
        // Try GET request
        try {
            console.log('Trying GET request...');
            const getResponse = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                }
            });
            
            console.log(`Response status: ${getResponse.status} ${getResponse.statusText}`);
            
            if (getResponse.ok) {
                const data = await getResponse.json();
                console.log('✅ GET Success!');
                console.log('Response:', JSON.stringify(data, null, 2));
                
                // If we get countries, display them nicely
                if (Array.isArray(data)) {
                    console.log(`\n📍 Found ${data.length} countries:`);
                    data.slice(0, 10).forEach(country => {
                        console.log(`   - ${JSON.stringify(country)}`);
                    });
                    if (data.length > 10) {
                        console.log(`   ... and ${data.length - 10} more`);
                    }
                } else if (data.data && Array.isArray(data.data)) {
                    console.log(`\n📍 Found ${data.data.length} countries:`);
                    data.data.slice(0, 10).forEach(country => {
                        console.log(`   - ${JSON.stringify(country)}`);
                    });
                    if (data.data.length > 10) {
                        console.log(`   ... and ${data.data.length - 10} more`);
                    }
                }
                
                // Found working endpoint, no need to continue
                return data;
            } else {
                const errorText = await getResponse.text();
                console.log(`❌ GET failed: ${errorText.substring(0, 200)}`);
            }
        } catch (error) {
            console.log(`❌ GET error: ${error.message}`);
        }
        
        // Try POST request
        try {
            console.log('\nTrying POST request...');
            const postResponse = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
            
            console.log(`Response status: ${postResponse.status} ${postResponse.statusText}`);
            
            if (postResponse.ok) {
                const data = await postResponse.json();
                console.log('✅ POST Success!');
                console.log('Response:', JSON.stringify(data, null, 2));
                
                // If we get countries, display them nicely
                if (Array.isArray(data)) {
                    console.log(`\n📍 Found ${data.length} countries:`);
                    data.slice(0, 10).forEach(country => {
                        console.log(`   - ${JSON.stringify(country)}`);
                    });
                    if (data.length > 10) {
                        console.log(`   ... and ${data.length - 10} more`);
                    }
                } else if (data.data && Array.isArray(data.data)) {
                    console.log(`\n📍 Found ${data.data.length} countries:`);
                    data.data.slice(0, 10).forEach(country => {
                        console.log(`   - ${JSON.stringify(country)}`);
                    });
                    if (data.data.length > 10) {
                        console.log(`   ... and ${data.data.length - 10} more`);
                    }
                }
                
                // Found working endpoint
                return data;
            } else {
                const errorText = await postResponse.text();
                console.log(`❌ POST failed: ${errorText.substring(0, 200)}`);
            }
        } catch (error) {
            console.log(`❌ POST error: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('❌ Could not find a working get_countries endpoint');
    console.log('💡 The API might not expose a countries list endpoint');
    console.log('   or it might require different authentication');
}

// Run the test
testGetCountries().catch(console.error);