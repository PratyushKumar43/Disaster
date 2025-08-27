# Disaster Management Inventory System - Backend

A comprehensive Node.js backend API for managing disaster relief inventory and resources across different departments and locations.

## 🚀 Features

- **Multi-level Organization**: States → Districts → Departments
- **Department-specific Inventory**: Fire, Medical, Rescue, Relief operations
- **Role-based Access Control**: Admin, Coordinator, Field Worker, Volunteer
- **Real-time Updates**: Socket.io integration for live notifications
- **Comprehensive Tracking**: Full transaction history and audit logs
- **Advanced Filtering**: Search, filter, and sort inventory items
- **Alert System**: Low stock, expiring items, and critical alerts
- **RESTful API**: Well-documented endpoints with Swagger
- **Data Validation**: Joi validation for all inputs
- **Security**: JWT authentication, rate limiting, CORS protection

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd disaster-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/disaster_management
   JWT_SECRET=your_super_secret_jwt_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # Database connection
│   │   └── constants.js      # Application constants
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Department.js    # Department model
│   │   ├── Inventory.js     # Inventory model
│   │   └── Transaction.js   # Transaction model
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── inventoryController.js   # Inventory management
│   │   ├── departmentController.js  # Department management
│   │   └── transactionController.js # Transaction handling
│   ├── routes/
│   │   ├── auth.js          # Auth routes
│   │   ├── inventory.js     # Inventory routes
│   │   ├── departments.js   # Department routes
│   │   └── transactions.js  # Transaction routes
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   └── errorHandler.js  # Error handling
│   └── utils/
│       └── validators.js    # Input validation schemas
├── server.js               # Main server file
├── package.json
└── README.md
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/password` - Change password
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Inventory Management
- `GET /api/v1/inventory` - Get all inventory (with filters)
- `POST /api/v1/inventory` - Create inventory item
- `GET /api/v1/inventory/:id` - Get single item
- `PUT /api/v1/inventory/:id` - Update item
- `DELETE /api/v1/inventory/:id` - Delete item
- `GET /api/v1/inventory/alerts/low-stock` - Low stock alerts
- `GET /api/v1/inventory/alerts/critical-stock` - Critical stock
- `GET /api/v1/inventory/alerts/expiring` - Expiring items
- `POST /api/v1/inventory/:id/reserve` - Reserve quantity
- `GET /api/v1/inventory/dashboard/stats` - Dashboard statistics

### Department Management
- `GET /api/v1/departments` - Get all departments
- `POST /api/v1/departments` - Create department
- `GET /api/v1/departments/:id` - Get single department
- `PUT /api/v1/departments/:id` - Update department
- `DELETE /api/v1/departments/:id` - Delete department
- `GET /api/v1/departments/by-state/:state` - Get by state
- `GET /api/v1/departments/by-type/:type` - Get by type
- `PATCH /api/v1/departments/:id/status` - Update status

### Transaction Management
- `GET /api/v1/transactions` - Get all transactions
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions/:id` - Get single transaction
- `PATCH /api/v1/transactions/:id/status` - Update status
- `GET /api/v1/transactions/pending` - Pending transactions
- `GET /api/v1/transactions/overdue` - Overdue transactions
- `GET /api/v1/transactions/stats` - Statistics

## 🔒 Authentication & Authorization

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### User Roles & Permissions

- **Admin**: Full access to all resources
- **Coordinator**: Manage inventory and approve transactions
- **Field Worker**: View and update inventory, create transactions
- **Volunteer**: Read-only access to assigned resources

## 📊 Real-time Updates

The API includes Socket.io integration for real-time updates:

```javascript
// Client-side Socket.io connection
const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', yourJWTToken);

// Subscribe to inventory updates
socket.emit('subscribeToInventory', { department: 'departmentId' });

// Listen for updates
socket.on('inventoryCreated', (data) => {
  console.log('New inventory item:', data);
});

socket.on('inventoryUpdated', (data) => {
  console.log('Inventory updated:', data);
});
```

## 🔍 Filtering & Search

### Inventory Filtering
```bash
GET /api/v1/inventory?category=medical&status=available&lowStock=true&search=mask
```

### Transaction Filtering
```bash
GET /api/v1/transactions?type=outbound&status=pending&startDate=2024-01-01&endDate=2024-12-31
```

### Pagination
```bash
GET /api/v1/inventory?page=1&limit=20&sort=itemName&order=asc
```

## 📈 Data Models

### Inventory Item Schema
```javascript
{
  itemName: "N95 Face Masks",
  itemCode: "MED001",
  category: "medical",
  quantity: {
    current: 100,
    minimum: 20,
    maximum: 500,
    reserved: 10
  },
  unit: "pieces",
  location: {
    department: "departmentId",
    warehouse: "Main Storage",
    section: "A",
    rack: "R1",
    shelf: "S3"
  },
  specifications: {
    brand: "3M",
    model: "8210",
    expiryDate: "2025-12-31"
  },
  status: "available"
}
```

### Transaction Schema
```javascript
{
  transactionId: "TXN1703123456789",
  type: "outbound",
  inventory: "inventoryItemId",
  quantity: 50,
  from: {
    department: "sourceDepartmentId",
    warehouse: "Main Storage"
  },
  to: {
    department: "destinationDepartmentId",
    warehouse: "Field Office"
  },
  reason: "Emergency deployment",
  status: "pending",
  performedBy: "userId"
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🐛 Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "message": "Validation error",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "itemName",
      "message": "Item name is required"
    }
  ]
}
```

## 📝 API Documentation

Interactive API documentation is available at:
- Development: `http://localhost:5000/api/docs`
- Production: `https://your-domain.com/api/docs`

## 🚀 Deployment

### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "disaster-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker
```bash
# Build image
docker build -t disaster-backend .

# Run container
docker run -d -p 5000:5000 --env-file .env disaster-backend
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-mongo-cluster/disaster_management
JWT_SECRET=your-super-secure-secret-key
FRONTEND_URL=https://your-frontend-domain.com
```

## 🔧 Configuration

### Database Indexes
The application automatically creates indexes for optimal performance:
- User email, username, department
- Inventory item codes, categories, locations
- Transaction IDs, dates, departments

### Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Authentication endpoints: 5 requests per 15 minutes
- Configurable via environment variables

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevent abuse and DoS attacks
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configurable cross-origin requests
- **Helmet Security**: Security headers
- **Password Hashing**: bcrypt with salt rounds
- **SQL Injection Prevention**: MongoDB ODM protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support, email support@disastermanagement.com or create an issue in the repository.

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Complete CRUD operations for inventory
- User authentication and authorization
- Real-time updates via Socket.io
- Department and transaction management
- Comprehensive API documentation





