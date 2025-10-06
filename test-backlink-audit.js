// Test backlink audit via the API
const { analyzeBacklinks } = require('./lib/backlinkService.ts');

async function testBacklinkAudit() {
  console.log('Testing backlink audit service...\n');
  
  try {
    const url = 'https://pmwcom.co.uk';
    console.log(`Analyzing backlinks for: ${url}`);
    
    const result = await analyzeBacklinks(url);
    
    console.log('\n✅ Backlink Analysis Results:');
    console.log(`Domain Authority: ${result.domainAuthority}`);
    console.log(`Total Backlinks: ${result.totalBacklinks}`);
    console.log(`Referring Domains: ${result.referringDomains}`);
    console.log(`Dofollow Links: ${result.dofollowLinks}`);
    console.log(`Nofollow Links: ${result.nofollowLinks}`);
    console.log(`Analysis Method: ${result.analysisMethod}`);
    console.log(`Data Source: ${result.dataSource}`);
    
    console.log(`\nTop ${result.topBacklinks.length} Backlinks:`);
    result.topBacklinks.forEach((link, i) => {
      console.log(`${i + 1}. ${link.domain} (DA: ${link.authority}) - "${link.anchor}" [${link.type}]`);
    });
    
    console.log('\n✨ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBacklinkAudit();