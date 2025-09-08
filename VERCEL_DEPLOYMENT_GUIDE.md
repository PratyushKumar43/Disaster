# Quick Vercel Deployment Instructions

## Method 1: Using Vercel CLI (Recommended)

1. **Login to Vercel:**
   ```bash
   npx vercel login
   ```
   Choose "Continue with GitHub" and authenticate.

2. **Navigate to Frontend directory:**
   ```bash
   cd Frontend
   ```

3. **Deploy:**
   ```bash
   npx vercel --prod
   ```

## Method 2: Using GitHub Integration

1. **Push your code to GitHub** (already done ✅)

2. **Import project in Vercel Dashboard:**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import from GitHub: `PratyushKumar43/Disaster`
   - Set Root Directory to: `Frontend`
   - Framework Preset: `Next.js`

3. **Environment Variables:**
   Add these in Vercel Dashboard → Project → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
   NEXT_PUBLIC_WINDY_API_KEY=your_actual_windy_api_key
   ```

## Method 3: Manual Fix for Current Deployment

If the deployment exists but shows 404:

1. **Check Build Command:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

2. **Root Directory Setting:**
   - Set Root Directory to: `Frontend`

3. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment

## Common 404 Fixes:

1. **Check vercel.json location:** Should be in `Frontend/vercel.json`
2. **Verify app directory structure:** Should have `Frontend/app/page.tsx`
3. **Environment variables:** Ensure they're set in Vercel dashboard
4. **Build logs:** Check for any build errors in Vercel dashboard

## Current Configuration Status:
- ✅ vercel.json updated with proper rewrites
- ✅ next.config.ts configured for Vercel
- ✅ Root page exists at Frontend/app/page.tsx
- ✅ Code pushed to GitHub

## Next Steps:
1. Login to Vercel CLI: `npx vercel login`
2. Deploy: `npx vercel --prod`
3. If issues persist, check Vercel dashboard for build logs
