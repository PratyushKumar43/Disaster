# DisasterIQ - Disaster Management System

A comprehensive disaster management platform that provides real-time inventory tracking, weather monitoring, AI-powered analysis, and emergency response coordination for disaster management teams.

## 🌟 Features

### 🏠 Dashboard
- **Real-time Overview**: Live statistics and key metrics
- **Quick Actions**: Fast access to critical operations
- **Interactive Charts**: Visual representation of data trends
- **Responsive Design**: Optimized for all devices

### 📦 Inventory Management
- **Real-time Tracking**: Monitor inventory levels across multiple departments
- **Automated Alerts**: Low stock notifications and expiry warnings
- **Department Management**: Organize resources by emergency response teams
- **Transaction History**: Complete audit trail of all inventory movements
- **Export Capabilities**: Generate reports in PDF and Excel formats

### 🌤️ Weather Monitoring
- **Real-time Data**: Live weather updates and forecasts
- **Interactive Maps**: Visual weather data with Leaflet integration
- **Weather Reports**: Detailed analysis and historical data
- **API Integration**: OpenWeather and Bhuvan satellite data

### 🤖 AI-Powered Analysis
- **Gemini AI Integration**: Advanced analytics and insights
- **Predictive Modeling**: Forecast resource needs and disaster impacts
- **Automated Reports**: Generate comprehensive analysis reports
- **Smart Recommendations**: AI-driven suggestions for optimal resource allocation

### 🔐 Security & Performance
- **Rate Limiting**: API protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Robust error management system
- **Logging**: Detailed application logging with Winston

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── config/          # Database and configuration
│   ├── controllers/     # Business logic controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # External service integrations
│   └── utils/           # Utility functions
├── server.js           # Main application entry point
└── package.json        # Dependencies and scripts
```

### Frontend (Next.js + React)
```
Frontend/
├── app/                # Next.js app router
│   ├── components/     # Reusable UI components
│   ├── dashboard/      # Dashboard pages
│   ├── providers/      # React context providers
│   └── globals.css     # Global styles
├── components/         # Shared components
│   ├── ui/            # Base UI components
│   ├── dashboard/     # Dashboard-specific components
│   └── layout/        # Layout components
├── lib/               # Utility libraries
└── hooks/             # Custom React hooks
```

## 🚀 Quick Start

### Prerequisites
- Node.js (>= 18.0.0)
- npm (>= 8.0.0)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd disaster
```

2. **Install dependencies**
```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install individually
npm run install:backend
npm run install:frontend
```

3. **Environment Setup**
```bash
# Backend environment variables
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend environment variables
cd ../Frontend
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Database Setup**
```bash
cd backend
npm run seed:departments
npm run seed:inventory
```

5. **Start Development Server**
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start individually
npm run start:backend    # Backend on port 5000
npm run start:frontend   # Frontend on port 3000
```

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/disaster-management
MONGODB_ATLAS_URI=your-atlas-connection-string

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# API Keys
OPENWEATHER_API_KEY=your-openweather-api-key
GEMINI_API_KEY=your-gemini-api-key
BHUVAN_API_KEY=your-bhuvan-api-key

# Security
JWT_SECRET=your-jwt-secret
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WEATHER_API_KEY=your-openweather-api-key
```

## 📱 Available Scripts

### Root Level
```bash
npm run dev              # Start development servers
npm run install:all      # Install all dependencies
npm run build            # Build both backend and frontend
npm run start            # Start production servers
npm run lint             # Run linting for both projects
```

### Backend Scripts
```bash
cd backend
npm start                # Start production server
npm run dev              # Start development server with nodemon
npm run seed:departments # Seed department data
npm run seed:inventory   # Seed inventory data
npm test                 # Run tests
npm run lint             # Run ESLint
```

### Frontend Scripts
```bash
cd Frontend
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript type checking
```

## 🔌 API Endpoints

### Inventory Management
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `GET /api/inventory/departments` - Get inventory by department

### Department Management
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create new department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Weather Data
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get weather forecast
- `GET /api/weather/reports` - Get weather reports

### AI Analysis
- `POST /api/ai/analyze` - Generate AI analysis
- `GET /api/ai/reports` - Get analysis reports

### Transactions
- `GET /api/transactions` - Get transaction history
- `POST /api/transactions` - Create new transaction

## 🗄️ Database Schema

### Inventory Model
```javascript
{
  name: String,
  category: String,
  department: ObjectId,
  quantity: Number,
  unit: String,
  expiryDate: Date,
  location: String,
  status: String,
  lastUpdated: Date
}
```

### Department Model
```javascript
{
  name: String,
  description: String,
  location: String,
  contactInfo: {
    email: String,
    phone: String
  },
  isActive: Boolean
}
```

### Transaction Model
```javascript
{
  type: String, // 'in', 'out', 'transfer'
  itemId: ObjectId,
  quantity: Number,
  department: ObjectId,
  reason: String,
  timestamp: Date
}
```

## 🎨 Design System

The application follows a unified design system with:

- **Color Palette**: Dark theme with accent colors
- **Typography**: Inter, Geist, and Bricolage Grotesque fonts
- **Components**: Reusable UI components with consistent styling
- **Animations**: Smooth transitions using Framer Motion
- **Responsive Design**: Mobile-first approach

### Key Design Tokens
```css
/* Primary Colors */
--primary-900: #0B0F12;  /* Deep dark background */
--primary-800: #1A1D21;  /* Card backgrounds */
--primary-700: #2A2D31;  /* Elevated surfaces */

/* Accent Colors */
--accent-blue: #3B82F6;    /* Primary actions */
--accent-green: #10B981;   /* Success states */
--accent-yellow: #F59E0B;  /* Warning states */
--accent-red: #EF4444;     /* Error states */
```

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Deploy to Vercel
npm run deploy:vercel

# Or use the provided scripts
./deploy-vercel.sh    # Unix/Linux/macOS
./deploy-vercel.ps1   # Windows PowerShell
```

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

### Manual Deployment
1. Build the frontend: `cd Frontend && npm run build`
2. Deploy backend to your preferred hosting service
3. Configure environment variables
4. Set up MongoDB Atlas or your preferred database

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode

# Frontend tests
cd Frontend
npm test                 # Run component tests
npm run test:e2e         # Run end-to-end tests
```

## 📊 Monitoring & Analytics

- **Health Check**: `/health` endpoint for monitoring
- **Logging**: Comprehensive logging with Winston
- **Error Tracking**: Centralized error handling
- **Performance**: Rate limiting and request optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines
- Follow the established coding standards
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the API documentation at `/api-docs` (when server is running)

## 🔮 Roadmap

### Upcoming Features
- [ ] Mobile application (React Native)
- [ ] Advanced AI predictions
- [ ] Multi-language support
- [ ] Advanced reporting dashboard
- [ ] Integration with more weather APIs
- [ ] Real-time notifications
- [ ] Offline mode support

### Performance Improvements
- [ ] Database optimization
- [ ] Caching implementation
- [ ] Image optimization
- [ ] Bundle size reduction

## 📈 Performance Metrics

- **Frontend**: Lighthouse score 95+
- **Backend**: Response time < 200ms
- **Database**: Query optimization
- **Mobile**: Responsive design score 100

---

**Built with ❤️ for disaster management teams worldwide**

