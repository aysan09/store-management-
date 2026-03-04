# Running the Store Management Backend Server

## Prerequisites

Before running the server, ensure you have the following installed:

1. **Node.js** (version 14 or higher)
2. **MySQL** database server
3. **npm** (comes with Node.js)

## Installation Steps

### 1. Install Dependencies

Navigate to the backend directory and install all required packages:

```bash
cd backend
npm install
```

This will install all dependencies listed in `package.json`:

- express (web framework)
- cors (cross-origin resource sharing)
- dotenv (environment variables)
- mysql2 (MySQL database driver)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- multer (file uploads)
- uuid (unique identifiers)
- nodemon (development server - dev dependency)

### 2. Database Setup

#### Option A: Using MySQL Database (Recommended)

1. **Create Database:**

   ```sql
   CREATE DATABASE store_management;
   ```

2. **Configure Database Connection:**
   Edit the `.env` file in the `backend/` directory:

   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=store_management
   ```

3. **Initialize Database Tables:**
   The server will automatically create necessary tables when started for the first time.

#### Option B: Using Mock Database (For Testing)

If you don't have MySQL setup, the system includes a mock database configuration in `backend/config/mockDb.js` that uses in-memory storage for testing purposes.

### 3. Environment Configuration

Ensure your `.env` file contains all required variables:

```env
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234
DB_NAME=store_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_this_in_production

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Important:** Change the JWT_SECRET to a secure random string in production!

## Running the Server

### Development Mode (with auto-restart)

```bash
cd backend
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Production Mode

```bash
cd backend
npm start
```

### Manual Node.js Execution

```bash
cd backend
node server.js
```

## Server Information

Once running, the server will:

- Start on port 5000 (configurable via PORT environment variable)
- Initialize database tables automatically
- Test database connection
- Display startup information including:
  - Server status
  - API base URL: `http://localhost:5000/api`
  - Health check endpoint: `http://localhost:5000/api/health`

## Available Endpoints

The server provides the following API endpoints:

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new request
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `POST /api/sql` - Execute custom SQL queries

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the PORT in `.env` file
   - Or stop other services using port 5000

2. **Database connection failed:**
   - Check MySQL server is running
   - Verify database credentials in `.env`
   - Ensure database exists

3. **Missing dependencies:**
   - Run `npm install` again
   - Check Node.js version compatibility

4. **Permission errors:**
   - Ensure write permissions for the project directory
   - Check file permissions for `.env` file

### Testing the Server

You can test if the server is running by visiting:

- Health check: `http://localhost:5000/api/health`
- This should return a JSON response with server status

## Next Steps

After the backend is running:

1. **Frontend Setup:** The frontend is located in the `src/` directory
2. **Database Population:** Add initial data through the API or SQL workbench
3. **Email Configuration:** Set up email notifications (optional)
4. **Production Deployment:** Configure for production environment

## Development Tips

- Use `npm run dev` during development for automatic restarts
- Check console logs for database initialization status
- Use the SQL workbench (`/api/sql`) for database management
- Monitor the `/api/health` endpoint for server status
