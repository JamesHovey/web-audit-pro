/**
 * Test location/region parameters for Keywords Everywhere API
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testLocationParameters() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    const testKeywords = ['henryadams'];
    const url = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    
    console.log('🧪 Testing location/region parameters...\n');
    
    const tests = [
        {
            name: 'UK with location',
            params: {
                kw: testKeywords,
                country: 'UK',
                currency: 'GBP',
                dataSource: 'gkp',
                location: 'United Kingdom'
            }
        },
        {
            name: 'UK with region',
            params: {
                kw: testKeywords,
                country: 'UK',
                currency: 'GBP', 
                dataSource: 'gkp',
                region: 'UK'
            }
        },
        {
            name: 'UK with geo',
            params: {
                kw: testKeywords,
                country: 'UK',
                currency: 'GBP',
                dataSource: 'gkp',
                geo: 'UK'
            }
        },
        {
            name: 'UK with locale',
            params: {
                kw: testKeywords,
                country: 'UK',
                currency: 'GBP',
                dataSource: 'gkp',
                locale: 'en-GB'
            }
        },
        {
            name: 'UK with lang',
            params: {
                kw: testKeywords,
                country: 'UK',
                currency: 'GBP',
                dataSource: 'gkp',
                lang: 'en'
            }
        },
        {
            name: 'UK with target_country',
            params: {
                kw: testKeywords,
                country: 'UK',
                currency: 'GBP',
                dataSource: 'gkp',
                target_country: 'UK'
            }
        }
    ];
    
    for (const test of tests) {
        console.log(`🔍 Testing: ${test.name}`);
        console.log(`📤 Params:`, test.params);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(test.params)
            });
            
            const data = await response.json();
            
            if (response.ok && data.data && data.data.length > 0) {
                console.log(`✅ ${test.name} - Volume: ${data.data[0].vol}, CPC: ${data.data[0].cpc?.currency}${data.data[0].cpc?.value}`);
            } else {
                console.log(`❌ ${test.name} - Error:`, data.message || JSON.stringify(data).substring(0, 100));
            }
            
        } catch (error) {
            console.error(`❌ ${test.name} failed:`, error.message);
        }
        
        console.log('');
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

testLocationParameters();