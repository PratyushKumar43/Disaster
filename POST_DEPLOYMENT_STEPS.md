# Post-Deployment Instructions

## After Akash Deployment

1. **Get your deployment URL** from the Akash Console (it will look like: `https://random-string.provider.akash.cloud`)

2. **Update Frontend Environment Variables**:

### Update .env.production file:
```bash
NEXT_PUBLIC_API_URL=https://your-akash-deployment-url.provider.akash.cloud/api/v1
NEXT_PUBLIC_SOCKET_URL=https://your-akash-deployment-url.provider.akash.cloud
```

### Update Vercel Environment Variables:
- Go to your Vercel dashboard
- Navigate to your project settings
- Update these environment variables:
  - `NEXT_PUBLIC_API_URL` = `https://your-akash-deployment-url.provider.akash.cloud/api/v1`
  - `NEXT_PUBLIC_SOCKET_URL` = `https://your-akash-deployment-url.provider.akash.cloud`

3. **Redeploy Frontend**:
   - Commit the .env.production changes to GitHub
   - Vercel will automatically redeploy
   - Or manually redeploy from Vercel dashboard

## Testing Your Deployment

1. Check backend health: `https://your-akash-deployment-url.provider.akash.cloud/health`
2. Check API docs: `https://your-akash-deployment-url.provider.akash.cloud/api/docs`
3. Test frontend at: `https://disasterapp-ten.vercel.app`

## Troubleshooting

If deployment fails:
1. Check Akash Console logs
2. Verify Docker image exists: `docker pull pratyushkumar43/disaster-backend:latest`
3. Check AKT balance for deployment costs
4. Verify SDL file syntax
