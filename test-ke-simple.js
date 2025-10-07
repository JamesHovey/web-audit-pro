/**
 * Simple test to verify Keywords Everywhere API fix
 */

require('dotenv').config({ path: '.env.local' });

async function testAPI() {
  console.log('🔍 Testing Keywords Everywhere API with CPC fix...\n');
  
  const apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
  if (!apiKey) {
    console.log('❌ API key not found');
    return;
  }

  try {
    const response = await fetch('https://api.keywordseverywhere.com/v1/get_keyword_data', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        kw: ['digital marketing', 'seo services'],
        country: 'GB',
        currency: 'GBP',
        dataSource: 'gkp'
      })
    });

    const data = await response.json();
    
    console.log('✅ Raw API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Test the CPC parsing fix
    console.log('\n📊 Processed Results:');
    data.data.forEach(item => {
      console.log(`\n"${item.keyword}"`);
      console.log(`   Volume: ${item.vol.toLocaleString()}/month`);
      console.log(`   Competition: ${item.competition}`);
      
      // This is the fix - handle CPC object properly
      const cpc = typeof item.cpc === 'object' ? parseFloat(item.cpc.value) || 0 : item.cpc || 0;
      console.log(`   CPC: £${cpc}`);
    });
    
    console.log(`\n💳 Credits remaining: ${data.credits.toLocaleString()}`);
    console.log(`💸 Credits consumed: ${data.credits_consumed}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();