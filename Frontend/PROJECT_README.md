# 🚨 Disaster Management System

A comprehensive disaster management and inventory tracking system built with Next.js, Node.js, and MongoDB. This system enables real-time coordination, resource management, and emergency response for government agencies, NGOs, and emergency responders across India.

## 🌟 Features

### Frontend (Next.js + TypeScript)
- **Real-time Dashboard** - Live inventory updates with Socket.io
- **Inventory Management** - Track medical supplies, rescue equipment, food, water, shelter materials
- **AI Analysis Integration** - Smart insights and predictive analytics
- **Multi-department Support** - Fire, Medical, Rescue, Relief operations
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark/Light Theme** - User preference settings
- **Role-based Access** - Admin, Coordinator, Field Worker, Volunteer permissions

### Backend (Node.js + Express + MongoDB)
- **RESTful API** - Comprehensive API with OpenAPI documentation
- **Real-time Updates** - Socket.io for live notifications
- **Authentication & Authorization** - JWT-based with role permissions
- **Multi-level Organization** - States → Districts → Departments
- **Advanced Filtering** - Search, filter, and sort inventory items
- **Alert System** - Low stock, expiring items, and critical alerts
- **Transaction Management** - Full audit trail and approval workflows
- **Security Features** - Rate limiting, CORS protection, input validation

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Modern icon library
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Joi** - Data validation
- **Winston** - Logging
- **Swagger** - API documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd disaster-management-system
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file (see backend/ENVIRONMENT_SETUP.md for details)
# Edit .env with your MongoDB connection string and other configs

# Start the backend server
npm run dev
```

### 3. Setup Frontend
```bash
cd .. # Go back to root directory
npm install

# Start the frontend development server
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## 📁 Project Structure

```
disaster-management/
├── app/                          # Next.js app directory
│   ├── dashboard/               # Dashboard pages
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── backend/                     # Node.js backend
│   ├── src/
│   │   ├── config/             # Database and app configuration
│   │   ├── controllers/        # Route controllers
│   │   ├── middleware/         # Auth and error handling
│   │   ├── models/             # MongoDB schemas
│   │   ├── routes/             # API routes
│   │   └── utils/              # Utilities and validators
│   ├── server.js               # Main server file
│   └── package.json            # Backend dependencies
├── lib/                        # Shared utilities
│   ├── api.ts                  # API client functions
│   ├── socket.ts               # Socket.io client
│   └── utils.ts                # Utility functions
└── components.json             # shadcn/ui configuration
```

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/password` - Change password

### Inventory Management
- `GET /api/v1/inventory` - Get all inventory (with filters)
- `POST /api/v1/inventory` - Create inventory item
- `GET /api/v1/inventory/:id` - Get single item
- `PUT /api/v1/inventory/:id` - Update item
- `DELETE /api/v1/inventory/:id` - Delete item
- `GET /api/v1/inventory/alerts/low-stock` - Low stock alerts
- `GET /api/v1/inventory/dashboard/stats` - Dashboard statistics

### Departments
- `GET /api/v1/departments` - Get all departments
- `POST /api/v1/departments` - Create department
- `GET /api/v1/departments/:id` - Get department details
- `GET /api/v1/departments/by-state/:state` - Get departments by state

### Transactions
- `GET /api/v1/transactions` - Get all transactions
- `POST /api/v1/transactions` - Create transaction
- `PATCH /api/v1/transactions/:id/status` - Update status
- `GET /api/v1/transactions/pending` - Pending transactions

### Testing
- `GET /api/v1/test/ping` - Server health check
- `GET /api/v1/test/db-connection` - Database connection test
- `GET /api/v1/test/auth` - Authentication test (protected)

## 🔐 User Roles & Permissions

- **Admin**: Full access to all resources and system configuration
- **Coordinator**: Manage inventory, approve transactions, view reports
- **Field Worker**: Update inventory, create transactions, view assigned resources
- **Volunteer**: Read-only access to assigned resources and basic reporting

## 🌐 Real-time Features

The system includes Socket.io integration for:
- Live inventory updates
- Transaction status changes
- Low stock notifications
- System alerts and announcements
- Multi-user collaboration

## 🧪 Testing the Setup

Use the test endpoints to verify your setup:

```bash
# Test basic connectivity
curl http://localhost:5000/api/v1/test/ping

# Test database connection
curl http://localhost:5000/api/v1/test/db-connection

# Test authentication (after login)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5000/api/v1/test/auth
```

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Secure password hashing with bcrypt
- SQL injection prevention
- XSS protection with helmet

## 🌍 Environment Setup

### MongoDB Connection String Fix
If your MongoDB password contains special characters, make sure to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`

Example:
```bash
# Original password: w2avF@@@XiDyNXW
# URL-encoded: w2avF%40%40%40XiDyNXW
MONGODB_URL=mongodb+srv://username:w2avF%40%40%40XiDyNXW@cluster.mongodb.net/disaster_management
```

## 🔧 Complete Implementation Status

### ✅ Completed Features
- **Frontend Dashboard** - Fully functional with real-time updates
- **Backend API** - Complete CRUD operations for all entities
- **Database Models** - User, Department, Inventory, Transaction schemas
- **Authentication** - JWT-based auth with role-based access
- **Socket.io Integration** - Real-time inventory updates
- **API Client** - Complete TypeScript API client with error handling
- **Responsive Design** - Mobile-first responsive design
- **Environment Configuration** - Proper .env setup with documentation

### 🔄 Real-time Socket Events
The system now broadcasts the following events:
- `inventoryCreated` - New inventory item added
- `inventoryUpdated` - Inventory item modified
- `inventoryDeleted` - Inventory item removed
- `stockLevelChanged` - Stock quantities updated
- `lowStockAlert` - Item below minimum threshold
- `transactionCreated` - New transaction initiated
- `transactionStatusUpdated` - Transaction approval/completion

### 🎯 Next Steps for Production
1. **Deploy Backend** - Use Railway, Heroku, or DigitalOcean
2. **Deploy Frontend** - Use Vercel or Netlify
3. **Configure Production Database** - Set up MongoDB Atlas production cluster
4. **Set Environment Variables** - Configure production secrets
5. **SSL Certificates** - Enable HTTPS for secure communication
6. **Monitoring** - Add logging and error tracking (Sentry, LogRocket)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the environment setup guide in `backend/ENVIRONMENT_SETUP.md`

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Complete CRUD operations for inventory, departments, users, transactions
- ✅ Real-time updates with Socket.io integration
- ✅ Role-based authentication and authorization
- ✅ Comprehensive dashboard with live statistics
- ✅ Mobile-responsive design with dark/light themes
- ✅ API documentation with Swagger/OpenAPI
- ✅ Environment configuration and setup guides
- ✅ Test endpoints for easy development verification
- ✅ MongoDB connection with proper error handling
- ✅ TypeScript API client with full type safety
- ✅ Advanced filtering and search capabilities
- ✅ Socket.io real-time connection status indicator







