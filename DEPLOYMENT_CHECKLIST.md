# Quick Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup (MongoDB Atlas)
- [ ] Create MongoDB Atlas account
- [ ] Create new cluster
- [ ] Create database user with read/write permissions
- [ ] Get connection string
- [ ] Whitelist IP addresses (0.0.0.0/0 for all IPs)
- [ ] Test connection locally

### 2. API Keys Setup
- [ ] Get OpenWeather API key from https://openweathermap.org/api
- [ ] Setup Gmail app password for SMTP
- [ ] Generate JWT secrets using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 3. Code Preparation
- [ ] Push all code to GitHub
- [ ] Ensure no .env files are committed
- [ ] Test build locally: `npm run build`
- [ ] Verify all dependencies are in package.json

## Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Select your repository
3. Configure:
   - **Name**: `disaster-backend`
   - **Environment**: `Node`
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Set Environment Variables
Copy from ENVIRONMENT_VARIABLES.md and set in Render dashboard:
- [ ] NODE_ENV=production
- [ ] PORT=10000
- [ ] MONGODB_URL=your_connection_string
- [ ] JWT_SECRET=your_generated_secret
- [ ] JWT_REFRESH_SECRET=your_generated_secret
- [ ] FRONTEND_URL=https://your-app.vercel.app
- [ ] OPENWEATHER_API_KEY=your_api_key
- [ ] SMTP_HOST=smtp.gmail.com
- [ ] SMTP_PORT=587
- [ ] SMTP_USER=your_email@gmail.com
- [ ] SMTP_PASS=your_app_password

### Step 4: Deploy and Test
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Test health endpoint: `https://your-app.onrender.com/health`
- [ ] Test API endpoints with Postman/Thunder Client

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Set Environment Variables
- [ ] NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
- [ ] NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key

### Step 4: Deploy and Test
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Test website functionality
- [ ] Verify API communication works

## Post-Deployment Verification

### Backend Checks
- [ ] Health endpoint responds: `/health`
- [ ] Database connection works
- [ ] API endpoints respond correctly
- [ ] CORS allows frontend domain
- [ ] Environment variables loaded correctly

### Frontend Checks
- [ ] Website loads correctly
- [ ] API calls work (check browser network tab)
- [ ] No console errors
- [ ] All features functional
- [ ] Responsive design works

### Integration Checks
- [ ] Frontend can communicate with backend
- [ ] Authentication works (if implemented)
- [ ] Data operations work (CRUD)
- [ ] Weather data loads
- [ ] Real-time features work (if implemented)

## Troubleshooting

### Common Backend Issues
1. **Build fails**: Check package.json dependencies
2. **Port issues**: Ensure using process.env.PORT
3. **Database connection**: Verify MongoDB connection string and IP whitelist
4. **Environment variables**: Check all required vars are set

### Common Frontend Issues
1. **API connection fails**: Check CORS settings and API URL
2. **Build fails**: Verify Next.js configuration
3. **Environment variables**: Ensure NEXT_PUBLIC_ prefix

### Monitoring
- [ ] Set up error monitoring (optional)
- [ ] Monitor application logs
- [ ] Set up uptime monitoring
- [ ] Configure alerts for downtime

## Maintenance

### Regular Tasks
- [ ] Monitor application logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database regularly
- [ ] Rotate secrets quarterly
- [ ] Review and optimize performance

### Scaling Preparation
- [ ] Monitor resource usage
- [ ] Plan for traffic spikes
- [ ] Consider CDN for static assets
- [ ] Implement caching strategies

---

## Emergency Contacts & Resources

### Support Resources
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- Next.js Documentation: https://nextjs.org/docs
- MongoDB Atlas Support: https://cloud.mongodb.com

### Quick Commands
```bash
# Check Render logs
curl https://your-app.onrender.com/health

# Test API endpoint
curl https://your-app.onrender.com/api/test

# Redeploy (after git push)
# Both platforms auto-deploy on git push to main branch
```

## Success Criteria
✅ Backend deployed and accessible
✅ Frontend deployed and accessible  
✅ Database connected and functional
✅ API communication working
✅ All core features operational
✅ No critical errors in logs
✅ Performance within acceptable limits
