const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const router = express.Router();

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, department, position, employee_id, date_created FROM employees ORDER BY date_created DESC'
    );
    
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, department, position, employee_id, date_created FROM employees WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/employees
// @desc    Register new employee
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, department, position, employeeId, password } = req.body;

    // Validate required fields
    if (!name || !department || !position || !employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, department, position, employee ID, and password'
      });
    }

    // Check if employee ID already exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.execute(
      'INSERT INTO employees (name, department, position, employee_id, password) VALUES (?, ?, ?, ?, ?)',
      [name, department, position, employeeId, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        id: result.insertId,
        name,
        department,
        position,
        employeeId,
        date_created: new Date()
      }
    });

  } catch (error) {
    console.error('Register employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { name, department, position, employeeId, password } = req.body;

    // Check if employee exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM employees WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if employee ID is being changed and if it already exists
    if (employeeId && employeeId !== existingRows[0].employee_id) {
      const [duplicateRows] = await pool.execute(
        'SELECT * FROM employees WHERE employee_id = ? AND id != ?',
        [employeeId, req.params.id]
      );

      if (duplicateRows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Hash password if provided
    let hashedPassword = existingRows[0].password;
    if (password) {
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const [result] = await pool.execute(
      'UPDATE employees SET name = ?, department = ?, position = ?, employee_id = ?, password = ?, updated_at = NOW() WHERE id = ?',
      [name || existingRows[0].name, department || existingRows[0].department, position || existingRows[0].position, employeeId || existingRows[0].employee_id, hashedPassword, req.params.id]
    );

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        id: req.params.id,
        name: name || existingRows[0].name,
        department: department || existingRows[0].department,
        position: position || existingRows[0].position,
        employeeId: employeeId || existingRows[0].employee_id
      }
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Check if employee exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM employees WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Prevent deletion of the employee themselves (you might want to add authentication for this)
    // For now, we'll allow deletion but you should add proper authorization

    await pool.execute(
      'DELETE FROM employees WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/employees/search
// @desc    Search employees by name or department
// @access  Private
router.get('/search', async (req, res) => {
  try {
    const { q, department } = req.query;

    let query = 'SELECT id, name, department, position, employee_id, date_created FROM employees';
    let queryParams = [];
    let whereConditions = [];

    if (q) {
      whereConditions.push('(name LIKE ? OR employee_id LIKE ?)');
      queryParams.push(`%${q}%`, `%${q}%`);
    }

    if (department) {
      whereConditions.push('department = ?');
      queryParams.push(department);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY date_created DESC';

    const [rows] = await pool.execute(query, queryParams);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;