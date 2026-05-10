const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Create MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'store_management',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
async function testConnection() {
  try {
    const connection = await db.getConnection();
    await connection.execute('SELECT 1 as test');
    connection.release();
    console.log('✅ MySQL database connection test passed');
    return true;
  } catch (err) {
    console.error('❌ MySQL database connection failed:', err.message);
    throw err;
  }
}

// Initialize database tables
async function initDatabase() {
  try {
    // Create employees table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        date_created DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Employees table created successfully');

    // Create items table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        model VARCHAR(255) NOT NULL,
        brand VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        photo VARCHAR(500),
        date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Items table created successfully');

    // Create unified requests table with status column
    await db.execute(`
      CREATE TABLE IF NOT EXISTS requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_name VARCHAR(255) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_brand VARCHAR(255),
        quantity INT NOT NULL,
        purpose TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_approved DATETIME,
        date_finished DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add item_brand column if it doesn't exist
    try {
      await db.execute('ALTER TABLE requests ADD COLUMN item_brand VARCHAR(255) AFTER item_name');
      console.log('✅ Added item_brand column to requests table');
    } catch (err) {
      // Column might already exist
      if (err.code !== 'ER_DUP_FIELDNAME') {
        console.error('Error adding item_brand column:', err.message);
      }
    }
    console.log('✅ Requests table created successfully');

    // Check if employees table has data
    const [rows] = await db.execute('SELECT COUNT(*) as count FROM employees');
    const employeeCount = rows[0].count;

    if (employeeCount === 0) {
      // Insert default employees
      const hrPassword = await bcrypt.hash('hr123', 10);
      const storePassword = await bcrypt.hash('store123', 10);

      await db.execute(`
        INSERT INTO employees (name, department, position, employee_id, password) VALUES
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
      `, ['HR Manager', 'HR', 'Manager', 'HR100', hrPassword, 'Store Manager', 'Store', 'Manager', 'STORE100', storePassword]);

      console.log('✅ Default employees inserted successfully');
    } else {
      console.log('✅ Employees table already has data');
    }

    console.log('✅ MySQL database tables initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing MySQL database:', err.message);
    throw err;
  }
}

module.exports = {
  db,
  testConnection,
  initDatabase
};
