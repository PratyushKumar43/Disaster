# Disaster Management System - Deployment Guide

This guide will walk you through deploying the frontend to Vercel and the backend to Render.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:
- GitHub account with your project repository
- Vercel account (free tier available)
- Render account (free tier available)
- MongoDB Atlas cluster (for database)
- Weather API keys (if using external weather services)

## Backend Deployment (Render)

### Step 1: Prepare Your Backend for Deployment

1. **Create a Dockerfile** (recommended for Render):
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Copy package files
   COPY package*.json ./

   # Install dependencies
   RUN npm ci --only=production

   # Copy source code
   COPY . .

   # Expose port
   EXPOSE 10000

   # Start the application
   CMD ["npm", "start"]
   ```

2. **Update package.json scripts** (if not already present):
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "build": "npm install"
     }
   }
   ```

3. **Ensure your server listens on the correct port**:
   ```javascript
   const PORT = process.env.PORT || 5000;
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

### Step 2: Deploy to Render

1. **Sign up/Login to Render**: Go to [render.com](https://render.com) and create an account.

2. **Create a New Web Service**:
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository

3. **Configure the Service**:
   - **Name**: `disaster-management-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `master` (or your main branch)
   - **Root Directory**: `backend` (IMPORTANT: Set this to backend directory)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Set Environment Variables** (see Environment Variables section below)

5. **Deploy**: Click "Create Web Service"

### Step 3: Configure Environment Variables on Render

Go to your service's Environment tab and add:

```
NODE_ENV=production
PORT=10000
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/disaster-management
JWT_SECRET=your_super_secret_jwt_key_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_production
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://your-vercel-app.vercel.app
OPENWEATHER_API_KEY=your_openweather_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Frontend Deployment (Vercel)

### Step 1: Prepare Your Frontend for Deployment

1. **Update API base URL** in `lib/api.ts`:
   ```typescript
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-render-backend.onrender.com/api';
   ```

2. **Create vercel.json** in the Frontend directory:
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/next"
       }
     ],
     "regions": ["iad1"],
     "env": {
       "NEXT_PUBLIC_API_URL": "@next_public_api_url"
     }
   }
   ```

3. **Update next.config.ts** for production:
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     transpilePackages: ['framer-motion'],
     images: {
       domains: ['openweathermap.org'],
       unoptimized: true
     },
     output: 'standalone',
     eslint: {
       ignoreDuringBuilds: true,
     },
     typescript: {
       ignoreBuildErrors: true,
     }
   };

   export default nextConfig;
   ```

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel**: Go to [vercel.com](https://vercel.com) and create an account.

2. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Set Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com/api
   NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
   ```

5. **Deploy**: Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## Environment Variables

### Backend Environment Variables (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourapp.vercel.app` |
| `OPENWEATHER_API_KEY` | Weather API key | `your_api_key` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `your_email@gmail.com` |
| `SMTP_PASS` | Email password/app password | `your_password` |

### Frontend Environment Variables (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://yourapp.onrender.com/api` |
| `NEXT_PUBLIC_WEATHER_API_KEY` | Weather API key | `your_api_key` |

## Post-Deployment Configuration

### 1. Update CORS Settings

Ensure your backend allows requests from your Vercel domain:

```javascript
// In server.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 2. Database Setup

1. **MongoDB Atlas**:
   - Whitelist Render's IP addresses: `0.0.0.0/0` (for simplicity, or specific IPs)
   - Ensure your database user has proper permissions
   - Test connection from Render console

2. **Seed Data** (if needed):
   ```bash
   # In Render console
   npm run seed
   ```

### 3. Health Checks

Add health check endpoints:

```javascript
// In server.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Troubleshooting

### Common Backend Issues

1. **Port Issues**:
   - Ensure you're using `process.env.PORT`
   - Render assigns port dynamically

2. **Environment Variables**:
   - Check if all required variables are set
   - Use Render's environment tab

3. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`

4. **Database Connection**:
   - Verify MongoDB connection string
   - Check network access in MongoDB Atlas

5. **Root Directory Issues** (COMMON ISSUE):
   - **Error**: `ENOENT: no such file or directory, open '/opt/render/project/src/package.json'`
   - **Solution**: Ensure Root Directory is set to `backend` in Render service settings
   - **Steps to Fix**:
     1. Go to your Render service dashboard
     2. Click on "Settings"
     3. Scroll to "Build & Deploy" section
     4. Set **Root Directory** to `backend`
     5. Save changes and redeploy

### Common Frontend Issues

1. **API Connection**:
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check network tab for CORS errors

2. **Build Failures**:
   - Check Vercel build logs
   - Verify all dependencies are installed

3. **Environment Variables**:
   - Ensure variables start with `NEXT_PUBLIC_`
   - Check Vercel project settings

### Monitoring and Logging

1. **Render Monitoring**:
   - Use Render's built-in monitoring
   - Check service logs regularly

2. **Vercel Analytics**:
   - Enable Vercel Analytics for performance monitoring
   - Use Vercel's built-in logging

### Performance Optimization

1. **Backend**:
   - Enable compression middleware
   - Implement caching strategies
   - Use connection pooling for MongoDB

2. **Frontend**:
   - Optimize images and assets
   - Implement code splitting
   - Use Next.js optimization features

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] CORS settings updated
- [ ] Build process tested locally
- [ ] Error handling implemented

### Post-Deployment
- [ ] Health checks passing
- [ ] API endpoints accessible
- [ ] Frontend-backend communication working
- [ ] Database operations functional
- [ ] Email notifications working (if applicable)
- [ ] Performance monitoring setup

## Support and Maintenance

### Regular Tasks
1. Monitor application logs
2. Update dependencies regularly
3. Backup database periodically
4. Review and rotate secrets
5. Monitor performance metrics

### Scaling Considerations
1. **Render**: Upgrade to paid plan for better performance
2. **Vercel**: Monitor bandwidth usage
3. **Database**: Consider MongoDB Atlas scaling options
4. **CDN**: Implement CDN for static assets

---

## Quick Deployment Commands

### Backend (After Render setup)
```bash
# Your backend will auto-deploy on git push to main branch
git add .
git commit -m "Deploy to production"
git push origin main
```

### Frontend (After Vercel setup)
```bash
# Your frontend will auto-deploy on git push to main branch
git add .
git commit -m "Deploy to production"
git push origin main
```

Both platforms support automatic deployments from GitHub, so once configured, deployments happen automatically on code push.
