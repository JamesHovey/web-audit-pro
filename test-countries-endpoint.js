/**
 * Test the Keywords Everywhere /v1/countries endpoint
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY;

if (!API_KEY) {
    console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('🔑 API Key loaded:', API_KEY.substring(0, 10) + '...');

async function testCountriesEndpoint() {
    console.log('\n🧪 Testing https://api.keywordseverywhere.com/v1/countries\n');
    console.log('=' .repeat(60));
    
    const endpoint = 'https://api.keywordseverywhere.com/v1/countries';
    
    // Test with GET request
    console.log('\n📍 Testing GET request');
    console.log('-'.repeat(40));
    
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        console.log(`Response Status: ${response.status} ${response.statusText}`);
        console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('\nRaw Response:', responseText.substring(0, 500));
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('\n✅ Success! Countries data:');
                console.log(JSON.stringify(data, null, 2));
                
                // Analyze the countries
                if (Array.isArray(data)) {
                    console.log(`\n📊 Found ${data.length} countries`);
                    
                    // Look for UK/GB entries
                    const ukEntries = data.filter(c => 
                        JSON.stringify(c).toLowerCase().includes('united kingdom') ||
                        JSON.stringify(c).toLowerCase().includes('uk') ||
                        JSON.stringify(c).toLowerCase().includes('gb')
                    );
                    
                    if (ukEntries.length > 0) {
                        console.log('\n🇬🇧 UK-related entries:');
                        ukEntries.forEach(entry => {
                            console.log('  ', JSON.stringify(entry));
                        });
                    }
                    
                    // Look for US entries
                    const usEntries = data.filter(c => 
                        JSON.stringify(c).toLowerCase().includes('united states') ||
                        JSON.stringify(c).toLowerCase().includes('us')
                    );
                    
                    if (usEntries.length > 0) {
                        console.log('\n🇺🇸 US-related entries:');
                        usEntries.forEach(entry => {
                            console.log('  ', JSON.stringify(entry));
                        });
                    }
                }
            } catch (parseError) {
                console.log('❌ Failed to parse JSON:', parseError.message);
            }
        } else {
            console.log('❌ Request failed');
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
    
    // Test with POST request
    console.log('\n\n📍 Testing POST request');
    console.log('-'.repeat(40));
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        
        console.log(`Response Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log('\nRaw Response:', responseText.substring(0, 500));
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('\n✅ Success! Countries data:');
                console.log(JSON.stringify(data, null, 2).substring(0, 1000));
            } catch (parseError) {
                console.log('❌ Failed to parse JSON:', parseError.message);
            }
        }
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Run the test
testCountriesEndpoint().catch(console.error);