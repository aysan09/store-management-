const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

// @route   GET /api/requests
// @desc    Get all requests (from all status tables)
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Get requests from all status tables
    const [pendingRows] = await pool.execute(
      'SELECT *, "Pending" as status FROM pending_requests ORDER BY date_added DESC'
    );
    const [approvedRows] = await pool.execute(
      'SELECT *, "Approved" as status FROM approved_requests ORDER BY date_added DESC'
    );
    const [finishedRows] = await pool.execute(
      'SELECT *, "Finished" as status FROM finished_requests ORDER BY date_added DESC'
    );

    // Combine all requests
    const allRequests = [...pendingRows, ...approvedRows, ...finishedRows];

    // Sort by date_added descending
    allRequests.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));

    res.json({
      success: true,
      count: allRequests.length,
      data: allRequests
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
    const { employeeName, itemName, quantity, purpose } = req.body;

    console.log('Request body:', req.body);
    console.log('Parsed values:', { employeeName, itemName, quantity, purpose });

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

    console.log('Executing SQL query...');
    const [result] = await pool.execute(
      'INSERT INTO requests (employee_name, item_name, quantity, status) VALUES (?, ?, ?, ?)',
      [employeeName, itemName, parseInt(quantity), 'Pending']
    );

    console.log('SQL result:', result);

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
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
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
// @desc    Get requests by status (from specific status tables)
// @access  Private
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Finished'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Approved, or Finished'
      });
    }

    let query = '';
    let tableName = '';

    switch (status) {
      case 'Pending':
        query = 'SELECT *, "Pending" as status FROM pending_requests ORDER BY date_added DESC';
        tableName = 'pending_requests';
        break;
      case 'Approved':
        query = 'SELECT *, "Approved" as status FROM approved_requests ORDER BY date_added DESC';
        tableName = 'approved_requests';
        break;
      case 'Finished':
        query = 'SELECT *, "Finished" as status FROM finished_requests ORDER BY date_added DESC';
        tableName = 'finished_requests';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
    }

    const [rows] = await pool.execute(query);

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

// @route   POST /api/requests/pending
// @desc    Add new pending request
// @access  Private
router.post('/pending', async (req, res) => {
  try {
    const { employeeName, itemName, quantity, purpose } = req.body;

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
      'INSERT INTO pending_requests (employee_name, item_name, quantity, purpose) VALUES (?, ?, ?, ?)',
      [employeeName, itemName, parseInt(quantity), purpose || null]
    );

    res.status(201).json({
      success: true,
      message: 'Pending request submitted successfully',
      data: {
        id: result.insertId,
        employeeName,
        itemName,
        quantity: parseInt(quantity),
        purpose: purpose || null,
        status: 'Pending',
        date_added: new Date()
      }
    });

  } catch (error) {
    console.error('Add pending request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/requests/pending/:id/approve
// @desc    Move pending request to approved
// @access  Private
router.put('/pending/:id/approve', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Get the pending request
    const [pendingRows] = await pool.execute(
      'SELECT * FROM pending_requests WHERE id = ?',
      [requestId]
    );

    if (pendingRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pending request not found'
      });
    }

    const request = pendingRows[0];

    // Move to approved_requests table
    const [approvedResult] = await pool.execute(
      'INSERT INTO approved_requests (employee_name, item_name, quantity, purpose, date_added, date_approved) VALUES (?, ?, ?, ?, ?, NOW())',
      [request.employee_name, request.item_name, request.quantity, request.purpose, request.date_added]
    );

    // Delete from pending_requests table
    await pool.execute(
      'DELETE FROM pending_requests WHERE id = ?',
      [requestId]
    );

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: {
        id: approvedResult.insertId,
        employeeName: request.employee_name,
        itemName: request.item_name,
        quantity: request.quantity,
        purpose: request.purpose,
        status: 'Approved',
        date_added: request.date_added,
        date_approved: new Date()
      }
    });

  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/requests/approved/:id/finish
// @desc    Move approved request to finished
// @access  Private
router.put('/approved/:id/finish', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Get the approved request
    const [approvedRows] = await pool.execute(
      'SELECT * FROM approved_requests WHERE id = ?',
      [requestId]
    );

    if (approvedRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Approved request not found'
      });
    }

    const request = approvedRows[0];

    // Move to finished_requests table
    const [finishedResult] = await pool.execute(
      'INSERT INTO finished_requests (employee_name, item_name, quantity, purpose, date_added, date_approved, date_finished) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [request.employee_name, request.item_name, request.quantity, request.purpose, request.date_added, request.date_approved]
    );

    // Delete from approved_requests table
    await pool.execute(
      'DELETE FROM approved_requests WHERE id = ?',
      [requestId]
    );

    res.json({
      success: true,
      message: 'Request finished successfully',
      data: {
        id: finishedResult.insertId,
        employeeName: request.employee_name,
        itemName: request.item_name,
        quantity: request.quantity,
        purpose: request.purpose,
        status: 'Finished',
        date_added: request.date_added,
        date_approved: request.date_approved,
        date_finished: new Date()
      }
    });

  } catch (error) {
    console.error('Finish request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/requests/pending/:id
// @desc    Delete pending request
// @access  Private
router.delete('/pending/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if request exists
    const [rows] = await pool.execute(
      'SELECT * FROM pending_requests WHERE id = ?',
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pending request not found'
      });
    }

    await pool.execute(
      'DELETE FROM pending_requests WHERE id = ?',
      [requestId]
    );

    res.json({
      success: true,
      message: 'Pending request deleted successfully'
    });

  } catch (error) {
    console.error('Delete pending request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/requests/approved/:id
// @desc    Delete approved request
// @access  Private
router.delete('/approved/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if request exists
    const [rows] = await pool.execute(
      'SELECT * FROM approved_requests WHERE id = ?',
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Approved request not found'
      });
    }

    await pool.execute(
      'DELETE FROM approved_requests WHERE id = ?',
      [requestId]
    );

    res.json({
      success: true,
      message: 'Approved request deleted successfully'
    });

  } catch (error) {
    console.error('Delete approved request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/requests/finished/:id
// @desc    Delete finished request
// @access  Private
router.delete('/finished/:id', async (req, res) => {
  try {
    const requestId = req.params.id;

    // Check if request exists
    const [rows] = await pool.execute(
      'SELECT * FROM finished_requests WHERE id = ?',
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Finished request not found'
      });
    }

    await pool.execute(
      'DELETE FROM finished_requests WHERE id = ?',
      [requestId]
    );

    res.json({
      success: true,
      message: 'Finished request deleted successfully'
    });

  } catch (error) {
    console.error('Delete finished request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
