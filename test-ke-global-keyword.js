/**
 * Test Keywords Everywhere API with a global keyword to verify country-specific volumes
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY;

if (!API_KEY) {
    console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in .env.local');
    process.exit(1);
}

async function testGlobalKeyword() {
    console.log('🧪 Testing Keywords Everywhere API with Global Keywords\n');
    console.log('=' .repeat(60));
    
    // Test with more globally recognized keywords
    const testKeywords = ['coffee', 'real estate', 'insurance'];
    const endpoint = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    
    // Test UK vs US
    const countries = [
        { code: 'UK', currency: 'GBP', name: 'United Kingdom' },
        { code: 'US', currency: 'USD', name: 'United States' },
        { code: 'AU', currency: 'AUD', name: 'Australia' },
        { code: 'CA', currency: 'CAD', name: 'Canada' }
    ];
    
    const results = {};
    
    for (const country of countries) {
        console.log(`\n📍 Testing ${country.name} (${country.code})`);
        console.log('-'.repeat(40));
        
        const requestBody = {
            kw: testKeywords,
            country: country.code,
            currency: country.currency,
            dataSource: 'gkp'
        };
        
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
                console.log(`❌ HTTP ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            
            if (!results[country.code]) {
                results[country.code] = {};
            }
            
            data.data?.forEach(item => {
                results[country.code][item.keyword] = {
                    volume: item.vol,
                    cpc: item.cpc?.value,
                    currency: item.cpc?.currency
                };
                
                console.log(`   ${item.keyword}: ${item.vol?.toLocaleString()} searches/month`);
                console.log(`     CPC: ${item.cpc?.value} ${item.cpc?.currency}`);
            });
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
    
    // Compare results
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPARISON OF SEARCH VOLUMES BY COUNTRY\n');
    
    for (const keyword of testKeywords) {
        console.log(`\n"${keyword}":`);
        for (const country of countries) {
            const data = results[country.code]?.[keyword];
            if (data) {
                console.log(`   ${country.code}: ${data.volume?.toLocaleString() || 'N/A'} searches/month`);
            }
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 ANALYSIS:\n');
    
    // Check if volumes differ by country
    let volumesDiffer = false;
    for (const keyword of testKeywords) {
        const volumes = countries.map(c => results[c.code]?.[keyword]?.volume).filter(v => v !== undefined);
        const uniqueVolumes = [...new Set(volumes)];
        if (uniqueVolumes.length > 1) {
            volumesDiffer = true;
            console.log(`✅ "${keyword}" has different volumes across countries`);
        } else {
            console.log(`⚠️  "${keyword}" has the SAME volume across all countries`);
        }
    }
    
    if (!volumesDiffer) {
        console.log('\n⚠️  WARNING: The API appears to be returning the same volumes');
        console.log('   regardless of the country parameter. This suggests:');
        console.log('   1. The API might be defaulting to global/US data');
        console.log('   2. The country parameter might need a different format');
        console.log('   3. Country-specific data might require a different plan/endpoint');
    }
}

// Run the test
testGlobalKeyword().catch(console.error);