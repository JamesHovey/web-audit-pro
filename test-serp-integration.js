/**
 * Simple test to verify ValueSERP integration through the actual application
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testIntegration() {
  console.log('🔍 Testing ValueSERP integration...');
  
  // Check environment variables
  const valueSerpKey = process.env.VALUESERP_API_KEY;
  const keywordsEverywhereKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
  
  console.log('📋 Environment check:');
  console.log(`   ValueSERP API key: ${valueSerpKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Keywords Everywhere: ${keywordsEverywhereKey ? '✅ Configured' : '❌ Missing'}`);
  
  if (!valueSerpKey) {
    console.log('❌ ValueSERP API key not found. Please add VALUESERP_API_KEY to .env.local');
    return;
  }
  
  // Test the server endpoint instead
  console.log('\n🌐 Testing through audit API endpoint...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:3000/api/audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://pmwcom.co.uk',
        auditTypes: ['keywords']
      })
    });
    
    if (!response.ok) {
      console.log(`❌ API request failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    if (data.keywords && data.keywords.aboveFoldAnalysis) {
      const analysis = data.keywords.aboveFoldAnalysis;
      console.log('✅ Above Fold Analysis received:');
      console.log(`   Discovery Method: ${analysis.discoveryMethod}`);
      console.log(`   Total Keywords: ${analysis.totalFound}`);
      console.log(`   Credits Used: ${analysis.creditsUsed || 0}`);
      
      if (analysis.keywords && analysis.keywords.length > 0) {
        console.log('\n🎯 Sample keywords:');
        analysis.keywords.slice(0, 5).forEach((kw, i) => {
          const status = kw.isActualRanking ? `REAL #${kw.position}` : 
                        kw.position === 0 ? 'OPPORTUNITY' : 
                        `${Math.round((kw.contentRelevance || 0) * 100)}% relevant`;
          console.log(`   ${i + 1}. "${kw.keyword}" - ${status} (vol: ${kw.volume || 0})`);
        });
      }
    } else {
      console.log('❌ No Above Fold Analysis in response');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
  }
}

testIntegration();