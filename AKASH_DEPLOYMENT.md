# Akash Network Deployment Guide

## Prerequisites
- Docker installed and running
- Akash Console account at https://console.akash.network
- Docker Hub account

## Step 1: Build and Push Docker Image

```bash
# Build the Docker image
docker build -t pratyushkumar43/disaster-backend:latest .

# Push to Docker Hub
docker login
docker push pratyushkumar43/disaster-backend:latest
```

## Step 2: Update Environment Variables

Edit `deploy-akash.yaml` and update:
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `WEATHER_API_KEY`: Your OpenWeatherMap API key
- `JWT_SECRET`: A secure JWT secret key

## Step 3: Deploy via Akash Console

1. Go to https://console.akash.network
2. Create account and get free credits from @Fenil_TG
3. Click "Deploy" → "Build your template"
4. Upload your `deploy-akash.yaml` file
5. Review and deploy

## Step 4: Test on Sandbox First

Always test on sandbox network before mainnet deployment.

## Environment Variables Required

- `NODE_ENV=production`
- `PORT=10000` 
- `MONGODB_URI`: Your MongoDB connection string
- `WEATHER_API_KEY`: OpenWeatherMap API key
- `JWT_SECRET`: JWT secret for authentication
- `CORS_ORIGIN=*`

## SDL File Format

The `deploy-akash.yaml` follows Akash SDL v2.0 specification with:
- **Services**: Docker image and environment configuration
- **Profiles**: Resource requirements (CPU, memory, storage)
- **Deployment**: How services are deployed

## Support

- Akash Console: https://console.akash.network
- Akash Discord: https://discord.com/invite/akash
- Akash Telegram India: https://t.me/akashnet_in
