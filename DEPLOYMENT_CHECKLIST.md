# Vercel Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Fixes
- [x] Fixed import typo in `LivePlayers.jsx` (`@tantml` → `@tanstack`)
- [x] Updated `vercel.json` with proper configuration
- [x] Updated `vite.config.js` for production builds
- [x] Created `.vercelignore` file
- [x] Fixed service worker (`public/sw.js`)
- [x] Created `public/_headers` file
- [x] Created `public/_redirects` file
- [x] Build succeeds locally ✓

### Before You Deploy

#### 1. Verify Environment Variables
Make sure these are set in your Vercel project settings:
- [ ] `VITE_TENNIS_API_KEY`
- [ ] `VITE_TENNIS_API_HOST`
- [ ] `VITE_TENNIS_API_PROVIDER`
- [ ] Any Supabase variables (if applicable)

#### 2. Test Locally
```bash
npm run build
npm run preview
```
- [ ] App loads at http://localhost:4173
- [ ] Navigation works
- [ ] No console errors

#### 3. Commit Changes
```bash
git add .
git commit -m "fix: Vercel deployment configuration"
git push origin main
```

## 🚀 Deployment

### Automatic Deployment (Recommended)
If your Vercel project is connected to GitHub:
1. Push to main branch
2. Vercel will automatically deploy
3. Check deployment status in Vercel dashboard

### Manual Deployment
```bash
vercel --prod
```

## 🔍 Post-Deployment Verification

### Test These After Deployment:
- [ ] Homepage loads: `https://your-app.vercel.app`
- [ ] Refresh on any route (should not show 404)
- [ ] Check browser console (no errors)
- [ ] Service worker registers successfully
- [ ] Static assets load with cache headers
- [ ] API calls work (if applicable)

### Check Vercel Dashboard:
- [ ] Build completed successfully
- [ ] No errors in deployment logs
- [ ] Function logs show no errors
- [ ] Analytics shows no 404s or errors

## 🐛 Troubleshooting

If you still see errors:

### Check Build Logs
1. Go to Vercel Dashboard
2. Click on your deployment
3. View "Build Logs" tab
4. Look for specific error messages

### Check Function Logs
1. Go to Vercel Dashboard
2. Click "Logs" tab
3. Look for runtime errors

### Common Issues:

**Missing Environment Variables**
- Go to Settings → Environment Variables
- Add all required variables
- Redeploy

**Build Fails**
- Check that `npm run build` works locally
- Verify all dependencies are in `package.json`
- Check Node version matches (18+)

**404 Errors**
- Verify `_redirects` file is in `public/` folder
- Check `vercel.json` configuration
- Clear Vercel build cache and redeploy

**API Errors**
- Verify API keys are set in environment variables
- Check API endpoint configuration
- Verify CORS settings if using external APIs

## 📊 Expected Results

After successful deployment, you should see:
- ✅ 200 status code on all routes
- ✅ Proper caching headers on assets
- ✅ Service worker active
- ✅ No console errors
- ✅ Fast load times

## 🆘 Need Help?

If issues persist:
1. Check `DEPLOYMENT_SUMMARY.md` for detailed changes
2. Review Vercel deployment logs
3. Contact Vercel support for platform errors
4. Check GitHub issues for similar problems

---

**Note**: All code changes have been committed and the build succeeds locally.
You're ready to deploy! 🎉
