// Try to find LiveScore's internal API by testing common patterns
async function testLiveScoreAPIs() {
  const apis = [
    // GraphQL
    { url: 'https://www.livescore.com/api/graphql', method: 'POST', body: { query: '{ tennis { live { matches { id } } } }' } },
    
    // REST patterns
    { url: 'https://www.livescore.com/api/v2/tennis/live', method: 'GET' },
    { url: 'https://www.livescore.com/api/v2/tennis/matches/live', method: 'GET' },
    { url: 'https://www.livescore.com/api/tennis/matches?status=live', method: 'GET' },
    
    // Common API patterns
    { url: 'https://push.livescore.com/tennis/live', method: 'GET' },
    { url: 'https://api.livescore.com/tennis/live', method: 'GET' },
    { url: 'https://feed.livescore.com/tennis/live', method: 'GET' },
  ];
  
  console.log('🔍 Testing LiveScore.com API endpoints...\n');
  console.log('='.repeat(80) + '\n');
  
  for (const api of apis) {
    console.log(`Testing: ${api.method} ${api.url}`);
    
    try {
      const options = {
        method: api.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, */*',
          'Origin': 'https://www.livescore.com',
          'Referer': 'https://www.livescore.com/en/tennis/live/',
        }
      };
      
      if (api.body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(api.body);
      }
      
      const response = await fetch(api.url, options);
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        console.log(`  Content-Type: ${contentType}`);
        
        try {
          const data = await response.json();
          console.log(`  ✅ JSON response!`);
          console.log(`  Keys:`, Object.keys(data));
          
          if (data.matches || data.events || data.data) {
            console.log(`  🎾 FOUND MATCH DATA!`);
            const matches = data.matches || data.events || data.data;
            console.log(`  Match count: ${Array.isArray(matches) ? matches.length : 'object'}`);
          }
        } catch (e) {
          console.log(`  ❌ Not JSON`);
        }
      }
      
      console.log('');
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('='.repeat(80));
  console.log('\n💡 Conclusion:');
  console.log('  LiveScore.com likely uses:');
  console.log('  - Protected/authenticated API');
  console.log('  - WebSocket for real-time updates');
  console.log('  - Client-side rendering with proprietary data fetching');
  console.log('\n  ✅ Recommendation: Stick with TennisLive.net (already working with 14+ matches)');
}

testLiveScoreAPIs().catch(console.error);
