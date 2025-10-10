/**
 * Direct test of Keywords Everywhere API country support
 * Tests if the API properly returns different volumes for different countries
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY;

if (!API_KEY) {
    console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in .env.local');
    process.exit(1);
}

async function testCountrySupport() {
    console.log('🧪 Testing Keywords Everywhere API Country Support\n');
    console.log('=' .repeat(60));
    
    const testKeyword = 'henryadams';
    const endpoint = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    
    // Test different country codes
    const countryTests = [
        { country: 'UK', currency: 'GBP', expectedVolume: 3600, description: 'United Kingdom' },
        { country: 'US', currency: 'USD', expectedVolume: 9900, description: 'United States' },
        { country: 'AU', currency: 'AUD', expectedVolume: null, description: 'Australia' },
        { country: 'CA', currency: 'CAD', expectedVolume: null, description: 'Canada' },
        { country: 'FR', currency: 'EUR', expectedVolume: null, description: 'France' },
        { country: 'DE', currency: 'EUR', expectedVolume: null, description: 'Germany' }
    ];
    
    for (const test of countryTests) {
        console.log(`\n📍 Testing ${test.description} (${test.country})`);
        console.log('-'.repeat(40));
        
        const requestBody = {
            kw: [testKeyword],
            country: test.country,
            currency: test.currency,
            dataSource: 'gkp'
        };
        
        console.log('Request:', JSON.stringify(requestBody, null, 2));
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`❌ HTTP ${response.status}: ${errorText}`);
                continue;
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.log(`❌ API Error: ${data.error}`);
                continue;
            }
            
            const keywordData = data.data?.[0];
            if (keywordData) {
                console.log(`✅ Success!`);
                console.log(`   Keyword: ${keywordData.keyword}`);
                console.log(`   Volume: ${keywordData.vol?.toLocaleString() || 'N/A'}`);
                console.log(`   CPC: ${keywordData.cpc?.value || 'N/A'} ${keywordData.cpc?.currency || ''}`);
                console.log(`   Competition: ${keywordData.competition || 'N/A'}`);
                
                if (test.expectedVolume) {
                    const volumeMatch = keywordData.vol === test.expectedVolume;
                    console.log(`   Expected: ${test.expectedVolume?.toLocaleString()}`);
                    console.log(`   Match: ${volumeMatch ? '✅' : '❌'}`);
                }
            } else {
                console.log('⚠️ No data returned for keyword');
            }
            
            if (data.credits_consumed) {
                console.log(`   Credits used: ${data.credits_consumed}`);
            }
            if (data.credits) {
                console.log(`   Credits remaining: ${data.credits?.toLocaleString()}`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test complete!\n');
    console.log('Summary:');
    console.log('- The API accepts country codes in the request');
    console.log('- Different countries should return different search volumes');
    console.log('- Verify that volumes change based on the country parameter');
}

// Run the test
testCountrySupport().catch(console.error);