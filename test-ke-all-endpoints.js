/**
 * Test all possible Keywords Everywhere API endpoints
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAllEndpoints() {
    const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    
    if (!apiKey) {
        console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found');
        return;
    }
    
    console.log('🔍 Testing all possible Keywords Everywhere API endpoints...\n');
    
    const baseUrl = 'https://api.keywordseverywhere.com';
    const endpointTests = [
        // Known working endpoints
        '/v1/countries',
        '/v1/currencies', 
        '/v1/get_keyword_data',
        
        // Potential backlinks endpoints
        '/v1/backlinks',
        '/v1/domain_backlinks',
        '/v1/get_backlinks',
        '/v1/domain_data',
        '/v1/domain_analysis',
        '/v1/domain_authority',
        '/v1/website_analysis',
        '/v1/domain_metrics',
        '/v1/moz_data',
        '/v1/authority_metrics',
        '/v1/backlink_analysis',
        '/v1/link_data',
        '/v1/referring_domains',
        '/v1/get_domain_data',
        '/v1/get_domain_metrics',
        '/v1/get_moz_data',
        
        // Other potential endpoints
        '/v1/competitors',
        '/v1/related_domains',
        '/v1/domain_overview',
        '/v1/website_metrics'
    ];
    
    for (const endpoint of endpointTests) {
        const fullUrl = baseUrl + endpoint;
        console.log(`🔍 Testing: ${endpoint}`);
        
        try {
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${endpoint} - Working! Data:`, JSON.stringify(data).substring(0, 200) + '...');
            } else if (response.status === 404) {
                console.log(`❌ ${endpoint} - 404 Not Found`);
            } else if (response.status === 405) {
                console.log(`⚠️ ${endpoint} - 405 Method Not Allowed (might need POST)`);
            } else {
                console.log(`❌ ${endpoint} - ${response.status} ${response.statusText}`);
            }
            
        } catch (error) {
            console.log(`❌ ${endpoint} - Error: ${error.message}`);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎯 Summary: Testing complete');
}

testAllEndpoints();