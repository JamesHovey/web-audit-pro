// Test traffic calculation directly
const { getCostEffectiveTrafficData } = require('./lib/costEffectiveTrafficService.ts');

async function testTrafficDebug() {
  try {
    console.log('=== TESTING TRAFFIC DEBUG FOR pmwcom.co.uk ===');
    const result = await getCostEffectiveTrafficData('pmwcom.co.uk');
    console.log('\n=== FINAL RESULT ===');
    console.log('Monthly Organic Traffic:', result.monthlyOrganicTraffic);
    console.log('Monthly Paid Traffic:', result.monthlyPaidTraffic);
    console.log('Branded Traffic:', result.brandedTraffic);
    console.log('\nTop Countries:');
    result.topCountries.forEach(country => {
      console.log(`  ${country.country}: ${country.percentage}% = ${country.traffic} visitors`);
    });
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testTrafficDebug();