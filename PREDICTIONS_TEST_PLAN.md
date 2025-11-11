# Predictions Testing Checklist

## 📋 Manual Test Plan

### **Test 1: LocalStorage Persistence** ✅
**Goal:** Verify players persist after page refresh

**Steps:**
1. Navigate to "Bulk Import" page
2. Import player CSV (or create a few test players)
3. Go to "Players" page - confirm players appear
4. **Refresh the page (F5)**
5. ✅ Players should still be there (not disappear)

**Expected Result:**
- Console shows: `✅ Loaded X players from localStorage`
- Players list unchanged after refresh

---

### **Test 2: Live Match Data Fetching** 🌐
**Goal:** Verify live matches load from APIs

**Steps:**
1. Navigate to "Live Games" page
2. Open browser DevTools (F12) → Console tab
3. Look for these logs:
   - `🎾 Fetching live matches...`
   - `PINNACLE_API_KEY configured: true`
   - `Using Pinnacle Odds API for live matches`
4. Check if matches appear on page

**Expected Result:**
- If matches available: Match cards with odds displayed
- If no matches: "No live matches available" message
- Console shows successful API call (or graceful fallback)

---

### **Test 3: Predictions Page - Live Mode** 🤖
**Goal:** Generate predictions for live matches

**Steps:**
1. Navigate to "Predictions" page
2. **Important:** Make sure you have players imported (from Test 1)
3. Check the data source selector (top of page)
4. Select **"Live Matches"** from dropdown
5. Open Console (F12) - look for prediction calculations

**Expected Result:**
- Blue info card shows: "X predictions generated from Y matches"
- Prediction cards appear with:
  - Player names (e.g., "Player 1 vs Player 2")
  - Win probabilities (percentages)
  - Confidence level badge (High/Medium/Low)
  - Key factors (Ranking, Surface, Odds, etc.)

**If No Predictions:**
- Check console for errors
- Verify players are imported
- Verify live matches are available
- Message should explain why: "Import players first" or "No live matches"

---

### **Test 4: Prediction Accuracy** 🎯
**Goal:** Verify prediction calculations make sense

**Steps:**
1. On Predictions page, expand a prediction (click card)
2. Check these details:
   - **Win Probabilities:** Should add up to ~100%
   - **Predicted Winner:** Higher probability player
   - **Key Factors:** Should list actual factors (not null)
   - **Confidence Level:**
     - High = >30% difference
     - Medium = 15-30% difference
     - Low = <15% difference

**Expected Result:**
```
Example:
Player 1: 65.3% ✓
Player 2: 34.7% ✓
Total: 100% ✓
Predicted Winner: Player 1 ✓
Confidence: High (30%+ diff) ✓
Factors: "Ranking: 5 vs 10 • clay form: 80% vs 65% • ..." ✓
```

---

### **Test 5: Prediction Filters** 🔍
**Goal:** Verify filtering works

**Steps:**
1. On Predictions page with live matches loaded
2. Test filters:
   - Model Type: Select "Balanced" → Should show predictions
   - Confidence: Select "High" → Should filter to high confidence only
   - Confidence: Select "Low" → May show different/fewer predictions

**Expected Result:**
- Prediction count changes based on filters
- Cards update immediately
- Empty state shows if no matches found

---

### **Test 6: Export Predictions** 📥
**Goal:** Verify export functionality

**Steps:**
1. On Predictions page with predictions visible
2. Click "CSV" button (top right)
3. Click "JSON" button

**Expected Result:**
- Files download successfully
- Toast notification: "Exported to CSV/JSON"
- Files contain prediction data

---

### **Test 7: Data Source Switching** 🔄
**Goal:** Verify switching between Live and Database

**Steps:**
1. On Predictions page
2. Switch data source dropdown:
   - "Live Matches" → Shows API-generated predictions
   - "Database" → Shows stored predictions (if any)

**Expected Result:**
- Page updates without refresh
- Info card shows different counts
- Predictions list changes

---

### **Test 8: Prediction Service Logic** 🧮
**Goal:** Verify prediction calculations work correctly

**Steps:**
1. Open browser Console (F12)
2. Paste this test code:

```javascript
// Test prediction logic
const testPlayer1 = {
  id: '1',
  name: 'Test Player 1',
  ranking: 5,
  surface_stats: { clay: { wins: 100, losses: 10 } }
};

const testPlayer2 = {
  id: '2', 
  name: 'Test Player 2',
  ranking: 20,
  surface_stats: { clay: { wins: 50, losses: 50 } }
};

// Should favor Player 1 heavily (better rank + surface stats)
const result = window.predictMatch?.(testPlayer1, testPlayer2, 'clay');
console.log('Prediction:', result);
```

**Expected Result:**
- Player 1 should have >60% win probability
- Confidence should be "high" or "medium"
- Key factors should mention ranking and surface stats

---

### **Test 9: Error Handling** 🛡️
**Goal:** Verify app doesn't crash on edge cases

**Steps:**
1. Navigate to Predictions with **no players imported**
2. Select "Live Matches"
3. Check for graceful error message

**Expected Result:**
- No crash
- Message: "Import players first to generate predictions"
- No console errors (or only warnings)

---

### **Test 10: Real-Time Updates** ⏱️
**Goal:** Verify predictions refresh

**Steps:**
1. On Predictions page with Live Matches
2. Wait 5 minutes
3. Watch for automatic refresh

**Expected Result:**
- Query refetches after 5 minutes
- New predictions generated if matches changed
- No page reload needed

---

## 🐛 Common Issues & Fixes

### Issue: "No predictions found"
**Fix:** 
- Import players first (Bulk Import page)
- Check if live matches available (Live Games page)
- Verify console for API errors

### Issue: "Players disappear after refresh"
**Fix:**
- Check browser console for localStorage errors
- Verify browser allows localStorage (not in private mode)
- Check localStorage in DevTools → Application → Local Storage

### Issue: Predictions show "Player 1 vs Player 2"
**Fix:**
- Player names not matching between live matches and imported players
- Import players with exact names from live matches
- Or use slug-based matching

### Issue: Console shows API errors
**Fix:**
- Check API keys in tennisDataService.js
- Verify network connection
- APIs might be rate-limited

---

## ✅ Success Criteria

All tests pass if:
- [x] Players persist after refresh
- [x] Live matches load from API
- [x] Predictions generate for live matches
- [x] Probabilities add up to 100%
- [x] Confidence levels make sense
- [x] Filters work correctly
- [x] No console errors (warnings OK)
- [x] Graceful error messages for edge cases

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Test 1 (Persistence): ☐ Pass ☐ Fail - Notes: _______
Test 2 (Live Data):   ☐ Pass ☐ Fail - Notes: _______
Test 3 (Predictions): ☐ Pass ☐ Fail - Notes: _______
Test 4 (Accuracy):    ☐ Pass ☐ Fail - Notes: _______
Test 5 (Filters):     ☐ Pass ☐ Fail - Notes: _______
Test 6 (Export):      ☐ Pass ☐ Fail - Notes: _______
Test 7 (Switching):   ☐ Pass ☐ Fail - Notes: _______
Test 8 (Logic):       ☐ Pass ☐ Fail - Notes: _______
Test 9 (Errors):      ☐ Pass ☐ Fail - Notes: _______
Test 10 (Updates):    ☐ Pass ☐ Fail - Notes: _______

Overall: ☐ PASS ☐ FAIL
```
