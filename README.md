# Vascom Store Management System

A comprehensive store management system for Vascom with React frontend and Node.js backend.

## Project Structure

```
figma/
├── backend/          # Node.js backend server
│   ├── config/       # Database configuration
│   ├── middleware/   # Authentication middleware
│   ├── routes/       # API endpoints
│   ├── uploads/      # File uploads
│   └── server.js     # Main server file
├── src/             # React frontend
│   ├── components/   # Reusable components
│   ├── pages/       # Page components
│   └── styles.css   # Global styles
└── README.md        # This file
```

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- SQLite (for database)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd figma
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../
npm install
```

### 4. Environment Setup

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
JWT_SECRET=your-secret-key-here
DB_PATH=./store_management.db
```

### 5. Initialize Database

The system uses SQLite. The database will be created automatically when the server starts.

## Running the Project

### Start Backend Server

```bash
cd backend
npm start
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

In a new terminal window:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Features

- **Inventory Management**: Real-time tracking of store items
- **Employee Requests**: Streamlined request system with approval workflows
- **HR Management**: Employee registration and records management
- **Reporting & Analytics**: Detailed reports and performance metrics

## Available Pages

- **Home Page**: Landing page with system overview
- **About Page**: System features and team information
- **Login Page**: User authentication
- **Store Page**: Inventory management
- **Request Form**: Employee item requests
- **HR Review**: Request approval workflow
- **SQL Workbench**: Database management interface

## API Endpoints

The backend provides RESTful APIs for:

- Authentication (`/api/auth`)
- Employee management (`/api/employees`)
- Item management (`/api/items`)
- Request management (`/api/requests`)
- SQL operations (`/api/sql`)

## Technologies Used

**Frontend:**

- React 18
- Vite (build tool)
- CSS3 with custom animations

**Backend:**

- Node.js
- Express.js
- SQLite3
- JWT for authentication
- CORS for cross-origin requests

## Development

### Frontend Development

The frontend uses Vite for fast development with hot module replacement.

### Backend Development

The backend uses Express.js with SQLite for data persistence.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
