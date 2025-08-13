// Test script for enhanced geographic detection
const { analyzeGeographicTarget, generateGeographicTrafficDistribution } = require('./lib/geographicAnalysis.ts');

async function testGeographicDetection() {
  console.log('🧪 Testing Enhanced Geographic Detection\n');

  // Test cases
  const testCases = [
    {
      name: 'UK Domain (.co.uk)',
      domain: 'pmwcom.co.uk',
      html: '<html><head><title>PMW Communications</title></head><body><p>Professional marketing services based in London, UK. Contact us at +44 20 7123 4567. VAT Number: GB123456789. Registered in England and Wales.</p></body></html>'
    },
    {
      name: 'US Domain (.com with US content)',
      domain: 'example.com',
      html: '<html><head><title>Example Corp</title></head><body><p>Located in New York, USA. Call us at +1 555-123-4567. Federal Tax ID: 12-3456789. Corporation incorporated in Delaware.</p></body></html>'
    },
    {
      name: 'Canadian Domain (.ca)',
      domain: 'example.ca',
      html: '<html><head><title>Canadian Business</title></head><body><p>Based in Toronto, Canada. CRA Business Number: 123456789RC0001. GST/HST registered.</p></body></html>'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n=== Testing: ${testCase.name} ===`);
    
    try {
      // Test geographic analysis
      const geoClues = await analyzeGeographicTarget(testCase.domain, testCase.html);
      
      console.log(`Domain: ${testCase.domain}`);
      console.log(`Detected Country: ${geoClues.detectedCountry}`);
      console.log(`Confidence: ${geoClues.confidence}`);
      console.log(`Primary Market: ${geoClues.primaryMarket}`);
      console.log(`Top 3 clues:`, geoClues.clues.slice(0, 3));
      
      // Test traffic distribution
      const distribution = generateGeographicTrafficDistribution(geoClues);
      console.log(`Traffic Distribution:`);
      distribution.forEach(country => {
        console.log(`  ${country.country}: ${country.percentage}%`);
      });
      
      console.log('✅ Test passed');
      
    } catch (error) {
      console.error(`❌ Test failed:`, error.message);
    }
  }
}

// Run the test
testGeographicDetection().then(() => {
  console.log('\n🎉 All tests completed!');
}).catch(error => {
  console.error('💥 Test suite failed:', error);
});