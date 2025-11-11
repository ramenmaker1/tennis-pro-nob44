# Bulk Player Import Guide

## Overview
The Bulk Import feature allows you to import multiple tennis players from a CSV file with automatic duplicate detection and alias generation.

## Duplicate Player Detection

### How It Works
The system prevents duplicate players using **slug-based matching**:
- Each player gets a unique slug generated from their name (e.g., "Roger Federer" → "roger-federer")
- Before importing, the system loads ALL existing players
- Each new player's slug is checked against existing slugs
- If a match is found, that row is skipped with an error message

### Why You See Duplicate Errors
When importing a CSV file:
1. ✅ **First import** - All unique players are added successfully
2. ❌ **Second import of same file** - All players are detected as duplicates
3. ⚠️ **Partial duplicates** - Mix of new and existing players

**Example Error:**
```
Row 5: Roger Federer - Player with this name already exists
```

## Import Process Flow

### 1. Upload CSV
- Click "Select CSV File"
- System parses and shows preview

### 2. Review Preview
- Check all rows are parsed correctly
- Verify player names and stats

### 3. Import Execution
For each row:
```javascript
1. Validate data (required fields, number ranges)
2. Generate slug from player name
3. Check if slug already exists
   - YES → Skip row, add to error list
   - NO → Create player + generate aliases
4. Update results counter
```

### 4. View Results
- ✅ **Success count**: New players added
- ❌ **Error count**: Duplicates or validation failures
- 📋 **Error details**: Specific row numbers and reasons

## After Import - Viewing Players

### Why Players Don't Show Immediately
The app uses **React Query caching**. After import:
1. Cache is invalidated: `queryClient.invalidateQueries({ queryKey: ['players'] })`
2. Players page **should** auto-refresh
3. If not visible, **manually refresh** the page

### Troubleshooting: "I imported but don't see new players"

**Solution 1: Hard Refresh**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

**Solution 2: Clear React Query Cache**
- Navigate away from Players page
- Come back to Players page
- Data will be refetched

**Solution 3: Check for Errors**
- Scroll down after import
- Look for red error messages
- If all rows showed "duplicate" errors, no new players were added

## Why Few Matches Populate

### Match Data Sources
Matches come from **two sources**:
1. **Local Database** - Matches you manually created
2. **External APIs** - Live matches from Tennis API (RapidAPI/Sofascore)

### Player Matching Process
External API matches need to be linked to local players:
```javascript
1. API returns match: "R. Nadal vs N. Djokovic"
2. System tries to match "R. Nadal" to local database
3. Uses fuzzy name matching (75% similarity threshold)
4. If match found → Enriched match with local player data
5. If no match → Shows match with API names only
```

### Why You See Few Matches
- **Most common**: Imported players don't match current live tournament players
- **Example**: You imported WTA players, but live matches are ATP
- **Solution**: Import players from current active tournaments

### Getting More Matches

**Option 1: Import Current Tournament Players**
1. Go to Live Games page
2. See which tournaments are active
3. Download player lists from those tournaments
4. Import their CSV

**Option 2: Wait for Your Players to Play**
- System checks for live matches every 5 minutes
- When your imported players compete, matches will appear

**Option 3: Manually Create Matches**
1. Go to Match Analysis page
2. Select two players from dropdown
3. Add match details
4. System generates predictions

## CSV Format

### Required Columns
```csv
display_name,nationality,ranking
Roger Federer,SUI,5
Rafael Nadal,ESP,2
```

OR

```csv
first_name,last_name,nationality,ranking
Roger,Federer,SUI,5
Rafael,Nadal,ESP,2
```

### Optional Stats Columns
- `first_serve_pct`, `first_serve_points_won`, `second_serve_points_won`
- `hard_court_win_pct`, `clay_court_win_pct`, `grass_court_win_pct`
- `birth_year`, `height_cm`, `plays` (R/L)
- `peak_rank`, `elo_rating`

### Download Template
Click **"Download Template"** button in Bulk Import page for a pre-formatted CSV.

## Best Practices

### ✅ DO
- Use unique player names (full names preferred)
- Import players from current active tournaments
- Check preview before importing
- Review error messages after import
- Refresh page if players don't appear immediately

### ❌ DON'T
- Import the same CSV file twice
- Use abbreviated names that might conflict
- Ignore duplicate warnings
- Expect all matches to auto-populate instantly

## Technical Details

### Duplicate Detection Algorithm
```javascript
// Create slug from name
const slug = createPlayerSlug(display_name);
// Example: "Roger Federer" → "roger-federer"

// Check against existing
if (existingSlugs.has(slug)) {
  // Skip - duplicate detected
} else {
  // Create player
  existingSlugs.add(slug);
}
```

### Cache Invalidation (React Query v5)
```javascript
// After successful import
queryClient.invalidateQueries({ queryKey: ['players'] });

// This triggers:
// 1. Mark 'players' query as stale
// 2. Refetch from database
// 3. Update UI with new data
```

### Player Matching (Fuzzy Algorithm)
```javascript
// Levenshtein distance calculation
// "R. Nadal" vs "Rafael Nadal" → 85% match ✓
// "R. Nadal" vs "Rafa Nadal" → 80% match ✓
// "R. Nadal" vs "N. Djokovic" → 20% match ✗
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| All rows show duplicate errors | CSV already imported | Import new players or delete existing ones first |
| Players not visible after import | React Query cache not refreshed | Hard refresh page (Ctrl+Shift+R) |
| Only few matches showing | Imported players not in current tournaments | Import players from active tournaments |
| Match shows "TBD vs TBD" | API player names don't match local | Improve player name consistency |
| Import stuck on processing | Large CSV or network issue | Refresh page, try smaller batches |

## Need More Help?

1. Check browser console for errors (F12 → Console tab)
2. Review import error details on results screen
3. Verify CSV file format matches template
4. Test with small CSV (5-10 players) first
5. Check Tennis API connection in Help page

---

**Last Updated**: November 11, 2025
**Version**: 1.0
