/**
 * Test keyword generation for mondeumcapital.co.uk
 */

require('dotenv').config({ path: '.env.local' });

async function testMondeumKeywords() {
  console.log('🔍 Testing keyword generation for mondeumcapital.co.uk...\n');

  try {
    // Test business detection
    const { EnhancedBusinessDetectionService } = require('./lib/enhancedBusinessDetection.ts');
    const businessDetector = new EnhancedBusinessDetectionService();
    
    // Fetch the site content
    const response = await fetch('https://staging-site.mondeumcapital.co.uk');
    const html = await response.text();
    
    console.log('📄 Fetched site content, testing business detection...');
    
    const businessResult = await businessDetector.detectBusinessType('staging-site.mondeumcapital.co.uk', html);
    
    console.log('🏢 Business Detection Result:');
    console.log(`   Primary Type: ${businessResult.primaryType.category} - ${businessResult.primaryType.subcategory}`);
    console.log(`   Confidence: ${businessResult.primaryType.confidence}`);
    console.log(`   Methods: ${businessResult.primaryType.detectionMethods.join(', ')}`);
    
    // Test keyword generation
    console.log('\n🎯 Testing Enhanced Keyword Service...');
    const { EnhancedKeywordService } = require('./lib/enhancedKeywordService.ts');
    const keywordService = new EnhancedKeywordService();
    
    const keywordResult = await keywordService.analyzeKeywords('staging-site.mondeumcapital.co.uk', html);
    
    console.log('📊 Keyword Analysis Results:');
    console.log(`   Branded Keywords: ${keywordResult.brandedKeywords}`);
    console.log(`   Non-branded Keywords: ${keywordResult.nonBrandedKeywords}`);
    console.log(`   Above Fold Keywords: ${keywordResult.aboveFoldKeywords || 0}`);
    
    console.log('\n📝 Sample Non-branded Keywords:');
    const sampleKeywords = keywordResult.nonBrandedKeywordsList.slice(0, 10);
    sampleKeywords.forEach((k, i) => {
      console.log(`   ${i+1}. "${k.keyword}" - Volume: ${k.volume}/month, Difficulty: ${k.difficulty}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testMondeumKeywords();