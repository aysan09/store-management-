const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_management',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    process.exit(1);
  }
}

// Initialize database tables
async function initDatabase() {
  try {
    const connection = await pool.getConnection();

    // Create employees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(50) NOT NULL,
        position VARCHAR(50) NOT NULL,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model VARCHAR(100) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        photo VARCHAR(255),
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create unified requests table with status column
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_name VARCHAR(100) NOT NULL,
        item_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        purpose TEXT,
        status ENUM('Pending', 'Approved', 'Finished') DEFAULT 'Pending',
        date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_approved TIMESTAMP NULL,
        date_finished TIMESTAMP NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default employees if table is empty
    const [employeeCount] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    if (employeeCount[0].count === 0) {
      const hrPassword = await bcrypt.hash('hr123', 10);
      const storePassword = await bcrypt.hash('store123', 10);

      await connection.execute(`
        INSERT INTO employees (name, department, position, employee_id, password) VALUES
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
      `, ['HR Manager', 'HR', 'Manager', 'HR100', hrPassword, 'Store Manager', 'Store', 'Manager', 'STORE100', storePassword]);
    }

    connection.release();
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  }
}

module.exports = {
  pool,
  testConnection,
  initDatabase
};
