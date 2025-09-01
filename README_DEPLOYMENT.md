# Disaster Management System - Production Deployment

## 🚀 Quick Start Deployment

This repository contains a disaster management system with:
- **Frontend**: Next.js application for Vercel deployment
- **Backend**: Node.js/Express API for Render deployment
- **Database**: MongoDB Atlas

## 📋 Deployment Overview

| Component | Platform | URL Pattern | Cost |
|-----------|----------|-------------|------|
| Frontend | Vercel | `https://your-app.vercel.app` | Free tier available |
| Backend | Render | `https://your-app.onrender.com` | Free tier available |
| Database | MongoDB Atlas | Cloud database | Free tier available |

## 🎯 One-Click Deployment

### Backend (Render)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Frontend (Vercel)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/disaster&project-name=disaster-frontend&repository-name=disaster)

## 📖 Detailed Documentation

1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide
2. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Quick deployment checklist
3. **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Environment configuration template

## ⚡ Quick Deployment Steps

### Prerequisites
- GitHub account with this repository
- MongoDB Atlas account (free)
- Render account (free)
- Vercel account (free)

### 1. Database Setup (5 minutes)
```bash
1. Create MongoDB Atlas cluster
2. Create database user
3. Get connection string
4. Whitelist IP: 0.0.0.0/0
```

### 2. Backend Deployment (10 minutes)
```bash
1. Sign up at render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set root directory: backend
5. Add environment variables
6. Deploy
```

### 3. Frontend Deployment (5 minutes)
```bash
1. Sign up at vercel.com
2. Import GitHub project
3. Set root directory: Frontend
4. Add environment variables
5. Deploy
```

## 🔧 Environment Variables

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/disaster-management
JWT_SECRET=your_secret_here
FRONTEND_URL=https://your-app.vercel.app
OPENWEATHER_API_KEY=your_api_key
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
```

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend.onrender.com/health
```

### Frontend Access
```bash
Open: https://your-frontend.vercel.app
```

## 🐛 Common Issues & Solutions

### Backend Issues
- **Port Error**: Ensure using `process.env.PORT`
- **Database Connection**: Check MongoDB Atlas IP whitelist
- **CORS Error**: Add frontend URL to CORS origins

### Frontend Issues
- **API Connection**: Verify `NEXT_PUBLIC_API_URL`
- **Build Error**: Check TypeScript/ESLint errors
- **Environment Variables**: Ensure `NEXT_PUBLIC_` prefix

## 📊 Performance & Monitoring

### Backend Monitoring
- Render provides built-in monitoring
- Health endpoint: `/health`
- Logs available in Render dashboard

### Frontend Monitoring
- Vercel Analytics (optional)
- Core Web Vitals monitoring
- Real-time performance metrics

## 🔄 Continuous Deployment

Both platforms support automatic deployment:
```bash
git add .
git commit -m "Update application"
git push origin main
# Automatic deployment triggers
```

## 📞 Support Resources

- **Render Support**: https://render.com/docs
- **Vercel Support**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Next.js**: https://nextjs.org/docs

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Vercel)      │───▶│   (Render)      │───▶│ (MongoDB Atlas) │
│   Next.js       │    │   Node.js       │    │   Cloud DB      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛡️ Security Considerations

- Environment variables are encrypted
- HTTPS enforced on all platforms
- CORS properly configured
- JWT secrets auto-generated
- Database access restricted

## 💰 Cost Breakdown

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 100 builds/month
- **Render**: 750 hours/month, auto-sleep after 15min
- **MongoDB Atlas**: 512MB storage, M0 cluster

### Scaling Options
- Paid plans available for higher traffic
- Auto-scaling capabilities
- CDN integration available

## 🎉 Success Metrics

✅ Backend deployed and healthy  
✅ Frontend accessible and functional  
✅ Database connected and operational  
✅ API endpoints responding correctly  
✅ Real-time features working  
✅ No critical errors in logs  

---

**Need Help?** Check the detailed guides or create an issue in this repository.
