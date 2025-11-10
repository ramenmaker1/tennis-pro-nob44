# Tennis API Setup Guide

Complete guide for integrating live tennis data into the TennisPro application.

---

## Quick Start

### 1. Get Your API Key

**Recommended Provider: RapidAPI**

1. Go to [RapidAPI Tennis API](https://rapidapi.com/api-sports/api/tennis-api-atp-wta-itf)
2. Sign up for a free account
3. Subscribe to the free tier (500 requests/month)
4. Copy your API key

**Alternative Providers:**

- **API-Sports Tennis**: Direct subscription at [api-sports.io](https://api-sports.io)
- **TheSportsDB**: Free tier at [thesportsdb.com](https://www.thesportsdb.com)
- **Custom Backend**: Use your own scraping service

---

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```bash
# RapidAPI Configuration
VITE_TENNIS_API_KEY=your_api_key_here
VITE_TENNIS_API_HOST=tennis-api-atp-wta-itf.p.rapidapi.com
VITE_TENNIS_API_PROVIDER=rapidapi
```

**For API-Sports:**

```bash
VITE_TENNIS_API_PROVIDER=apisports
VITE_TENNIS_API_KEY=your_apisports_key_here
```

**For Custom Backend:**

```bash
VITE_TENNIS_API_PROVIDER=custom
VITE_TENNIS_API_BASE_URL=https://your-backend.com/api
```

---

### 3. Available Endpoints

The service supports these data endpoints:

#### Live Matches

- **Endpoint**: `/tennis/v2/atp/live`
- **Cache**: 5 minutes
- **Returns**: Currently ongoing ATP matches

#### ATP Rankings

- **Endpoint**: `/tennis/v2/atp/rankings`
- **Cache**: 6 hours
- **Returns**: Top 100 ATP players

#### WTA Rankings

- **Endpoint**: `/tennis/v2/wta/rankings`
- **Cache**: 6 hours
- **Returns**: Top 100 WTA players

#### Tournaments

- **Endpoint**: `/tennis/v2/{tour}/tournaments`
- **Cache**: 24 hours
- **Returns**: Upcoming/current tournaments

---

## API Conservation Strategy

The service implements aggressive caching and request limiting:

- **Daily Limit**: 20 API calls/day (500/month = ~16/day)
- **Monthly Limit**: 500 requests
- **Auto-Reset**: Daily counter resets at midnight
- **Fallback**: Uses mock data when limit reached

### Request Tracking

API usage is tracked in localStorage:

```javascript
{
  total: 245,        // Lifetime requests
  today: 8,          // Today's requests
  lastReset: "Sat Nov 09 2025",
  monthlyLimit: 500,
  dailyLimit: 20
}
```

---

## Features

### 1. Multi-Source Support

The service can switch between providers:

- RapidAPI Tennis
- API-Sports Tennis
- Custom backend
- Mock data (development)

### 2. Smart Caching

Different cache durations based on data volatility:

- **Live matches**: 5 min (changes frequently)
- **Rankings**: 6 hours (changes weekly)
- **Tournaments**: 24 hours (rarely changes)

### 3. Request Conservation

Automatic quota management:

- Tracks daily/monthly usage
- Prevents over-quota requests
- Falls back to cached/mock data
- Visual usage monitoring

### 4. Error Handling

Graceful fallbacks on failures:

- API errors → Mock data
- Network failures → Cached data
- Quota exceeded → Mock data

---

## Monitoring

### API Usage Widget

Bottom-right corner displays:

- Daily usage (today/20)
- Monthly usage (total/500)
- Progress bars with color coding
- Warning when approaching limits

### Console Logging

Development mode shows:

```
📊 API Calls - Today: 8/20 | Total: 245/500
⚠️ Skipping API call to conserve quota. Using cached/mock data.
🚫 Daily API limit reached (20 calls). Using cached data.
```

---

## Troubleshooting

### No Live Matches Showing

**Possible causes:**

- No live matches currently (check ATP tour schedule)
- API endpoint changed
- API key invalid
- Request limit reached

**Solutions:**

1. Check console for errors
2. Verify API key is correct
3. Check API usage widget
4. Try forcing a refresh (clear cache)

### API Key Issues

**Error: 401 Unauthorized**

- API key is missing
- API key is invalid
- Subscription expired

**Solution:**

1. Verify `.env` file exists
2. Restart dev server (`npm run dev`)
3. Check RapidAPI dashboard for subscription status

### Mock Data Appearing

The service shows mock data when:

- No API key configured
- Daily limit reached (20 calls)
- API returns errors
- Network is offline

This is intentional to keep the app functional during development.

---

## File Locations

- **Service file**: `src/services/tennisDataService.js`
- **Live Games page**: `src/pages/LiveGames.jsx`
- **Rankings page**: `src/pages/TopPlayers.jsx`
- **Tournaments page**: `src/pages/Tournaments.jsx`
- **API widget**: `src/components/ApiUsageStats.jsx`
- **Environment**: `.env` (not committed)
- **Example config**: `.env.example`

---

## Production Deployment

### Vercel Configuration

Add environment variable in Vercel dashboard:

```
VITE_TENNIS_API_KEY = your_api_key_here
```

### Security Notes

- ✅ `.env` is in `.gitignore`
- ✅ API keys are not committed
- ✅ Keys are prefixed with `VITE_` for client-side use
- ⚠️ Client-side keys are visible in browser (use rate limiting)

---

## API Providers Comparison

| Provider | Free Tier | Live Data | Rankings | Rate Limit |
|----------|-----------|-----------|----------|------------|
| RapidAPI Tennis | 500/month | ✅ Yes | ✅ Yes | 500/month |
| API-Sports | 100/day | ✅ Yes | ✅ Yes | 100/day |
| TheSportsDB | Unlimited | ❌ No | ✅ Yes | None |
| Custom Backend | Varies | ✅ Yes | ✅ Yes | Custom |

---

## Next Steps

1. ✅ Configure `.env` with your API key
2. ✅ Start dev server: `npm run dev`
3. ✅ Navigate to "Live Games" page
4. ✅ Check API usage widget
5. ✅ Monitor console for request logs

For issues, check the browser console and API usage stats widget.
