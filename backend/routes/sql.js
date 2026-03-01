const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// Middleware to validate SQL queries (basic security)
const allowedOperations = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'SHOW', 'DESCRIBE', 'EXPLAIN'];

function validateQuery(query) {
  const trimmedQuery = query.trim().toUpperCase();
  
  // Check if query starts with allowed operations
  const hasAllowedOperation = allowedOperations.some(op => trimmedQuery.startsWith(op));
  
  if (!hasAllowedOperation) {
    return { valid: false, message: 'Only SELECT, INSERT, UPDATE, DELETE, SHOW, DESCRIBE, and EXPLAIN operations are allowed' };
  }

  // Prevent dangerous operations
  const dangerousPatterns = [
    /DROP\s+(TABLE|DATABASE|INDEX)/i,
    /TRUNCATE\s+TABLE/i,
    /ALTER\s+TABLE/i,
    /CREATE\s+(TABLE|DATABASE|INDEX)/i,
    /GRANT/i,
    /REVOKE/i,
    /FLUSH/i,
    /KILL/i,
    /SHUTDOWN/i,
    /LOAD_FILE/i,
    /INTO\s+OUTFILE/i,
    /INTO\s+DUMPFILE/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return { valid: false, message: 'Dangerous SQL operations are not allowed' };
    }
  }

  // Limit query length
  if (query.length > 10000) {
    return { valid: false, message: 'Query too long (maximum 10000 characters)' };
  }

  return { valid: true };
}

// Execute SQL query endpoint
router.post('/execute', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // Validate the query
    const validation = validateQuery(query);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.message
      });
    }

    const connection = await pool.getConnection();
    
    try {
      // Execute the query
      const [rows] = await connection.execute(query);
      
      // Format the response based on query type
      let result;
      
      if (Array.isArray(rows)) {
        // SELECT query
        result = {
          type: 'SELECT',
          columns: rows.length > 0 ? Object.keys(rows[0]) : [],
          rows: rows.map(row => Object.values(row)),
          rowCount: rows.length
        };
      } else if (typeof rows === 'object' && rows !== null) {
        // INSERT, UPDATE, DELETE query
        if (rows.affectedRows !== undefined) {
          result = {
            type: query.trim().split(' ')[0].toUpperCase(),
            affectedRows: rows.affectedRows,
            insertId: rows.insertId || null
          };
        } else {
          // Other operations (SHOW, DESCRIBE, etc.)
          result = {
            type: 'INFO',
            data: rows
          };
        }
      } else {
        result = {
          type: 'UNKNOWN',
          data: rows
        };
      }

      res.json({
        success: true,
        result: result,
        timestamp: new Date().toISOString()
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('SQL execution error:', error);
    
    // Don't expose internal database errors to client
    res.status(500).json({
      success: false,
      error: 'Query execution failed',
      details: error.code || 'Database error'
    });
  }
});

// Get table schema endpoint
router.get('/schema/:table', async (req, res) => {
  try {
    const { table } = req.params;
    
    // Validate table name
    const validTables = ['employees', 'items', 'requests'];
    if (!validTables.includes(table)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid table name'
      });
    }

    const connection = await pool.getConnection();
    
    try {
      // Get table structure
      const [columns] = await connection.execute(`DESCRIBE ${table}`);
      
      const schema = columns.map(col => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      }));

      res.json({
        success: true,
        table: table,
        schema: schema
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Schema retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve table schema'
    });
  }
});

// Get all tables endpoint
router.get('/tables', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    try {
      const [tables] = await connection.execute('SHOW TABLES');
      
      // Extract table names from the result
      const tableNames = tables.map(table => {
        const keys = Object.keys(table);
        return table[keys[0]];
      });

      res.json({
        success: true,
        tables: tableNames
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Tables retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tables'
    });
  }
});

// Get sample queries endpoint
router.get('/sample-queries', (req, res) => {
  const sampleQueries = [
    {
      name: 'View All Employees',
      query: 'SELECT * FROM employees ORDER BY name ASC;'
    },
    {
      name: 'View All Items',
      query: 'SELECT * FROM items ORDER BY model ASC;'
    },
    {
      name: 'View All Requests',
      query: 'SELECT * FROM requests ORDER BY date_added DESC;'
    },
    {
      name: 'Low Stock Items',
      query: 'SELECT model, brand, category, quantity FROM items WHERE quantity < 5 ORDER BY quantity ASC;'
    },
    {
      name: 'Pending Requests',
      query: 'SELECT employee_name, item_name, quantity, date_added FROM requests WHERE status = "Pending" ORDER BY date_added ASC;'
    },
    {
      name: 'Approved Requests Count',
      query: 'SELECT COUNT(*) as approved_count FROM requests WHERE status = "Approved";'
    },
    {
      name: 'Items by Category',
      query: 'SELECT category, COUNT(*) as item_count, SUM(quantity) as total_quantity FROM items GROUP BY category ORDER BY item_count DESC;'
    },
    {
      name: 'Recent Activity',
      query: 'SELECT "Employee" as type, name as entity, date_created as date FROM employees UNION SELECT "Item" as type, model as entity, date_added as date FROM items UNION SELECT "Request" as type, CONCAT(employee_name, " - ", item_name) as entity, date_added as date FROM requests ORDER BY date DESC LIMIT 20;'
    },
    {
      name: 'Items with Zero Stock',
      query: 'SELECT model, brand, category FROM items WHERE quantity = 0;'
    },
    {
      name: 'Most Requested Items',
      query: 'SELECT item_name, COUNT(*) as request_count, SUM(quantity) as total_quantity FROM requests GROUP BY item_name ORDER BY request_count DESC LIMIT 10;'
    }
  ];

  res.json({
    success: true,
    queries: sampleQueries
  });
});

module.exports = router;