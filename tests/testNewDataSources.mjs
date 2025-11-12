/**
 * Test script for new Tennis data sources
 * Tests: Tennis Explorer, FlashScore
 * 
 * Run with: node tests/testNewDataSources.mjs
 */

// Simulate fetch function for Node.js
import fetch from 'node-fetch';
global.fetch = fetch;

/**
 * Test Tennis Explorer scraping
 */
async function testTennisExplorer() {
  console.log('\n🎾 Testing Tennis Explorer...\n');
  
  try {
    const response = await fetch('https://www.tennisexplorer.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    console.log(`✅ Tennis Explorer responded (${html.length} bytes)`);
    
    // Check for match data indicators
    const hasMatchData = html.includes('class="result"') || html.includes('class="match"');
    console.log(`   ${hasMatchData ? '✅' : '❌'} Contains match data structures`);
    
    // Count potential matches
    const matchRows = html.match(/<tr[^>]*class="[^"]*result[^"]*"/gi) || [];
    console.log(`   Found ${matchRows.length} potential match rows`);
    
    // Check for tournament headers
    const tournamentHeaders = html.match(/<a[^>]*>[^<]*(?:ATP|WTA|Challenger|ITF)[^<]*<\/a>/gi) || [];
    console.log(`   Found ${tournamentHeaders.length} tournament headers`);
    
    if (tournamentHeaders.length > 0) {
      console.log(`   Sample tournament: ${tournamentHeaders[0].replace(/<[^>]+>/g, '').trim()}`);
    }
    
    return { success: true, matchCount: matchRows.length };
    
  } catch (error) {
    console.error(`❌ Tennis Explorer failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test FlashScore scraping
 */
async function testFlashScore() {
  console.log('\n⚡ Testing FlashScore...\n');
  
  try {
    const response = await fetch('https://www.flashscore.com/tennis/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    console.log(`✅ FlashScore responded (${html.length} bytes)`);
    
    // Check for React app indicators
    const isReactApp = html.includes('__INITIAL_STATE__') || html.includes('window.coreData');
    console.log(`   ${isReactApp ? '✅' : '❌'} Is React app (has embedded data)`);
    
    // Look for match data
    const hasMatches = html.includes('event__match') || html.includes('sportName');
    console.log(`   ${hasMatches ? '✅' : '❌'} Contains match data structures`);
    
    // Try to find JSON data
    const jsonMatch = html.match(/INITIAL_STATE__\s*=\s*({[\s\S]{100,1000}})/);
    if (jsonMatch) {
      console.log(`   ✅ Found embedded JSON data (~${jsonMatch[1].length} bytes)`);
      
      try {
        const data = JSON.parse(jsonMatch[1]);
        const eventCount = data.events?.length || data.matches?.length || 0;
        console.log(`   Found ${eventCount} events in JSON`);
        return { success: true, matchCount: eventCount };
      } catch (e) {
        console.log(`   ⚠️ JSON parsing failed (malformed data)`);
      }
    } else {
      console.log(`   ⚠️ No embedded JSON found`);
    }
    
    // Fallback: count HTML match elements
    const matchDivs = html.match(/<div[^>]*class="[^"]*event__match[^"]*"/gi) || [];
    console.log(`   Found ${matchDivs.length} HTML match elements`);
    
    return { success: true, matchCount: matchDivs.length };
    
  } catch (error) {
    console.error(`❌ FlashScore failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test Tennis Explorer schedule page
 */
async function testTennisExplorerSchedule() {
  console.log('\n📅 Testing Tennis Explorer Schedule...\n');
  
  try {
    const response = await fetch('https://www.tennisexplorer.com/matches/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    console.log(`✅ Schedule page responded (${html.length} bytes)`);
    
    // Look for upcoming matches
    const hasSchedule = html.includes('upcoming') || html.includes('scheduled');
    console.log(`   ${hasSchedule ? '✅' : '❌'} Contains schedule data`);
    
    // Count match times
    const times = html.match(/\d{1,2}:\d{2}/g) || [];
    console.log(`   Found ${times.length} time entries`);
    
    return { success: true, timeCount: times.length };
    
  } catch (error) {
    console.error(`❌ Schedule page failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('==================================================');
  console.log('🎾 Testing New Tennis Data Sources');
  console.log('==================================================');
  
  const results = {
    tennisExplorer: await testTennisExplorer(),
    flashScore: await testFlashScore(),
    schedule: await testTennisExplorerSchedule(),
  };
  
  console.log('\n==================================================');
  console.log('📊 Test Summary');
  console.log('==================================================\n');
  
  const successes = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`Tennis Explorer Live:     ${results.tennisExplorer.success ? '✅' : '❌'} ${results.tennisExplorer.matchCount || 0} matches`);
  console.log(`FlashScore Live:          ${results.flashScore.success ? '✅' : '❌'} ${results.flashScore.matchCount || 0} matches`);
  console.log(`Tennis Explorer Schedule: ${results.schedule.success ? '✅' : '❌'} ${results.schedule.timeCount || 0} times`);
  
  console.log(`\n✅ ${successes}/${total} sources working`);
  
  if (successes === total) {
    console.log('\n🎉 All new data sources are functional!\n');
  } else {
    console.log('\n⚠️ Some sources failed - check logs above\n');
  }
}

// Run tests
runAllTests().catch(console.error);
