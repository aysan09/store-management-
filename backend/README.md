# Store Management Backend API

A comprehensive Node.js backend API for the Store Management System built with Express.js and MySQL.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Employee Management**: Full CRUD operations for employee registration and management
- **Inventory Management**: Complete item management with photo upload support
- **Request Management**: Employee request system with status tracking
- **File Upload**: Support for item photo uploads with multer
- **Database**: MySQL database with proper schema and relationships
- **Error Handling**: Comprehensive error handling middleware
- **CORS**: Cross-Origin Resource Sharing support

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Database management system
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=store_management
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Set up MySQL database**

   ```sql
   CREATE DATABASE store_management;
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Employees

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get specific employee
- `POST /api/employees` - Register new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/search` - Search employees

### Items

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get specific item
- `POST /api/items` - Add new item (with photo upload)
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Requests

- `GET /api/requests` - Get all requests
- `GET /api/requests/:id` - Get specific request
- `POST /api/requests` - Submit new request
- `PUT /api/requests/:id/status` - Update request status
- `DELETE /api/requests/:id` - Delete request
- `GET /api/requests/status/:status` - Get requests by status

## Database Schema

### Employees Table

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

### Items Table

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

### Requests Table

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

## Default Users

The system comes with default test users:

### HR Manager

- **Employee ID**: `HR100`
- **Password**: `hr123`
- **Role**: HR Manager

### Store Manager

- **Employee ID**: `STORE100`
- **Password**: `store123`
- **Role**: Store Manager

## File Upload

The API supports photo uploads for items using multer. Photos are stored in the `/uploads` directory and served statically.

## Security Features

- Password hashing with bcrypt
- JWT authentication with expiration
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- CORS configuration for frontend integration

## Development

For development with auto-restart:

```bash
npm run dev
```

## Testing

The API can be tested using tools like Postman or curl. Make sure to include the JWT token in the Authorization header for protected routes:

```
Authorization: Bearer <your-jwt-token>
```

## License

ISC License
