const express = require('express');
const { db } = require('../config/db');
const { validateRequest, validateId } = require('../middleware/validation');
const ExcelJS = require('exceljs');

const router = express.Router();

// @route   GET /api/requests
// @desc    Get all requests with pagination and filtering
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'date_added';
    const sortOrder = req.query.sortOrder || 'DESC';

    // Build WHERE clause
    let whereClause = '';
    const params = [];

    if (status) {
      whereClause += 'WHERE status = ? ';
      params.push(status);
    }

    // Build ORDER BY clause
    const validSortFields = ['date_added', 'date_approved', 'date_finished', 'status'];
    const validSortOrders = ['ASC', 'DESC'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'date_added';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get total count
    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total FROM requests ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Get requests with pagination
    const [rows] = await db.execute(
      `SELECT 
        r.id,
        r.employee_name AS employeeName,
        r.item_name AS itemName,
        r.item_brand AS itemBrand,
        r.quantity,
        r.purpose,
        r.status,
        r.date_added AS dateAdded,
        r.date_approved AS dateApproved,
        r.date_finished AS dateFinished,
        r.updated_at AS updatedAt
      FROM requests r
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        requests: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve requests',
        code: 'GET_REQUESTS_ERROR',
        statusCode: 500
      }
    });
  }
});

// @route   GET /api/requests/status/:status
// @desc    Get requests by status with pagination
// @access  Private
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Validate status
    const validStatuses = ['pending', 'approved', 'finished', 'rejected'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid status. Must be pending, approved, finished, or rejected',
          code: 'INVALID_STATUS',
          statusCode: 400
        }
      });
    }

    // Get total count
    const [countRows] = await db.execute(
      'SELECT COUNT(*) as total FROM requests WHERE status = ?',
      [status.toLowerCase()]
    );
    const total = countRows[0].total;

    // Get requests with pagination
    const [rows] = await db.execute(
      `SELECT 
        r.id,
        r.employee_name AS employeeName,
        r.item_name AS itemName,
        r.item_brand AS itemBrand,
        r.quantity,
        r.purpose,
        r.status,
        r.date_added AS dateAdded,
        r.date_approved AS dateApproved,
        r.date_finished AS dateFinished,
        r.updated_at AS updatedAt
      FROM requests r
      WHERE r.status = ?
      ORDER BY r.date_added DESC
      LIMIT ? OFFSET ?`,
      [status.toLowerCase(), limit, offset]
    );

    res.json({
      success: true,
      data: {
        requests: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get requests by status error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve requests by status',
        code: 'GET_REQUESTS_BY_STATUS_ERROR',
        statusCode: 500
      }
    });
  }
});

// @route   POST /api/requests
// @desc    Add new request with validation
// @access  Private
router.post('/', validateRequest, async (req, res) => {
  let connection;
  try {
    const { employee_id, item_id, quantity, purpose, priority, notes } = req.body;

    // Get database connection for transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if employee exists
    const [employeeRows] = await connection.execute(
      'SELECT id, name FROM employees WHERE id = ?',
      [employee_id]
    );

    if (employeeRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: {
          message: 'Employee not found',
          code: 'EMPLOYEE_NOT_FOUND',
          statusCode: 404
        }
      });
    }

    // Check if item exists and has sufficient quantity
    const [itemRows] = await connection.execute(
      'SELECT id, model, brand, quantity FROM items WHERE id = ?',
      [item_id]
    );

    if (itemRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found',
          code: 'ITEM_NOT_FOUND',
          statusCode: 404
        }
      });
    }

    const item = itemRows[0];
    if (item.quantity < quantity) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`,
          code: 'INSUFFICIENT_STOCK',
          statusCode: 400
        }
      });
    }

    // Get employee and item names for the request table
    const employeeName = employeeRows[0].name;
    const itemName = item.model;
    const itemBrand = item.brand;

    // Insert request using the actual database schema
    const [result] = await connection.execute(
      `INSERT INTO requests (
        employee_name, item_name, item_brand, quantity, purpose, status
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeName, itemName, itemBrand, quantity, purpose || null, 'Pending']
    );

    // Update item quantity (reserve stock)
    await connection.execute(
      'UPDATE items SET quantity = quantity - ? WHERE id = ?',
      [quantity, item_id]
    );

    await connection.commit();

    // Get the created request
    const [createdRequestRows] = await db.execute(
      `SELECT 
        r.id,
        r.employee_name AS employeeName,
        r.item_name AS itemName,
        r.item_brand AS itemBrand,
        r.quantity,
        r.purpose,
        r.status,
        r.date_added AS dateAdded,
        r.updated_at AS updatedAt
      FROM requests r
      WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: createdRequestRows[0]
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Add request error:', error);

    // Handle specific MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Request already exists',
          code: 'DUPLICATE_REQUEST',
          statusCode: 409
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create request',
        code: 'CREATE_REQUEST_ERROR',
        statusCode: 500
      }
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// @route   PUT /api/requests/:id/approve
// @desc    Approve request with validation
// @access  Private
router.put('/:id/approve', validateId('id'), async (req, res) => {
  let connection;
  try {
    const requestId = req.params.id;

    // Get database connection for transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Get the request with FOR UPDATE to prevent race conditions
    const [requestRows] = await connection.execute(
      `SELECT r.*, r.employee_name AS employeeName, r.item_name AS itemName, r.item_brand AS itemBrand
       FROM requests r
       WHERE r.id = ? FOR UPDATE`,
      [requestId]
    );

    if (requestRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: {
          message: 'Request not found',
          code: 'REQUEST_NOT_FOUND',
          statusCode: 404
        }
      });
    }

    const request = requestRows[0];

    // Check if already approved or finished
    if (request.status === 'approved' || request.status === 'finished') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: 'Request is already approved or finished',
          code: 'REQUEST_ALREADY_PROCESSED',
          statusCode: 400
        }
      });
    }

    // Update status to approved
    await connection.execute(
      `UPDATE requests 
       SET status = 'approved', 
           date_approved = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [requestId]
    );

    await connection.commit();

    // Get the updated request
    const [updatedRows] = await db.execute(
      `SELECT 
        r.id,
        r.employee_name AS employeeName,
        r.item_name AS itemName,
        r.item_brand AS itemBrand,
        r.quantity,
        r.purpose,
        r.status,
        r.date_added AS dateAdded,
        r.date_approved AS dateApproved,
        r.updated_at AS updatedAt
      FROM requests r
      WHERE r.id = ?`,
      [requestId]
    );

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: updatedRows[0]
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to approve request',
        code: 'APPROVE_REQUEST_ERROR',
        statusCode: 500
      }
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// @route   PUT /api/requests/:id/finish
// @desc    Finish request with validation and stock management
// @access  Private
router.put('/:id/finish', validateId('id'), async (req, res) => {
  let connection;
  try {
    const requestId = req.params.id;

    // Get database connection for transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Get the request with FOR UPDATE to prevent race conditions
    const [requestRows] = await connection.execute(
      `SELECT r.*, r.employee_name AS employeeName, r.item_name AS itemName, r.item_brand AS itemBrand
       FROM requests r
       WHERE r.id = ? FOR UPDATE`,
      [requestId]
    );

    if (requestRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: {
          message: 'Request not found',
          code: 'REQUEST_NOT_FOUND',
          statusCode: 404
        }
      });
    }

    const request = requestRows[0];

    // Check if already finished
    if (request.status === 'finished') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: 'Request is already finished',
          code: 'REQUEST_ALREADY_FINISHED',
          statusCode: 400
        }
      });
    }

    // This converts "Approved" to "approved" before checking
    if (request.status.toLowerCase() !== 'approved') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: `Status mismatch: Database has "${request.status}", but we need "approved".`,
          code: 'REQUEST_NOT_APPROVED',
          statusCode: 400
        }
      });
    }

    // Update request status to finished
    await connection.execute(
      `UPDATE requests 
       SET status = 'finished', 
           date_finished = NOW(),
           updated_at = NOW()
       WHERE id = ?`,
      [requestId]
    );

    // Deduct the quantity from inventory (item is being given to employee)
    // First, get the item_id from the items table using model and brand
    const [itemRows] = await connection.execute(
      'SELECT id FROM items WHERE model = ? AND brand = ?',
      [request.item_name, request.item_brand]
    );

    if (itemRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found in inventory',
          code: 'ITEM_NOT_FOUND_INVENTORY',
          statusCode: 404
        }
      });
    }

    const itemId = itemRows[0].id;

    // Now update the correct item's quantity
    await connection.execute(
      'UPDATE items SET quantity = quantity - ? WHERE id = ?',
      [request.quantity, itemId]
    );

    await connection.commit();

    // Get the updated request
    const [updatedRows] = await db.execute(
      `SELECT 
        r.id,
        r.employee_name AS employeeName,
        r.item_name AS itemName,
        r.item_brand AS itemBrand,
        r.quantity,
        r.purpose,
        r.status,
        r.date_added AS dateAdded,
        r.date_approved AS dateApproved,
        r.date_finished AS dateFinished,
        r.updated_at AS updatedAt
      FROM requests r
      WHERE r.id = ?`,
      [requestId]
    );

    res.json({
      success: true,
      message: 'Request finished successfully',
      data: updatedRows[0]
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Finish request error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to finish request',
        code: 'FINISH_REQUEST_ERROR',
        statusCode: 500
      }
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// @route   PUT /api/requests/:id/reject
// @desc    Reject request with validation
// @access  Private
router.put('/:id/reject', validateId('id'), async (req, res) => {
  let connection;
  try {
    const requestId = req.params.id;
    const rejectionReason = req.body.rejectionReason; // Reason for rejection

    // Get database connection for transaction
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Get the request with FOR UPDATE to prevent race conditions
    const [requestRows] = await connection.execute(
      `SELECT r.*, r.employee_name AS employeeName, r.item_name AS itemName, r.item_brand AS itemBrand
       FROM requests r
       WHERE r.id = ? FOR UPDATE`,
      [requestId]
    );

    if (requestRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: {
          message: 'Request not found',
          code: 'REQUEST_NOT_FOUND',
          statusCode: 404
        }
      });
    }

    const request = requestRows[0];

    // Check if already processed
    if (request.status === 'approved' || request.status === 'rejected' || request.status === 'finished') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: {
          message: 'Request has already been processed',
          code: 'REQUEST_ALREADY_PROCESSED',
          statusCode: 400
        }
      });
    }

    // Update status to rejected
    await connection.execute(
      `UPDATE requests 
       SET status = 'rejected', 
           updated_at = NOW()
       WHERE id = ?`,
      [requestId]
    );

    // Restore item quantity (release reserved stock)
    // First, get the item_id from the items table using model and brand
    const [itemRows] = await connection.execute(
      'SELECT id FROM items WHERE model = ? AND brand = ?',
      [request.item_name, request.item_brand]
    );

    if (itemRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: {
          message: 'Item not found in inventory',
          code: 'ITEM_NOT_FOUND_INVENTORY',
          statusCode: 404
        }
      });
    }

    const itemId = itemRows[0].id;

    // Now restore the correct item's quantity
    await connection.execute(
      'UPDATE items SET quantity = quantity + ? WHERE id = ?',
      [request.quantity, itemId]
    );

    await connection.commit();

    // Get the updated request
    const [updatedRows] = await db.execute(
      `SELECT 
        r.id,
        r.employee_name AS employeeName,
        r.item_name AS itemName,
        r.item_brand AS itemBrand,
        r.quantity,
        r.purpose,
        r.status,
        r.date_added AS dateAdded,
        r.date_approved AS dateApproved,
        r.date_finished AS dateFinished,
        r.updated_at AS updatedAt
      FROM requests r
      WHERE r.id = ?`,
      [requestId]
    );

    res.json({
      success: true,
      message: 'Request rejected successfully',
      data: updatedRows[0]
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reject request',
        code: 'REJECT_REQUEST_ERROR',
        statusCode: 500
      }
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// @route   GET /api/requests/export
// @desc    Export requests to Excel file
// @access  Private
router.get('/export', async (req, res) => {
  try {
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'date_added';
    const sortOrder = req.query.sortOrder || 'DESC';

    // Build WHERE clause
    let whereClause = '';
    const params = [];

    if (status) {
      whereClause += 'WHERE status = ? ';
      params.push(status);
    }

    // Build ORDER BY clause
    const validSortFields = ['date_added', 'date_approved', 'date_finished', 'status'];
    const validSortOrders = ['ASC', 'DESC'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'date_added';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get all requests (no pagination for export)
    const [rows] = await db.execute(
      `SELECT 
        r.id,
        r.employee_name AS employeeName,
        r.item_name AS itemName,
        r.item_brand AS itemBrand,
        r.quantity,
        r.purpose,
        r.status,
        r.date_added AS dateAdded,
        r.date_approved AS dateApproved,
        r.date_finished AS dateFinished,
        r.updated_at AS updatedAt
      FROM requests r
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}`,
      params
    );

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Requests');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Employee Name', key: 'employeeName', width: 20 },
      { header: 'Item Name', key: 'itemName', width: 20 },
      { header: 'Item Brand', key: 'itemBrand', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Purpose', key: 'purpose', width: 30 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date Added', key: 'dateAdded', width: 20 },
      { header: 'Date Approved', key: 'dateApproved', width: 20 },
      { header: 'Date Finished', key: 'dateFinished', width: 20 }
    ];

    // Add data rows
    rows.forEach(row => {
      worksheet.addRow({
        id: row.id,
        employeeName: row.employeeName,
        itemName: row.itemName,
        itemBrand: row.itemBrand,
        quantity: row.quantity,
        purpose: row.purpose || '',
        status: row.status,
        dateAdded: row.dateAdded ? new Date(row.dateAdded).toLocaleString() : '',
        dateApproved: row.dateApproved ? new Date(row.dateApproved).toLocaleString() : '',
        dateFinished: row.dateFinished ? new Date(row.dateFinished).toLocaleString() : ''
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF4E6' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Set content type and headers for file download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="requests_export_${new Date().toISOString().split('T')[0]}.xlsx"`
    );

    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Export requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to export requests',
        code: 'EXPORT_REQUESTS_ERROR',
        statusCode: 500
      }
    });
  }
});

// @route   GET /api/requests/stats
// @desc    Get request statistics
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    // Get request counts by status
    const [statusCounts] = await db.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM requests
      GROUP BY status
    `);

    // Get request counts by month
    const [monthlyCounts] = await db.execute(`
      SELECT 
        DATE_FORMAT(date_added, '%Y-%m') as month,
        COUNT(*) as count
      FROM requests
      GROUP BY DATE_FORMAT(date_added, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    // Get top requested items
    const [topItems] = await db.execute(`
      SELECT 
        item_name as itemName,
        item_brand as itemBrand,
        COUNT(*) as requestCount,
        SUM(quantity) as totalQuantity
      FROM requests
      GROUP BY item_name, item_brand
      ORDER BY requestCount DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        statusCounts: statusCounts,
        monthlyCounts: monthlyCounts,
        topItems: topItems
      }
    });

  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve request statistics',
        code: 'GET_REQUEST_STATS_ERROR',
        statusCode: 500
      }
    });
  }
});

module.exports = router;