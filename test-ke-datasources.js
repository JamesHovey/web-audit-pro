/**
 * Test different dataSource parameters for Keywords Everywhere API
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testDataSources() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    const testKeywords = ['henryadams'];
    const url = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    
    console.log('🧪 Testing different dataSource parameters...\n');
    
    const tests = [
        { name: 'GKP (Google Keyword Planner)', country: 'UK', currency: 'GBP', dataSource: 'gkp' },
        { name: 'CLI (Clickstream)', country: 'UK', currency: 'GBP', dataSource: 'cli' },
        { name: 'No dataSource', country: 'UK', currency: 'GBP' }, // omit dataSource
        { name: 'Global GKP', country: '', currency: 'USD', dataSource: 'gkp' },
        { name: 'Global CLI', country: '', currency: 'USD', dataSource: 'cli' },
        { name: 'Global No dataSource', country: '', currency: 'USD' }
    ];
    
    for (const test of tests) {
        console.log(`🔍 Testing: ${test.name}`);
        
        try {
            const requestBody = {
                kw: testKeywords,
                country: test.country,
                currency: test.currency
            };
            
            if (test.dataSource) {
                requestBody.dataSource = test.dataSource;
            }
            
            console.log(`📤 Request:`, requestBody);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                console.log(`✅ ${test.name} - Volume: ${data.data[0].vol}, CPC: ${data.data[0].cpc?.currency}${data.data[0].cpc?.value}`);
            } else {
                console.log(`❌ ${test.name} - Error:`, data);
            }
            
        } catch (error) {
            console.error(`❌ ${test.name} failed:`, error.message);
        }
        
        console.log('');
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

testDataSources();