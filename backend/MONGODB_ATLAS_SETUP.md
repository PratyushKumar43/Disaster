# MongoDB Atlas Migration Guide

## 🎯 Overview
This guide will help you migrate your disaster management application data to MongoDB Atlas cloud database.

## 📋 Prerequisites
- MongoDB Atlas account (free tier available)
- Your Atlas cluster URL: `mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/`

## 🔧 Setup Steps

### 1. Fix IP Whitelist Issue (CRITICAL)

**Problem:** Connection fails with "Could not connect to any servers in your MongoDB Atlas cluster"

**Solution:**
1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Navigate to your project
3. Click on **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. Choose one of these options:
   - **Recommended for development:** Click "Add Current IP Address"
   - **For testing only:** Add `0.0.0.0/0` to allow all IPs
6. Click **"Confirm"**

⚠️ **Important:** It may take 1-2 minutes for the IP whitelist changes to take effect.

### 2. Verify Database User Permissions

Ensure your database user has proper permissions:
1. Go to **"Database Access"** in Atlas dashboard
2. Find user `Pratyush`
3. Ensure it has **"Read and write to any database"** permissions
4. If not, click **"Edit"** and update permissions

### 3. Test Connection

Run the connection test to verify everything works:

```bash
# From the backend directory
node simple-connection-test.js
```

Expected output:
```
✅ Successfully connected to MongoDB Atlas!
📍 Database: disaster-management
🧪 Testing basic operations...
📋 Found X collections
✅ Test write successful
🎉 All tests passed!
```

### 4. Run Full Migration

Once connection test passes, run the complete migration:

```bash
node migrate-to-atlas.js
```

This will:
- ✅ Connect to MongoDB Atlas
- 📚 Create database indexes
- 🌱 Seed sample departments data
- 📦 Create sample inventory items
- 🔍 Verify migration success
- 📊 Generate a detailed report

## 📁 Files Updated

1. **`src/config/database.js`** - Updated default connection URL
2. **`seed-departments.js`** - Fixed connection string
3. **`migrate-to-atlas.js`** - Complete migration script
4. **`simple-connection-test.js`** - Basic connection test

## 🔒 Environment Variables (Optional)

Create a `.env` file in the backend directory for better security:

```env
MONGODB_URL=mongodb+srv://Pratyush:Pratyush25@cluster0.tkpnm4v.mongodb.net/disaster-management?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
LOG_LEVEL=info
```

## 🚀 Running Your Application

After successful migration, start your backend server:

```bash
npm start
# or for development
npm run dev
```

## 📊 Sample Data Included

The migration includes:
- **12+ Department types** (Fire, Police, Medical, etc.)
- **Sample Inventory items** (First aid kits, water supplies, etc.)
- **Proper indexes** for optimal performance

## 🛠️ Troubleshooting

### Connection Timeout
- Check your internet connection
- Verify Atlas cluster is running (not paused)

### Authentication Failed
- Double-check username and password in connection string
- Verify user exists in Database Access section

### IP Not Whitelisted
- Add your current IP to Network Access
- Wait 1-2 minutes for changes to take effect

### Database Not Found
- The database will be created automatically when you insert data
- No need to manually create the database

## 📞 Support

If you encounter issues:
1. Check the migration report file: `migration-report.json`
2. Review console output for specific error messages
3. Verify all steps in this guide have been completed

## 🎉 Success Indicators

You'll know the migration is successful when:
- ✅ Connection test passes
- ✅ Migration script completes without errors
- ✅ Your application starts and connects to Atlas
- ✅ You can see data in Atlas dashboard under "Collections"

---

**Next Steps:** After successful migration, your application will use MongoDB Atlas as the database. All CRUD operations will work with the cloud database.
