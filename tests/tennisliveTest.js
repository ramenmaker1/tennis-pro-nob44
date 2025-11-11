/**
 * Test script for TennisLive.net API
 * Tests various endpoints to see if we can fetch live match data
 */

const BASE_URL = 'https://www.tennislive.net';

// Potential API endpoints to test
const ENDPOINTS = [
  '/tennis_livescore.php?t=live',
  '/api/matches/live',
  '/api/livescores',
  '/livescore/data',
  '/ajax/livescore',
  '/data/live.json',
  '/feed/live',
];

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n🧪 Testing: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.tennislive.net/',
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);

    const text = await response.text();
    console.log(`Response length: ${text.length} bytes`);
    
    // Try to parse as JSON
    try {
      const json = JSON.parse(text);
      console.log('✅ Valid JSON response');
      console.log('Sample:', JSON.stringify(json).substring(0, 200));
      return { endpoint, success: true, data: json };
    } catch (e) {
      console.log('❌ Not JSON, HTML response');
      // Check if HTML contains match data
      if (text.includes('match') || text.includes('score') || text.includes('player')) {
        console.log('💡 HTML might contain match data (needs parsing)');
        console.log('Sample:', text.substring(0, 300));
      }
      return { endpoint, success: false, isHtml: true };
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { endpoint, success: false, error: error.message };
  }
}

async function testTennisLive() {
  console.log('🎾 Testing TennisLive.net API endpoints...\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`Total endpoints tested: ${results.length}`);
  console.log(`Successful: ${results.filter(r => r.success).length}`);
  console.log(`Failed: ${results.filter(r => !r.success).length}`);
  
  const successfulEndpoints = results.filter(r => r.success);
  if (successfulEndpoints.length > 0) {
    console.log('\n✅ Working endpoints:');
    successfulEndpoints.forEach(r => {
      console.log(`  - ${r.endpoint}`);
    });
  } else {
    console.log('\n❌ No working API endpoints found');
    console.log('\n💡 Recommendation:');
    console.log('   TennisLive.net likely uses client-side JavaScript to load data.');
    console.log('   We would need to:');
    console.log('   1. Use a headless browser (Puppeteer/Playwright)');
    console.log('   2. Find their actual API by inspecting network requests');
    console.log('   3. Or use our existing sources (Sofascore, RapidAPI)');
  }
}

// Run the test
testTennisLive().catch(console.error);
