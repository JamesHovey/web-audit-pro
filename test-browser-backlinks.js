// Test the browser-based backlink scraper
const { scrapeBacklinksWithBrowser, cleanupBrowser } = require('./lib/browserBacklinkScraper.ts');

async function testBrowserBacklinks() {
  console.log('Testing browser-based backlink scraper...\n');
  
  const testDomains = [
    'pmwcom.co.uk',
    'mecmesin.com'
  ];
  
  for (const domain of testDomains) {
    console.log(`\n=== Testing ${domain} ===`);
    try {
      const result = await scrapeBacklinksWithBrowser(`https://${domain}`);
      
      if (result.success) {
        console.log(`✅ Success from ${result.source}`);
        console.log(`Total backlinks: ${result.totalBacklinks}`);
        console.log(`Referring domains: ${result.referringDomains}`);
        console.log(`Found ${result.backlinks.length} backlinks`);
        
        if (result.backlinks.length > 0) {
          console.log('\nTop 5 backlinks:');
          result.backlinks.slice(0, 5).forEach((link, i) => {
            console.log(`${i + 1}. ${link.domain}`);
            console.log(`   URL: ${link.url}`);
            console.log(`   Anchor: "${link.anchorText}"`);
            console.log(`   Type: ${link.linkType}`);
            if (link.domainAuthority) {
              console.log(`   DA: ${link.domainAuthority}`);
            }
          });
        }
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error testing ${domain}:`, error.message);
    }
  }
  
  // Clean up browser
  await cleanupBrowser();
  console.log('\n✨ Browser cleanup complete');
}

testBrowserBacklinks().catch(console.error);