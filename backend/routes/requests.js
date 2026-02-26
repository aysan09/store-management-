const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// @route   GET /api/requests
// @desc    Get all requests
// @access  Private
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM requests ORDER BY date_added DESC'
    );
    
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/requests/:id
// @desc    Get single request
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM requests WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/requests
// @desc    Add new request
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { employeeName, itemName, quantity } = req.body;

    // Validate required fields
    if (!employeeName || !itemName || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide employee name, item name, and quantity'
      });
    }

    // Validate quantity
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO requests (employee_name, item_name, quantity) VALUES (?, ?, ?)',
      [employeeName, itemName, parseInt(quantity)]
    );

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: {
        id: result.insertId,
        employeeName,
        itemName,
        quantity: parseInt(quantity),
        status: 'Pending',
        date_added: new Date()
      }
    });

  } catch (error) {
    console.error('Add request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/requests/:id/status
// @desc    Update request status
// @access  Private
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Finished'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Approved, Rejected, or Finished'
      });
    }

    // Check if request exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM requests WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Set appropriate date based on status
    let updateQuery = '';
    let queryParams = [];
    
    if (status === 'Approved') {
      updateQuery = 'UPDATE requests SET status = ?, date_approved = NOW(), updated_at = NOW() WHERE id = ?';
      queryParams = [status, req.params.id];
    } else if (status === 'Finished') {
      updateQuery = 'UPDATE requests SET status = ?, date_finished = NOW(), updated_at = NOW() WHERE id = ?';
      queryParams = [status, req.params.id];
    } else {
      updateQuery = 'UPDATE requests SET status = ?, updated_at = NOW() WHERE id = ?';
      queryParams = [status, req.params.id];
    }

    await pool.execute(updateQuery, queryParams);

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete request
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    // Check if request exists
    const [existingRows] = await pool.execute(
      'SELECT * FROM requests WHERE id = ?',
      [req.params.id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    await pool.execute(
      'DELETE FROM requests WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });

  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/requests/status/:status
// @desc    Get requests by status
// @access  Private
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Finished'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Approved, Rejected, or Finished'
      });
    }

    const [rows] = await pool.execute(
      'SELECT * FROM requests WHERE status = ? ORDER BY date_added DESC',
      [status]
    );

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Get requests by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;