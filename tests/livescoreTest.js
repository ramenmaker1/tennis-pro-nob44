/**
 * Test script for LiveScore.com
 * Tests if we can access their tennis data
 */

const BASE_URL = 'https://www.livescore.com';

// Potential endpoints to test
const ENDPOINTS = [
  '/api/v1/tennis/live',
  '/api/tennis/live',
  '/en/tennis/live/',
  '/data/tennis/live.json',
  '/tennis/live/data',
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
        'Referer': 'https://www.livescore.com/en/tennis/',
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
      console.log('Keys:', Object.keys(json));
      if (json.matches || json.events || json.data) {
        console.log('🎾 Found match data!');
        const matches = json.matches || json.events || json.data;
        console.log(`Match count: ${Array.isArray(matches) ? matches.length : 'unknown'}`);
      }
      return { endpoint, success: true, data: json };
    } catch (e) {
      console.log('❌ Not JSON');
      if (text.includes('match') || text.includes('tennis')) {
        console.log('💡 HTML might contain match data');
      }
      return { endpoint, success: false };
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { endpoint, success: false, error: error.message };
  }
}

async function testLiveScore() {
  console.log('🎾 Testing LiveScore.com endpoints...\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  const successCount = results.filter(r => r.success).length;
  console.log(`Successful: ${successCount}/${results.length}`);
  
  if (successCount === 0) {
    console.log('\n💡 LiveScore.com likely uses:');
    console.log('   - Client-side rendering with JavaScript');
    console.log('   - Internal/protected API endpoints');
    console.log('   - Recommendation: Use TennisLive.net (already working)');
  }
}

testLiveScore().catch(console.error);
