/**
 * Test Keywords Everywhere API with henryadams keywords for UK
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.KEYWORDS_EVERYWHERE_API_KEY;

if (!API_KEY) {
    console.error('❌ KEYWORDS_EVERYWHERE_API_KEY not found in .env.local');
    process.exit(1);
}

async function testHenryAdamsUK() {
    console.log('🧪 Testing henryadams keywords with UK country code\n');
    console.log('=' .repeat(60));
    
    const endpoint = 'https://api.keywordseverywhere.com/v1/get_keyword_data';
    const keywords = ['henryadams', 'henry adams'];
    
    // Test with lowercase 'uk' (the supported format)
    console.log('📍 Testing with country="uk" (lowercase)\n');
    
    const requestBody = {
        kw: keywords,
        country: 'uk',
        currency: 'GBP',
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
            console.log(`❌ HTTP ${response.status}`);
            return;
        }
        
        const data = await response.json();
        
        console.log('\n✅ Results for UK:');
        console.log('-'.repeat(40));
        
        data.data?.forEach(item => {
            console.log(`\n📊 Keyword: "${item.keyword}"`);
            console.log(`   Volume: ${item.vol?.toLocaleString()} searches/month`);
            console.log(`   CPC: £${item.cpc?.value}`);
            console.log(`   Competition: ${item.competition}`);
        });
        
        // Now compare with US data
        console.log('\n\n📍 Testing with country="us" for comparison\n');
        
        const usRequestBody = {
            kw: keywords,
            country: 'us',
            currency: 'USD',
            dataSource: 'gkp'
        };
        
        const usResponse = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usRequestBody)
        });
        
        if (usResponse.ok) {
            const usData = await usResponse.json();
            
            console.log('✅ Results for US:');
            console.log('-'.repeat(40));
            
            usData.data?.forEach(item => {
                console.log(`\n📊 Keyword: "${item.keyword}"`);
                console.log(`   Volume: ${item.vol?.toLocaleString()} searches/month`);
                console.log(`   CPC: $${item.cpc?.value}`);
                console.log(`   Competition: ${item.competition}`);
            });
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 COMPARISON SUMMARY:\n');
        
        const ukHenryAdams = data.data?.find(k => k.keyword === 'henryadams');
        const ukHenryAdamsSpace = data.data?.find(k => k.keyword === 'henry adams');
        const usHenryAdams = usData?.data?.find(k => k.keyword === 'henryadams');
        const usHenryAdamsSpace = usData?.data?.find(k => k.keyword === 'henry adams');
        
        console.log('UK "henryadams":   ', ukHenryAdams?.vol?.toLocaleString() || 'N/A', 'searches/month');
        console.log('UK "henry adams":  ', ukHenryAdamsSpace?.vol?.toLocaleString() || 'N/A', 'searches/month');
        console.log('US "henryadams":   ', usHenryAdams?.vol?.toLocaleString() || 'N/A', 'searches/month');
        console.log('US "henry adams":  ', usHenryAdamsSpace?.vol?.toLocaleString() || 'N/A', 'searches/month');
        
        console.log('\n💡 Expected UK values:');
        console.log('   "henryadams": 3,600 searches/month');
        console.log('   "henry adams": 9,900 searches/month');
        
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Run the test
testHenryAdamsUK().catch(console.error);