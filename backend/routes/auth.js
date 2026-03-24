const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../config/db');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate employee and return employee data
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('Auth request received:', req.body);
    const { employee_id, password } = req.body;

    // Validate required fields
    if (!employee_id || !password) {
      console.log('Missing fields:', { employee_id, password });
      return res.status(400).json({
        success: false,
        message: 'Please provide employee ID and password'
      });
    }

    console.log('Looking for employee with ID:', employee_id);

    // Find employee by employee ID
    const [rows] = await db.execute(
      'SELECT id, name, department, position, employee_id, password, date_created FROM employees WHERE employee_id = ?',
      [employee_id]
    );

    const employee = rows[0];

    console.log('Employee lookup result:', employee ? 'Found' : 'Not found');

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid employee ID or password'
      });
    }

    console.log('Employee found, comparing password...');

    // Compare password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid employee ID or password'
      });
    }

    // Return employee data (excluding password)
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        id: employee.id,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        employee_id: employee.employee_id,
        date_created: employee.date_created
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;