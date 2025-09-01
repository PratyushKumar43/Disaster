# Render Deployment Troubleshooting Checklist

## Current Error Analysis
**Error**: `ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`

**Root Cause**: Render is looking for package.json in the wrong directory (`/opt/render/project/src/`) instead of `/opt/render/project/backend/`

## Step-by-Step Fix

### Option 1: Fix Existing Service (Recommended)

1. **Access Render Dashboard**
   - Go to https://render.com
   - Navigate to your service (disaster-backend)

2. **Check Current Settings**
   - Click on your service name
   - Go to "Settings" tab
   - Look for "Build & Deploy" section

3. **Verify/Update These Settings**
   ```
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```

4. **Save and Redeploy**
   - Click "Save Changes"
   - Go to "Events" tab
   - Click "Manual Deploy" → "Deploy latest commit"

### Option 2: Create New Service with Blueprint

1. **Delete Current Service**
   - Go to Settings → Danger Zone → Delete Service

2. **Create New Service with Blueprint**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing render.yaml
   - Render will automatically use the blueprint configuration

### Option 3: Manual Verification

Check your service configuration matches:

```yaml
# Expected Configuration
Root Directory: backend
Build Command: npm install
Start Command: npm start
Environment: Node
Branch: master (or main)
```

## Environment Variables to Set

After fixing the root directory, ensure these environment variables are set:

```
NODE_ENV=production
PORT=10000
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/disaster-management
JWT_SECRET=your_super_secret_jwt_key_production
JWT_REFRESH_SECRET=your_refresh_token_secret_production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://your-vercel-app.vercel.app
OPENWEATHER_API_KEY=your_openweather_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Verification Steps

1. **Check Build Logs**
   - After deployment, check the build logs
   - Should see: "Installing dependencies from /opt/render/project/backend/package.json"

2. **Test Health Endpoint**
   - Once deployed, visit: `https://your-service-url.onrender.com/health`
   - Should return JSON with status information

3. **Check Service Status**
   - Service should show "Live" status in dashboard
   - No error messages in logs

## Common Issues and Solutions

### Issue: Still getting ENOENT error
**Solution**: 
- Delete the service completely
- Create new service with correct Root Directory
- Or use Blueprint deployment with render.yaml

### Issue: Build succeeds but app crashes
**Solution**:
- Check environment variables are set
- Verify MongoDB connection string
- Check server.js uses process.env.PORT

### Issue: Can't connect to database
**Solution**:
- Whitelist 0.0.0.0/0 in MongoDB Atlas
- Verify connection string format
- Check database user permissions

## Emergency Contact

If issues persist:
1. Check Render documentation: https://render.com/docs
2. Contact Render support through dashboard
3. Review build logs carefully for specific error messages

## Success Indicators

✅ Build logs show: "Installing dependencies from /opt/render/project/backend/package.json"
✅ Service status shows "Live"
✅ Health endpoint responds with 200 status
✅ No ENOENT errors in logs
