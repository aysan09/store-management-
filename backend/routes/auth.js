const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mockDb = require('../config/mockDb');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    // Validate input
    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee ID and password'
      });
    }

    // Check if employee exists
    const employee = mockDb.getEmployeeByEmployeeId(employeeId);

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT payload
    const payload = {
      employee: {
        id: employee.id,
        name: employee.name,
        department: employee.department,
        position: employee.position,
        employeeId: employee.employee_id
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          employee: {
            id: employee.id,
            name: employee.name,
            department: employee.department,
            position: employee.position,
            employeeId: employee.employee_id
          }
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Get user from mock database
    const employee = mockDb.getEmployeeById(decoded.employee.id);

    if (!employee) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    res.json({
      success: true,
      employee: employee
    });

  } catch (error) {
    console.error('Auth me error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;