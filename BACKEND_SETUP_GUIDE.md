# Backend Setup and Running Guide

This guide will help you set up and run the backend server for the Vascom Store Management System with SQL Workbench functionality.

## Prerequisites

### Required Software

- **Node.js** (version 14 or higher)
- **MySQL** database server
- **npm** (Node Package Manager)

### Installation Commands

#### Check Node.js and npm versions:

```bash
node --version
npm --version
```

#### Install MySQL:

- **Windows**: Download from [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- **Mac**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian)

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:

- express
- mysql2
- cors
- dotenv
- bcryptjs

### 3. Database Configuration

#### Option A: Using MySQL Database (Recommended)

1. Create a MySQL database:

```sql
CREATE DATABASE store_management;
```

2. Update the database configuration in `backend/config/db.js`:

```javascript
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "Store",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "store_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
```

3. Or create a `.env` file in the backend directory:

```
DB_HOST=localhost
DB_USER=Store
DB_PASSWORD=1234
DB_NAME=store_management
PORT=5000
```

#### Option B: Using Mock Database (For Testing)

The system includes a mock database that runs in memory. No MySQL setup required.

### 4. Start the Backend Server

#### Development Mode:

```bash
npm run dev
```

#### Production Mode:

```bash
npm start
```

### 5. Verify Backend is Running

Open your browser and visit: `http://localhost:5000/api/health`

You should see:

```json
{
  "message": "Store Management Backend API is running",
  "status": "healthy",
  "timestamp": "2024-02-28T12:00:00.000Z"
}
```

## API Endpoints Available

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Employee registration

### Items Management

- `GET /api/items` - Get all items
- `POST /api/items` - Add new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Requests Management

- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request status

### Employees Management

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Add new employee

### SQL Workbench (NEW!)

- `POST /api/sql/execute` - Execute SQL queries
- `GET /api/sql/schema/:table` - Get table schema
- `GET /api/sql/tables` - Get all tables
- `GET /api/sql/sample-queries` - Get sample queries

## Default Test Users

When using the mock database, these users are available:

### HR Manager

- **Employee ID**: `HR100`
- **Password**: `password`

### Store Manager

- **Employee ID**: `STORE100`
- **Password**: `password`

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change the port in `backend/.env` or kill the process using port 5000:

```bash
# Find process using port 5000
lsof -ti:5000
# Kill the process
kill -9 $(lsof -ti:5000)
```

#### 2. MySQL Connection Error

```bash
Error: ER_ACCESS_DENIED_ERROR: Access denied for user
```

**Solution**: Check your MySQL credentials in `.env` file or `backend/config/db.js`

#### 3. Database Not Found

```bash
Error: ER_BAD_DB_ERROR: Unknown database 'store_management'
```

**Solution**: Create the database or update the database name in your configuration

#### 4. Missing Dependencies

```bash
Error: Cannot find module 'express'
```

**Solution**: Run `npm install` again in the backend directory

### Debug Mode

To see detailed logs, set the environment variable:

```bash
DEBUG=store-management:* npm run dev
```

## Running with Frontend

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend (in another terminal)

```bash
cd ..
npm run dev
```

### 3. Access the Application

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Production Deployment

### Environment Variables for Production

Create a `.env` file in the backend directory:

```
NODE_ENV=production
DB_HOST=your_production_host
DB_USER=your_production_user
DB_PASSWORD=your_production_password
DB_NAME=your_production_database
PORT=5000
```

### Build and Start

```bash
# Install production dependencies
npm ci

# Start the server
npm start
```

## Database Schema

The system automatically creates the following tables:

### employees

```sql
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  position VARCHAR(50) NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### items

```sql
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  model VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  photo VARCHAR(255),
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### requests

```sql
CREATE TABLE requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  status ENUM('Pending', 'Approved', 'Rejected', 'Finished') DEFAULT 'Pending',
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_approved TIMESTAMP NULL,
  date_finished TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Testing the SQL Workbench

Once the backend is running, you can test the SQL Workbench:

1. Start both frontend and backend
2. Navigate to the SQL Workbench in the application
3. Try executing sample queries like:
   ```sql
   SELECT * FROM employees ORDER BY name ASC;
   ```
4. View table schemas and execute custom queries

## Support

If you encounter issues:

1. Check the terminal for error messages
2. Verify your database connection
3. Ensure all required environment variables are set
4. Check the browser console for frontend errors
5. Review the API endpoints at `http://localhost:5000/api/health`

The backend server should now be running successfully with all features including the new SQL Workbench functionality!
