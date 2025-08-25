# Disaster Management Inventory System - Complete Setup Guide

This guide will help you set up both the frontend and backend components of the Disaster Management Inventory System.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- **Node.js** v18.0.0 or higher
- **MongoDB** v6.0.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd disaster

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

#### Frontend Environment (.env.local)
```bash
# Copy the environment template
cp env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=DisasterGuard
NEXT_PUBLIC_ENABLE_REAL_TIME=true
```

#### Backend Environment (backend/.env)
```bash
# Copy the environment template
cd backend
cp env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/disaster_management
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

#### Option A: Local MongoDB Installation

**Ubuntu/Debian:**
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb/brew/mongodb-community
```

**Windows:**
Download and install from [MongoDB Official Website](https://www.mongodb.com/try/download/community)

#### Option B: Docker MongoDB

```bash
# Create and start MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:6.0

# For production, update the MONGODB_URI in backend/.env:
# MONGODB_URI=mongodb://admin:password@localhost:27017/disaster_management?authSource=admin
```

#### Option C: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `backend/.env`

### 4. Start the Applications

#### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

Backend will be available at: `http://localhost:5000`
API Documentation: `http://localhost:5000/api/docs`

#### Terminal 2: Start Frontend
```bash
# From project root
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### 5. Create Initial Admin User

Once both servers are running, you can create an admin user by making a POST request to the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@disaster.com",
    "password": "admin123",
    "firstName": "System",
    "lastName": "Administrator",
    "phoneNumber": "+919876543210",
    "role": "admin",
    "department": "DEPT_ID_HERE",
    "state": "Maharashtra",
    "district": "Mumbai"
  }'
```

**Note:** You'll need to create a department first or use the default seeding script.

## 🗃️ Database Seeding (Optional)

Create a seeding script to populate initial data:

```bash
cd backend
node scripts/seed.js
```

This will create:
- Default departments for different disaster response units
- Sample inventory items
- Test users with different roles

## 🔧 Configuration Details

### Frontend Configuration

The frontend uses these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `DisasterGuard` |
| `NEXT_PUBLIC_ENABLE_REAL_TIME` | Enable real-time features | `true` |

### Backend Configuration

Key environment variables for the backend:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRE` | JWT expiration time | No |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No |

## 🏭 Production Deployment

### Frontend Deployment (Vercel - Recommended)

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables:**
   Set these in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
   NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
   ```

3. **Custom Domain:**
   Configure your custom domain in Vercel dashboard

### Backend Deployment Options

#### Option 1: DigitalOcean/AWS/Azure VM

1. **Server Setup:**
   ```bash
   # Install Node.js and MongoDB
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application:**
   ```bash
   # Clone and setup
   git clone <your-repo>
   cd disaster/backend
   npm install --production
   
   # Create production environment file
   cp env.example .env
   # Edit .env with production values
   
   # Start with PM2
   pm2 start server.js --name "disaster-api"
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Option 2: Docker Deployment

1. **Create docker-compose.yml:**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/disaster_management
       depends_on:
         - mongo
       volumes:
         - ./backend/uploads:/app/uploads
         - ./backend/logs:/app/logs
   
     mongo:
       image: mongo:6.0
       ports:
         - "27017:27017"
       volumes:
         - mongo_data:/data/db
   
     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
       depends_on:
         - backend
   
   volumes:
     mongo_data:
   ```

2. **Deploy:**
   ```bash
   docker-compose up -d
   ```

#### Option 3: Heroku Deployment

1. **Backend (Heroku):**
   ```bash
   cd backend
   heroku create your-app-name
   heroku addons:create mongolab:sandbox
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-production-jwt-secret
   git push heroku main
   ```

2. **Frontend (Vercel):**
   Update environment variables to point to Heroku app URL.

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules
- [ ] Set up SSL certificates
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set secure HTTP headers
- [ ] Use environment variables for secrets
- [ ] Regular security updates

### Environment Variables Security

Never commit these to version control:
- JWT secrets
- Database credentials
- API keys
- Production URLs

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm run test
```

### API Testing
Use the Swagger documentation at `http://localhost:5000/api/docs` for interactive API testing.

## 📊 Monitoring

### Health Checks

- Backend: `http://localhost:5000/health`
- Frontend: `http://localhost:3000/api/health` (if implemented)

### Logs

- Backend logs: `backend/logs/app.log`
- PM2 logs: `pm2 logs`
- Docker logs: `docker-compose logs`

## 🔄 Development Workflow

1. **Feature Development:**
   - Create feature branch
   - Develop and test locally
   - Submit pull request
   - Deploy to staging
   - Deploy to production

2. **Database Migrations:**
   - Create migration scripts
   - Test in development
   - Apply to staging
   - Apply to production

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check MongoDB connection
   - Verify environment variables
   - Check port availability

2. **Frontend can't connect to backend:**
   - Verify API URL in environment
   - Check CORS configuration
   - Check network connectivity

3. **Socket.io connection issues:**
   - Verify WebSocket support
   - Check firewall settings
   - Verify Socket URL

4. **Authentication issues:**
   - Check JWT secret configuration
   - Verify token expiration
   - Check user permissions

### Getting Help

- Check the API documentation: `/api/docs`
- Review application logs
- Check MongoDB logs
- Verify environment configuration

## 📚 Additional Resources

- [API Documentation](http://localhost:5000/api/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/)

---

For additional support or questions, please create an issue in the repository.


