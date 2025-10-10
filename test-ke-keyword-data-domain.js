/**
 * Test if keyword data endpoint accepts domain parameters for backlinks
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testKeywordDataWithDomain() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    const url = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    const testDomain = 'henryadams.co.uk';
    
    console.log('🔍 Testing keyword data endpoint with domain parameters...\n');
    
    const tests = [
        {
            name: 'Domain parameter',
            params: {
                domain: testDomain,
                country: 'UK',
                currency: 'GBP'
            }
        },
        {
            name: 'URL parameter',
            params: {
                url: testDomain,
                country: 'UK',
                currency: 'GBP'
            }
        },
        {
            name: 'Website parameter',
            params: {
                website: testDomain,
                country: 'UK',
                currency: 'GBP'
            }
        },
        {
            name: 'Domain with backlinks flag',
            params: {
                domain: testDomain,
                country: 'UK',
                currency: 'GBP',
                include_backlinks: true
            }
        },
        {
            name: 'Domain with data_type backlinks',
            params: {
                domain: testDomain,
                country: 'UK',
                currency: 'GBP',
                data_type: 'backlinks'
            }
        },
        {
            name: 'Domain with type backlinks',
            params: {
                domain: testDomain,
                country: 'UK',
                currency: 'GBP',
                type: 'backlinks'
            }
        },
        {
            name: 'Domain analysis request',
            params: {
                domain: testDomain,
                country: 'UK',
                currency: 'GBP',
                analysis_type: 'domain'
            }
        }
    ];
    
    for (const test of tests) {
        console.log(`🔍 Testing: ${test.name}`);
        console.log(`📤 Params:`, JSON.stringify(test.params, null, 2));
        
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
            
            if (response.ok) {
                console.log(`✅ ${test.name} - Success:`, JSON.stringify(data).substring(0, 300) + '...');
            } else {
                console.log(`❌ ${test.name} - Error:`, data);
            }
            
        } catch (error) {
            console.error(`❌ ${test.name} failed:`, error.message);
        }
        
        console.log('');
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

testKeywordDataWithDomain();