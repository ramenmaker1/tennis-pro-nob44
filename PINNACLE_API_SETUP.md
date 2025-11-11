# Pinnacle Odds API Integration

## Overview
The app now integrates with **Pinnacle Odds API** as the **PRIORITY data source** for live tennis matches with real-time betting odds.

## Features Added
- ✅ Live tennis matches with betting odds
- ✅ Money line odds (player A vs player B)
- ✅ Spread betting data
- ✅ Total points betting data
- ✅ Automatic fallback to other sources if Pinnacle fails

## Data Source Priority
```
1. 🎯 Pinnacle Odds API (Best - Live data + Odds)
2. 🎾 RapidAPI Tennis (Good - Match data)
3. 🆓 Sofascore (Free - Basic match data)
4. 📚 TheSportsDB (Free - Limited)
5. 🎭 Mock Data (Always works - Demo)
```

## API Key Configuration

### Option 1: Use Pre-configured Key (Current Setup)
The app includes a default Pinnacle API key that's already working:
```
Key: c4da663c6emshf08c4503b1a7366p148028jsn4fce0daf017e
```

### Option 2: Get Your Own Key (Recommended for Production)
1. Visit [Pinnacle Odds on RapidAPI](https://rapidapi.com/apicenter/api/pinnacle-odds)
2. Subscribe to a plan (free tier available)
3. Copy your API key
4. Add to Vercel environment variables:
   ```
   VITE_PINNACLE_API_KEY=your_new_key_here
   ```
5. Redeploy

## What You Get from Pinnacle

### Match Data
```javascript
{
  id: "123456",
  tournament: "ATP Paris Masters",
  round: "Live",
  surface: "hard",
  player_a: "Novak Djokovic",
  player_b: "Carlos Alcaraz",
  score: "6-4, 3-2",
  status: "live",
  is_live: true,
  
  // ⭐ BETTING ODDS (Unique to Pinnacle!)
  odds: {
    player_a_odds: -150,  // Djokovic is favorite
    player_b_odds: +130,   // Alcaraz is underdog
    spread: {
      points: 2.5,
      home: -110,
      away: -110
    },
    total: {
      points: 22.5,
      over: -115,
      under: -105
    }
  }
}
```

### How to Read Odds

**Money Line (American Odds):**
- **Negative (-150)**: Favorite - Bet $150 to win $100
- **Positive (+130)**: Underdog - Bet $100 to win $130

**Example:**
```
Djokovic: -150 (67% implied probability)
Alcaraz:  +130 (43% implied probability)
```

## Testing the Integration

### After Deployment (1-2 minutes):

1. **Open Browser Console** (F12 → Console)

2. **Navigate to Live Games page**

3. **Look for these logs:**
   ```
   🎾 getLiveMatches() called
     PINNACLE_API_KEY configured: true  ✓
     
   🎾 Trying Pinnacle for live...
   ✅ Pinnacle returned data for live
     Data source used: pinnacle
     
     Matches returned: 5
     First match: { player_a: "Djokovic", ... }
     ✨ Odds available! { player_a_odds: -150, ... }
   ```

4. **Check Match Cards:**
   - If Pinnacle works: You'll see matches with odds displayed
   - If Pinnacle fails: Falls back to Sofascore (no odds)

## Troubleshooting

### "No live matches" but Pinnacle is working
- **Normal!** Tennis matches are time-dependent
- Check during Grand Slams or ATP tour events
- November is off-season - few matches

### "Pinnacle API error: 429"
- Hit rate limit on the API key
- Default key has generous limits, but shared
- Get your own key for dedicated quota

### "Falling back to Sofascore"
- Pinnacle might be down (rare)
- API key invalid or expired
- No tennis matches with odds available
- Check console for exact error message

## API Endpoints Used

### Tennis Sport Metadata
```bash
GET https://pinnacle-odds.p.rapidapi.com/kit/v1/meta-periods?sport_id=33
```

### Live Matches with Odds
```bash
GET https://pinnacle-odds.p.rapidapi.com/kit/v1/markets?sport_id=33&is_have_odds=true
```

### Headers Required
```javascript
{
  'x-rapidapi-host': 'pinnacle-odds.p.rapidapi.com',
  'x-rapidapi-key': 'your_api_key_here'
}
```

## Future Enhancements

Potential features to add:
- 📊 Display odds on match cards
- 📈 Odds movement tracking
- 🎯 Betting recommendations based on ML predictions
- 💰 ROI calculator for predictions vs actual odds
- 📉 Historical odds analysis

## Rate Limits

**Default Free Tier** (shared key):
- 500 requests/month
- ~16-17 requests/day
- App uses conservative limit of 20/day

**Paid Tiers:**
- Basic: 10,000 requests/month
- Pro: 100,000 requests/month
- Ultra: Unlimited

## Environment Variables Summary

Add to Vercel → Settings → Environment Variables:

```bash
# Priority 1: Pinnacle (odds + matches)
VITE_PINNACLE_API_KEY=c4da663c6emshf08c4503b1a7366p148028jsn4fce0daf017e

# Priority 2: RapidAPI Tennis (matches only)
VITE_TENNIS_API_KEY=your_rapidapi_key_here
VITE_TENNIS_API_HOST=tennis-api-atp-wta-itf.p.rapidapi.com

# No config needed for free sources (Sofascore, TheSportsDB)
```

## Support

If you have issues:
1. Check browser console logs (F12)
2. Verify API key is set correctly
3. Test during peak tennis hours
4. Check RapidAPI dashboard for quota

---

**Status:** ✅ Deployed and Active  
**Last Updated:** November 11, 2025
