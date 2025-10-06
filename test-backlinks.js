// Test the real backlink scraper
const { scrapeRealBacklinks } = require('./lib/realBacklinkScraper.ts');

async function testBacklinks() {
  console.log('Testing real backlink scraper...\n');
  
  const testDomains = [
    'pmwcom.co.uk',
    'mecmesin.com'
  ];
  
  for (const domain of testDomains) {
    console.log(`\n=== Testing ${domain} ===`);
    try {
      const result = await scrapeRealBacklinks(`https://${domain}`);
      
      if (result.success) {
        console.log(`✅ Success from ${result.source}`);
        console.log(`Total backlinks: ${result.totalBacklinks}`);
        console.log(`Referring domains: ${result.referringDomains}`);
        console.log(`Found ${result.backlinks.length} backlinks`);
        
        if (result.backlinks.length > 0) {
          console.log('\nTop 5 backlinks:');
          result.backlinks.slice(0, 5).forEach((link, i) => {
            console.log(`${i + 1}. ${link.domain} - "${link.anchorText}" [${link.linkType}]`);
          });
        }
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error testing ${domain}:`, error.message);
    }
  }
}

testBacklinks().catch(console.error);