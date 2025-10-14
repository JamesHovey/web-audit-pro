// Test Premium Traffic Analysis
const { premiumTrafficAnalysisService } = require('./lib/premiumTrafficAnalysis.ts');

async function testPremiumTrafficAnalysis() {
  console.log('🧪 Testing Premium Traffic Analysis...\n');
  
  try {
    const testDomain = 'example.com';
    console.log(`Testing with domain: ${testDomain}`);
    
    const startTime = Date.now();
    const result = await premiumTrafficAnalysisService.analyzePremiumTraffic(testDomain);
    const endTime = Date.now();
    
    console.log(`✅ Analysis completed in ${endTime - startTime}ms`);
    console.log('\n📊 Results Summary:');
    console.log(`- Organic Traffic: ${result.monthlyOrganicTraffic.estimate.toLocaleString()} (${result.monthlyOrganicTraffic.confidence} confidence)`);
    console.log(`- Paid Traffic: ${result.monthlyPaidTraffic.estimate.toLocaleString()}`);
    console.log(`- Quality Score: ${result.trafficQualityScore.grade} (${result.trafficQualityScore.score}/100)`);
    console.log(`- Revenue Potential: £${result.revenueDetails.monthlyPotential.toLocaleString()}/month`);
    console.log(`- Analysis Cost: £${result.analysisMetadata.costPerAnalysis}`);
    
    console.log('\n🌍 Geographic Distribution:');
    result.topCountries.forEach(country => {
      console.log(`- ${country.flag} ${country.country}: ${country.traffic.toLocaleString()} (${country.percentage}%)`);
    });
    
    console.log('\n🎯 Strategic Recommendations:');
    console.log(`1. ${result.strategicRecommendations.priority1.title}: ${result.strategicRecommendations.priority1.impact}`);
    console.log(`2. ${result.strategicRecommendations.priority2.title}: ${result.strategicRecommendations.priority2.impact}`);
    console.log(`3. ${result.strategicRecommendations.priority3.title}: ${result.strategicRecommendations.priority3.impact}`);
    
    console.log('\n💰 ROI Scenarios:');
    result.roiProjections.scenarios.forEach(scenario => {
      console.log(`- ${scenario.name}: £${scenario.investment.toLocaleString()} → £${scenario.revenueIncrease.toLocaleString()}/month (${scenario.roi}% ROI)`);
    });
    
    console.log('\n✅ Premium Traffic Analysis test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testPremiumTrafficAnalysis();