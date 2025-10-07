/**
 * Test ValueSERP integration with PMW Communications audit
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { AboveFoldDiscoveryService } = require('./lib/aboveFoldDiscovery.ts');

async function testPMWAudit() {
  console.log('🔍 Testing ValueSERP integration with pmwcom.co.uk...');
  
  // Mock HTML content for PMW Communications (marketing agency)
  const mockHTML = `
    <title>PMW Communications - Full Service Marketing Agency Sussex</title>
    <meta name="description" content="PMW Communications is a full-service marketing agency based in Sussex, UK. We provide digital marketing, SEO, social media, and branding services.">
    <h1>Digital Marketing Agency Sussex</h1>
    <h2>Our Marketing Services</h2>
    <p>We offer comprehensive marketing solutions including SEO services, PPC advertising, social media marketing, content marketing, and brand strategy.</p>
    <nav>
      <a href="/services">Services</a>
      <a href="/portfolio">Portfolio</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  `;
  
  try {
    const service = new AboveFoldDiscoveryService('pmwcom.co.uk');
    const result = await service.discoverAboveFoldKeywords(
      mockHTML,
      'gb', // UK
      [], // No existing keywords
      'Marketing & Digital' // Business type
    );
    
    console.log('\n📊 ABOVE FOLD DISCOVERY RESULTS:');
    console.log(`   Method: ${result.discoveryMethod}`);
    console.log(`   Total Found: ${result.totalFound}`);
    console.log(`   Estimated Traffic: ${result.estimatedTrafficGain}`);
    
    console.log('\n🎯 TOP KEYWORDS:');
    result.keywords.slice(0, 10).forEach((kw, index) => {
      if (kw.isActualRanking) {
        console.log(`   ${index + 1}. "${kw.keyword}" - REAL RANKING #${kw.position} (${kw.volume} vol)`);
      } else if (kw.position === 0) {
        console.log(`   ${index + 1}. "${kw.keyword}" - OPPORTUNITY (${kw.volume} vol)`);
      } else {
        console.log(`   ${index + 1}. "${kw.keyword}" - Content Analysis (${kw.volume} vol)`);
      }
    });
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testPMWAudit();