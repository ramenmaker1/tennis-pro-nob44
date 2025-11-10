# API Request Conservation Strategy

This document outlines how the TennisPro app conserves API requests to stay within the 500/month limit.

---

## Request Budget

**RapidAPI Free Tier:**

- 500 requests/month
- ~16 requests/day average
- We use 20/day as safety buffer

---

## Caching Strategy

### Live Matches

- **Cache Duration**: 5 minutes
- **Refetch Interval**: 5 minutes
- **Max Calls**: 12/hour, 288/day (but we limit to 20/day total)
- **Rationale**: Scores change frequently, but 5-min updates are sufficient

### ATP/WTA Rankings

- **Cache Duration**: 6 hours
- **Refetch Interval**: Manual only
- **Max Calls**: 4/day per tour
- **Rationale**: Rankings update weekly, no need for frequent checks

### Tournaments

- **Cache Duration**: 24 hours
- **Refetch Interval**: Manual only
- **Max Calls**: 1/day per tour
- **Rationale**: Tournament schedules rarely change

### Player Search

- **Cache**: LocalStorage (persistent)
- **Refetch**: Never (until cleared)
- **Max Calls**: 0 (uses cached data)
- **Rationale**: Player data is static

---

## Conservation Mechanisms

### 1. Daily Limit Enforcement

```javascript
if (REQUEST_STATS.today >= 20) {
  // Stop making API calls
  return getMockData(endpoint);
}
```

**Result:**

- ✅ No more API calls for the day
- ✅ App continues working with cached/mock data
- ✅ Counter resets at midnight

### 2. Smart Refetch Behavior

- ❌ **Disabled**: Refetch on window focus
- ❌ **Disabled**: Refetch on component mount (if data exists)
- ✅ **Enabled**: Manual refetch only
- ✅ **Enabled**: Time-based refetch (respects staleTime)

### 3. Request Counter

- Tracks daily usage
- Tracks monthly total
- Persists to localStorage
- Auto-resets daily

---

## Daily Usage Estimates

### Conservative Estimate (Light Usage)

```text
Morning check:
  - Live matches: 1 call
  - Rankings (ATP): 1 call
Total: 2 calls

Afternoon check:
  - Live matches: 1 call
Total: 1 call

Evening check:
  - Live matches: 1 call
Total: 1 call

Daily Total: 4 calls
Monthly: 120 calls (well under 500)
```

### Heavy Usage Estimate

```text
Active monitoring (every 5 min for 8 hours):
  - Live matches: 96 calls (unrealistic, we cap at 20)

With our limits:
  - Live matches: 15 calls
  - Rankings: 3 calls
  - Tournaments: 2 calls
Daily Total: 20 calls (hard limit)
Monthly: 600 calls (we stop before this)
```

---

## Visual Monitoring

### Bottom-Right Widget Shows

- ✅ Daily usage (today/20)
- ✅ Monthly usage (total/500)
- ✅ Progress bars
- ✅ Color-coded warnings

### Colors

- 🟢 **Green**: < 70% used
- 🟡 **Yellow**: 70-90% used
- 🔴 **Red**: > 90% used

---

## Fallback Strategy

When quota is reached or API fails:

1. **First**: Return cached data (if available)
2. **Second**: Return mock data
3. **Third**: Show empty state with message

Mock data includes:

- 2 sample live matches
- 100 mock ATP/WTA players
- 5 major tournaments

This keeps the app functional during development and when quota is exceeded.

---

## React Query Configuration

### Live Matches

```javascript
useQuery(['liveMatches'], getLiveMatches, {
  staleTime: 1000 * 60 * 5,        // 5 min - data stays fresh
  cacheTime: 1000 * 60 * 30,       // 30 min - keep in memory
  refetchInterval: 1000 * 60 * 5,  // 5 min - auto refetch
  refetchOnWindowFocus: false,     // Don't refetch on focus
  refetchOnMount: false,           // Don't refetch if cached
});
```

### Rankings

```javascript
useQuery(['rankings', tour], () => getRankings(), {
  staleTime: 1000 * 60 * 60 * 6,   // 6 hours - very fresh
  cacheTime: 1000 * 60 * 60 * 24,  // 24 hours - keep all day
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
```

### Tournaments

```javascript
useQuery(['tournaments'], getTournaments, {
  staleTime: 1000 * 60 * 60 * 24,  // 24 hours - stays fresh all day
  cacheTime: 1000 * 60 * 60 * 48,  // 48 hours - keep for 2 days
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
```

---

## Best Practices

### DO

- ✅ Check API usage widget before testing
- ✅ Use mock mode during development (remove API key)
- ✅ Clear localStorage to reset daily counter (testing only)
- ✅ Rely on cached data when possible
- ✅ Test with network throttling

### DON'T

- ❌ Spam refresh on live games page
- ❌ Enable refetchOnWindowFocus
- ❌ Reduce cache times
- ❌ Call API in loops
- ❌ Bypass the request counter

---

## Monitoring Commands

### Check Current Usage

Open browser console:

```javascript
// View current stats
JSON.parse(localStorage.getItem('tennis_api_stats'))

// Reset daily counter (testing only)
localStorage.removeItem('tennis_api_stats')

// Force mock mode
// Remove VITE_TENNIS_API_KEY from .env and restart
```

---

## Monthly Projection

Based on 20 calls/day limit:

- **Week 1**: 140 calls
- **Week 2**: 280 calls
- **Week 3**: 420 calls
- **Week 4**: 560 calls ❌ (exceeds limit)

**Solution**: Our daily cap of 20 ensures we stay under 500/month (20 × 25 days = 500)

---

## Emergency Measures

If approaching monthly limit:

1. **Reduce daily limit** to 15 calls/day
2. **Increase cache times** (10 min live, 12 hour rankings)
3. **Disable auto-refetch** (manual only)
4. **Switch to mock mode** temporarily

---

## Future Improvements

- Add weekly usage charts
- Email alerts at 80% quota
- Automatic cache extension when quota low
- Multi-API fallback system
- Server-side caching layer

---

## Summary

Our conservative approach:

- ✅ **20/day limit** (vs 500/30 = 16.67)
- ✅ **Aggressive caching** (5min-24hr)
- ✅ **No background refetching**
- ✅ **Visual monitoring**
- ✅ **Graceful degradation**

This ensures reliable operation within API limits while maintaining a great user experience.
