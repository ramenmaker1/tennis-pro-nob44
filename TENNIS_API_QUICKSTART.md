# Tennis API Quick Setup

## Current Status

❌ **No API Key Configured** - App is using mock data

## To Get Real Live Match Data:

### Option 1: RapidAPI (Recommended - 500 free requests/month)

1. **Sign up for RapidAPI:**
   - Go to: https://rapidapi.com/api-sports/api/tennis-api-atp-wta-itf
   - Create free account
   - Subscribe to FREE tier (500 requests/month)

2. **Get your API key:**
   - After subscribing, go to "Endpoints" tab
   - Copy your "X-RapidAPI-Key" from the code snippet

3. **Create `.env` file in project root:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` and add your key:**
   ```env
   VITE_TENNIS_API_KEY=your_actual_key_here
   VITE_TENNIS_API_HOST=tennis-api-atp-wta-itf.p.rapidapi.com
   VITE_TENNIS_API_PROVIDER=rapidapi
   ```

5. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Use Free Sources (No API Key Needed)

The app already has fallback to free APIs:
- **Sofascore** - Live matches, schedules
- **TheSportsDB** - Player data, tournaments

These work without any API key but have limitations.

## How to Verify It's Working

1. **Check console logs:**
   - Should see: `📊 API Calls - Today: X/20`
   - Should NOT see: `🚫 MOCK_MODE enabled`

2. **Check Live Games page:**
   - Real matches should appear (if any are live)
   - Match data should be current

3. **Check API Usage Widget:**
   - Bottom-right corner shows usage stats
   - If configured, shows real API calls

## Troubleshooting

### Still Seeing Mock Data?

**Check:**
- ✅ `.env` file exists in project root
- ✅ API key is correct (no extra spaces)
- ✅ Dev server was restarted after adding `.env`
- ✅ Variables are prefixed with `VITE_`

**Test API Key:**
```bash
# In browser console on your app:
console.log(import.meta.env.VITE_TENNIS_API_KEY)
# Should show your key, not undefined
```

### No Live Matches Showing?

This could be normal! Live matches only appear when:
- 🎾 There are actual ATP/WTA matches happening right now
- 🌍 Check ATP tour schedule: https://www.atptour.com/en/scores/current

### API Errors in Console?

Common issues:
- **401 Unauthorized** → API key is wrong
- **429 Too Many Requests** → Daily limit reached (20/day)
- **403 Forbidden** → Subscription expired

## For Vercel Deployment

Add environment variables in Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add: `VITE_TENNIS_API_KEY` = your key
3. Redeploy

## Current Limits

- **Daily**: 20 API calls (to conserve monthly quota)
- **Monthly**: 500 API calls
- **Auto-reset**: Every day at midnight
- **Fallback**: Mock data when limit reached

## Files to Check

- **Environment**: `.env` (create from `.env.example`)
- **Service**: `src/services/tennisDataService.js`
- **Live Games**: `src/pages/LiveGames.jsx`
- **API Widget**: `src/components/ApiUsageStats.jsx`

## Quick Test

```bash
# 1. Copy example env
cp .env.example .env

# 2. Edit .env and add your API key
# (use your text editor)

# 3. Restart server
npm run dev

# 4. Visit http://localhost:5173
# 5. Check console for API logs
# 6. Visit "Live Games" page
```

---

**Need help?** The app works fine with mock data for development. Real API is only needed for production deployment or testing live data.
