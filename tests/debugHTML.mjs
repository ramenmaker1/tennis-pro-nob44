// Debug script to see actual HTML structure
async function debugHTML() {
  const response = await fetch('https://www.tennislive.net/tennis_livescore.php?t=live', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    }
  });
  
  const html = await response.text();
  
  // Save first 5000 chars to see structure
  console.log('HTML Structure (first 5000 chars):');
  console.log('='.repeat(80));
  console.log(html.substring(0, 5000));
  console.log('='.repeat(80));
  
  // Look for tbody tags
  const tbodyMatches = html.match(/<tbody[^>]*>/g);
  console.log(`\nFound ${tbodyMatches ? tbodyMatches.length : 0} <tbody> tags`);
  
  if (tbodyMatches) {
    console.log('\nFirst 3 tbody tags:');
    tbodyMatches.slice(0, 3).forEach((tag, i) => {
      console.log(`${i + 1}. ${tag}`);
    });
  }
  
  // Look for player names
  const playerMatches = html.match(/class="player[^"]*"/g);
  console.log(`\nFound ${playerMatches ? playerMatches.length : 0} elements with class="player..."`);
  
  // Look for table structures
  const tableMatches = html.match(/<table[^>]*id="table_live"[^>]*>/);
  console.log(`\nFound table_live: ${tableMatches ? 'Yes' : 'No'}`);
}

debugHTML().catch(console.error);
