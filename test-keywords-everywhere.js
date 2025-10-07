/**
 * Test Keywords Everywhere API Integration
 * This script will test if the API is working properly
 */

require('dotenv').config({ path: '.env.local' });

async function testKeywordsEverywhere() {
  console.log('🔍 Testing Keywords Everywhere API...\n');
  
  // Check environment variables
  const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
  console.log(`📋 API Key configured: ${apiKey ? '✅ Yes (' + apiKey.substring(0, 8) + '...)' : '❌ No'}`);
  
  if (!apiKey) {
    console.log('❌ Please add KEYWORDS_EVERYWHERE_API_KEY to your .env.local file');
    return;
  }

  try {
    // Test API directly with fetch
    console.log('🔗 Testing direct API call...');
    
    const testKeywords = ['digital marketing'];
    const response = await fetch('https://api.keywordseverywhere.com/v1/get_keyword_data', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        kw: testKeywords,
        country: 'GB',
        currency: 'GBP',
        dataSource: 'gkp'
      })
    });
    
    console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error Response:', errorText);
      return;
    }
    
    const result = await response.json();
    
    console.log('✅ API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result && result.data && result.data.length > 0) {
      const keyword = result.data[0];
      console.log(`\n📊 Results for "${keyword.keyword || keyword.kw}":`);
      console.log(`   Search Volume: ${keyword.vol ? keyword.vol.toLocaleString() : 'N/A'}/month`);
      console.log(`   Competition: ${keyword.competition || 'N/A'}`);
      console.log(`   CPC: £${keyword.cpc || 'N/A'}`);
      
      if (result.credits_used) {
        console.log(`\n💳 Credits used in this test: ${result.credits_used}`);
      }
      if (result.credits_remaining) {
        console.log(`💰 Credits remaining: ${result.credits_remaining.toLocaleString()}`);
      }
    } else {
      console.log('⚠️ API returned empty results');
      console.log('Full response:', result);
    }
    
  } catch (error) {
    console.error('❌ Keywords Everywhere API Error:');
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('401')) {
      console.log('\n🔑 This looks like an authentication error. Check your API key.');
    } else if (error.message.includes('429')) {
      console.log('\n⏰ Rate limit exceeded. Wait a moment and try again.');
    } else if (error.message.includes('402')) {
      console.log('\n💰 Payment required. Your credits may be exhausted.');
    }
  }
}

// Run the test
testKeywordsEverywhere().catch(console.error);