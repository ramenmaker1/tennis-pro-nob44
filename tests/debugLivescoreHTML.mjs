// Debug LiveScore.com HTML structure
async function debugHTML() {
  const response = await fetch('https://www.livescore.com/en/tennis/live/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });
  
  const html = await response.text();
  
  console.log('HTML length:', html.length, 'bytes');
  console.log('\n' + '='.repeat(80));
  
  // Look for JSON data embedded in script tags
  const scriptDataRegex = /<script[^>]*>([\s\S]*?window\.__INITIAL_STATE__[\s\S]*?)<\/script>/g;
  const scriptMatches = [...html.matchAll(scriptDataRegex)];
  
  if (scriptMatches.length > 0) {
    console.log(`\n✅ Found ${scriptMatches.length} script(s) with __INITIAL_STATE__`);
    scriptMatches.forEach((match, i) => {
      const snippet = match[1].substring(0, 500);
      console.log(`\nScript ${i + 1}:`);
      console.log(snippet);
    });
  }
  
  // Look for any JSON-like data
  const jsonRegex = /\{[\s\S]*?"matches?"[\s\S]*?\}/g;
  const jsonMatches = [...html.matchAll(jsonRegex)];
  console.log(`\n\nFound ${jsonMatches.length} JSON-like structures with "match"`);
  
  // Look for common patterns
  const patterns = [
    { name: 'window.__INITIAL_STATE__', regex: /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});/g },
    { name: 'window.__data__', regex: /window\.__data__\s*=\s*(\{[\s\S]*?\});/g },
    { name: 'window.liveScoreData', regex: /window\.liveScoreData\s*=\s*(\{[\s\S]*?\});/g },
    { name: '<script type="application/json">', regex: /<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g },
  ];
  
  console.log('\n' + '='.repeat(80));
  console.log('\nSearching for common data patterns:\n');
  
  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern.regex)];
    console.log(`${pattern.name}: ${matches.length} found`);
    
    if (matches.length > 0) {
      console.log('  Sample:', matches[0][1].substring(0, 200));
    }
  }
  
  // Check if they use Next.js data structure
  if (html.includes('__NEXT_DATA__')) {
    console.log('\n🎯 Found __NEXT_DATA__ (Next.js app)');
    const nextDataRegex = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/;
    const nextMatch = html.match(nextDataRegex);
    if (nextMatch) {
      try {
        const data = JSON.parse(nextMatch[1]);
        console.log('✅ Successfully parsed __NEXT_DATA__');
        console.log('Keys:', Object.keys(data));
        if (data.props) {
          console.log('Props keys:', Object.keys(data.props));
        }
      } catch (e) {
        console.log('❌ Failed to parse __NEXT_DATA__');
      }
    }
  }
}

debugHTML().catch(console.error);
