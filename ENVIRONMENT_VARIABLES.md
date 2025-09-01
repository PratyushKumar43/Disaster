# Environment Variables Template for Production

## Backend (.env for Render)
```
NODE_ENV=production
PORT=10000
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/disaster-management?retryWrites=true&w=majority
JWT_SECRET=generate_a_strong_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=generate_another_strong_secret_key_here
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://your-app-name.vercel.app
OPENWEATHER_API_KEY=your_openweather_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
LOG_LEVEL=info
API_VERSION=v1
```

## Frontend (.env.local for Vercel)
```
NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com/api
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key
NEXT_PUBLIC_APP_NAME=Disaster Management System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## How to Generate Secure Secrets

### JWT Secrets
Run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### MongoDB Atlas Setup
1. Create cluster at https://cloud.mongodb.com
2. Create database user
3. Get connection string
4. Replace `<password>` with actual password
5. Whitelist IP addresses (0.0.0.0/0 for all IPs)

### OpenWeather API Key
1. Sign up at https://openweathermap.org/api
2. Get free API key
3. Add to environment variables

### Gmail App Password (for SMTP)
1. Enable 2-factor authentication on Gmail
2. Generate app password in Google Account settings
3. Use app password in SMTP_PASS

## Security Notes
- Never commit .env files to git
- Use strong, unique secrets for production
- Regularly rotate API keys and secrets
- Monitor for unauthorized access
- Use HTTPS for all communications
