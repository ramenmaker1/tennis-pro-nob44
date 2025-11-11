// Extract match data from LiveScore.com
async function extractMatches() {
  const response = await fetch('https://www.livescore.com/en/tennis/live/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });
  
  const html = await response.text();
  
  // Extract __NEXT_DATA__
  const nextDataRegex = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/;
  const nextMatch = html.match(nextDataRegex);
  
  if (!nextMatch) {
    console.log('❌ No __NEXT_DATA__ found');
    return [];
  }
  
  try {
    const data = JSON.parse(nextMatch[1]);
    console.log('✅ Parsed __NEXT_DATA__\n');
    
    // Navigate to match data
    const pageProps = data?.props?.pageProps;
    console.log('pageProps keys:', Object.keys(pageProps || {}));
    
    // Look for matches in various possible locations
    const possiblePaths = [
      pageProps?.matches,
      pageProps?.data?.matches,
      pageProps?.events,
      pageProps?.data?.events,
      pageProps?.stages,
      pageProps?.data?.stages,
    ];
    
    for (let i = 0; i < possiblePaths.length; i++) {
      const path = possiblePaths[i];
      if (path) {
        console.log(`\n✅ Found data at path ${i}:`, typeof path);
        if (Array.isArray(path)) {
          console.log(`   Array length: ${path.length}`);
          if (path.length > 0) {
            console.log(`   First item keys:`, Object.keys(path[0]));
            console.log(`   Sample:`, JSON.stringify(path[0], null, 2).substring(0, 500));
          }
        } else if (typeof path === 'object') {
          console.log(`   Object keys:`, Object.keys(path));
        }
      }
    }
    
    // Deep search for any arrays that might contain matches
    function findArrays(obj, path = '') {
      const arrays = [];
      for (const [key, value] of Object.entries(obj || {})) {
        const currentPath = path ? `${path}.${key}` : key;
        if (Array.isArray(value) && value.length > 0) {
          arrays.push({ path: currentPath, length: value.length, sample: value[0] });
        } else if (typeof value === 'object' && value !== null) {
          arrays.push(...findArrays(value, currentPath));
        }
      }
      return arrays;
    }
    
    const allArrays = findArrays(pageProps);
    console.log(`\n\n📊 Found ${allArrays.length} arrays in pageProps:\n`);
    allArrays.slice(0, 10).forEach(arr => {
      console.log(`Path: ${arr.path}`);
      console.log(`  Length: ${arr.length}`);
      console.log(`  Sample keys:`, typeof arr.sample === 'object' ? Object.keys(arr.sample) : typeof arr.sample);
      console.log('');
    });
    
  } catch (error) {
    console.log('❌ Error parsing data:', error.message);
  }
}

extractMatches().catch(console.error);
