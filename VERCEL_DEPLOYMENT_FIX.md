# Vercel Deployment Fix Guide

## Changes Made to Fix Deployment Errors

### 1. Updated `vercel.json`
- Added proper `buildCommand` and `outputDirectory`
- Configured framework as `vite`
- Added security headers
- Configured proper routing with filesystem handling
- Set up caching for static assets

### 2. Updated `vite.config.js`
- Explicitly set `outDir` to `dist`
- Disabled sourcemaps for production
- Added server configuration
- Optimized build output

### 3. Created `.vercelignore`
- Prevents unnecessary files from being uploaded
- Reduces deployment size and time

### 4. Updated `public/sw.js`
- Fixed service worker to handle navigation properly
- Added proper error handling
- Implemented network-first strategy for API calls
- Implemented cache-first strategy for static assets
- Added checks for cross-origin and chrome extension requests

### 5. Created `public/_headers`
- Configured proper HTTP headers for security
- Set up cache control for assets
- Ensured manifest and service worker are not cached

### 6. Created `public/_redirects`
- Handles SPA routing by redirecting all requests to index.html

## Deployment Steps

### 1. Ensure Environment Variables are Set in Vercel
Go to your Vercel project settings and add these environment variables:
- `VITE_TENNIS_API_KEY`
- `VITE_TENNIS_API_HOST`
- `VITE_TENNIS_API_PROVIDER`
- Any Supabase variables if you're using Supabase

### 2. Clean Build
```bash
# Remove old build artifacts
rm -rf dist node_modules/.vite

# Rebuild
npm run build
```

### 3. Test Locally
```bash
npm run preview
```

### 4. Deploy to Vercel
```bash
# If using Vercel CLI
vercel --prod

# Or push to your git repository
git add .
git commit -m "fix: Vercel deployment configuration"
git push origin main
```

## Common Issues Fixed

### ROUTER_CANNOT_MATCH
- Fixed by adding proper filesystem handling in routes
- SPA routing now properly redirects to index.html

### FUNCTION_INVOCATION_TIMEOUT / MIDDLEWARE_INVOCATION_TIMEOUT
- Disabled sourcemaps to reduce build size
- Optimized chunk splitting
- Added .vercelignore to reduce deployment size

### NOT_FOUND / RESOURCE_NOT_FOUND
- Added _redirects file for proper SPA routing
- Updated service worker to handle navigation requests

### REQUEST_HEADER_TOO_LARGE
- Added proper header configuration
- Limited header size in vercel.json

### DEPLOYMENT_NOT_READY_REDIRECTING
- Added explicit build configuration
- Set proper output directory

## Verifying the Fix

After deployment, check:
1. ✅ Homepage loads correctly
2. ✅ Navigation works (no 404s on refresh)
3. ✅ Static assets load with proper cache headers
4. ✅ Service worker registers successfully
5. ✅ API calls work (if applicable)

## Additional Recommendations

### Enable Build Caching in Vercel
In your Vercel project settings:
- Enable "Build & Development Settings" → "Build Cache"

### Monitor Performance
- Check Vercel Analytics for any remaining errors
- Monitor function execution times
- Check for any console errors in production

### Rollback Plan
If issues persist:
```bash
vercel rollback
```

## Need Help?

If you still see errors:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Ensure your build completes successfully locally
4. Check browser console for any client-side errors
