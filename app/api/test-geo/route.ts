import { NextRequest, NextResponse } from "next/server"
import { analyzeGeographicTarget, generateGeographicTrafficDistribution } from "@/lib/geographicAnalysis"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'pmwcom.co.uk';
    
    console.log(`\n=== TESTING DOMAIN: ${domain} ===`);
    
    // Mock HTML with UK content for testing
    const mockHtml = `
      <html>
        <head><title>PMW Communications Ltd</title></head>
        <body>
          <h1>Welcome to PMW Communications</h1>
          <p>Contact our London office at +44 20 1234 5678</p>
          <p>VAT Number: GB123456789</p>
          <p>Company Registration: 12345678</p>
          <address>
            123 Example Street<br>
            London SW1A 1AA<br>
            United Kingdom
          </address>
          <p>Price: £99.99</p>
        </body>
      </html>
    `;
    
    // Run the analysis
    const geoClues = await analyzeGeographicTarget(domain, mockHtml);
    const distribution = generateGeographicTrafficDistribution(geoClues);
    
    const result = {
      domain,
      analysis: {
        detectedCountry: geoClues.detectedCountry,
        confidence: geoClues.confidence,
        primaryMarket: geoClues.primaryMarket,
        clues: geoClues.clues
      },
      distribution: distribution.map(d => ({
        country: d.country,
        percentage: d.percentage
      }))
    };
    
    console.log('Test result:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}