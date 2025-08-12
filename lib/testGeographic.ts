// Simple test to verify geographic analysis
import { analyzeGeographicTarget } from './geographicAnalysis';

export async function testGeographicAnalysis() {
  console.log('=== TESTING GEOGRAPHIC ANALYSIS ===');
  
  // Test domains
  const testCases = [
    'pmwcom.co.uk',
    'www.pmwcom.co.uk', 
    'google.com',
    'shopify.ca'
  ];
  
  for (const domain of testCases) {
    console.log(`\n--- Testing: ${domain} ---`);
    
    // Mock HTML with some UK indicators for pmwcom
    const mockHtml = domain.includes('pmwcom') ? 
      '<html><body>Contact us at our London office. Tel: +44 20 1234 5678. VAT: GB123456789. Limited company.</body></html>' :
      '<html><body>Contact us in the US. Phone: +1 555-123-4567</body></html>';
    
    const result = await analyzeGeographicTarget(domain, mockHtml);
    
    console.log('Result:', {
      detectedCountry: result.detectedCountry,
      confidence: result.confidence,
      primaryMarket: result.primaryMarket,
      clues: result.clues.slice(0, 3)
    });
  }
  
  console.log('=== END TEST ===');
}