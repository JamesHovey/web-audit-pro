/**
 * Test Keywords Everywhere API with officially supported countries
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY;

if (!API_KEY) {
    console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in .env.local');
    process.exit(1);
}

async function testSupportedCountries() {
    console.log('🧪 Testing Keywords Everywhere API with Officially Supported Countries\n');
    console.log('=' .repeat(70));
    
    // Use the exact country codes from the API
    const supportedCountries = {
        '': { name: 'Global', currency: 'USD' },
        'au': { name: 'Australia', currency: 'AUD' },
        'ca': { name: 'Canada', currency: 'CAD' },
        'in': { name: 'India', currency: 'INR' },
        'nz': { name: 'New Zealand', currency: 'NZD' },
        'za': { name: 'South Africa', currency: 'ZAR' },
        'uk': { name: 'United Kingdom', currency: 'GBP' },
        'us': { name: 'United States', currency: 'USD' }
    };
    
    const testKeywords = ['insurance', 'coffee', 'real estate'];
    const endpoint = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    
    const results = {};
    
    console.log(`Testing with keywords: ${testKeywords.join(', ')}\n`);
    
    for (const [countryCode, countryInfo] of Object.entries(supportedCountries)) {
        const displayCode = countryCode || 'GLOBAL';
        console.log(`\n📍 Testing ${countryInfo.name} (${displayCode})`);
        console.log('-'.repeat(50));
        
        const requestBody = {
            kw: testKeywords,
            dataSource: 'gkp'
        };
        
        // Add country only if not global
        if (countryCode) {
            requestBody.country = countryCode;
            requestBody.currency = countryInfo.currency;
        }
        
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
                console.log(`❌ HTTP ${response.status}: ${errorText.substring(0, 200)}`);
                continue;
            }
            
            const data = await response.json();
            
            if (data.error) {
                console.log(`❌ API Error: ${data.error}`);
                continue;
            }
            
            results[displayCode] = {};
            
            data.data?.forEach(item => {
                results[displayCode][item.keyword] = {
                    volume: item.vol,
                    cpc: item.cpc?.value,
                    currency: item.cpc?.currency || countryInfo.currency
                };
                
                console.log(`  ✅ ${item.keyword}: ${item.vol?.toLocaleString()} searches/month`);
            });
            
            if (data.credits_consumed) {
                console.log(`  💰 Credits consumed: ${data.credits_consumed}`);
            }
            
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
    }
    
    // Analysis
    console.log('\n' + '='.repeat(70));
    console.log('📊 SEARCH VOLUME COMPARISON BY COUNTRY\n');
    
    for (const keyword of testKeywords) {
        console.log(`\n"${keyword}" search volumes:`);
        console.log('-'.repeat(40));
        
        const volumes = [];
        for (const [country, data] of Object.entries(results)) {
            const volume = data[keyword]?.volume;
            if (volume !== undefined) {
                volumes.push({ country, volume });
                console.log(`  ${country.padEnd(10)}: ${volume?.toLocaleString().padStart(12)} searches/month`);
            }
        }
        
        // Check for variation
        const uniqueVolumes = [...new Set(volumes.map(v => v.volume))];
        if (uniqueVolumes.length > 1) {
            console.log(`  ✅ Different volumes detected across countries!`);
            const max = Math.max(...uniqueVolumes);
            const min = Math.min(...uniqueVolumes);
            console.log(`     Range: ${min.toLocaleString()} - ${max.toLocaleString()}`);
        } else if (uniqueVolumes.length === 1) {
            console.log(`  ⚠️  Same volume (${uniqueVolumes[0].toLocaleString()}) across all countries`);
        }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🔍 FINAL ANALYSIS:\n');
    
    // Check if any keyword has different volumes
    let hasCountryDifferences = false;
    for (const keyword of testKeywords) {
        const volumes = Object.entries(results)
            .map(([country, data]) => data[keyword]?.volume)
            .filter(v => v !== undefined);
        const uniqueVolumes = [...new Set(volumes)];
        if (uniqueVolumes.length > 1) {
            hasCountryDifferences = true;
            break;
        }
    }
    
    if (hasCountryDifferences) {
        console.log('✅ SUCCESS: The API returns different search volumes for different countries!');
        console.log('\n💡 To get country-specific data:');
        console.log('   1. Use lowercase country codes: uk, us, au, ca, in, nz, za');
        console.log('   2. Use empty string "" for global data');
        console.log('   3. Include appropriate currency code for each country');
    } else {
        console.log('⚠️  WARNING: All countries returned identical search volumes');
        console.log('\n💡 Possible issues:');
        console.log('   1. Your plan might not include country-specific data');
        console.log('   2. The API might be defaulting to global/US data');
        console.log('   3. Contact Keywords Everywhere support for clarification');
    }
}

// Run the test
testSupportedCountries().catch(console.error);