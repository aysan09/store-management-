const { body, validationResult } = require('express-validator');

// Validation middleware to check for validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value
        }));

        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                statusCode: 400,
                details: errorMessages
            }
        });
    }

    next();
};

// Employee validation rules
const validateEmployee = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 255 })
        .withMessage('Name must be between 2 and 255 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

    body('department_id')
        .isInt({ min: 1 })
        .withMessage('Department ID must be a positive integer'),

    body('position_id')
        .isInt({ min: 1 })
        .withMessage('Position ID must be a positive integer'),

    body('employee_id')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Employee ID must be between 3 and 50 characters')
        .matches(/^[A-Za-z0-9\-_]+$/)
        .withMessage('Employee ID can only contain letters, numbers, hyphens, and underscores'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'suspended'])
        .withMessage('Status must be active, inactive, or suspended'),

    validate
];

// Item validation rules
const validateItem = [
    body('model')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Model name is required and must be less than 255 characters'),

    body('brand')
        .trim()
        .isLength({ min: 1, max: 255 })
        .withMessage('Brand name is required and must be less than 255 characters'),

    body('category_id')
        .isInt({ min: 1 })
        .withMessage('Category ID must be a positive integer'),

    body('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a non-negative integer'),

    body('min_stock_level')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum stock level must be a non-negative integer'),

    body('max_stock_level')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Maximum stock level must be a positive integer'),

    body('reorder_point')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Reorder point must be a non-negative integer'),

    body('unit_price')
        .optional()
        .isDecimal({ force_decimal: false, decimal_digits: '0,2' })
        .withMessage('Unit price must be a valid decimal number with up to 2 decimal places'),

    body('supplier')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Supplier name must be less than 255 characters'),

    validate
];

// Request validation rules
const validateRequest = [
    body('employee_id')
        .isInt({ min: 1 })
        .withMessage('Employee ID must be a positive integer'),

    body('item_id')
        .isInt({ min: 1 })
        .withMessage('Item ID must be a positive integer'),

    body('quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),

    body('purpose')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Purpose must be less than 1000 characters'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must be less than 500 characters'),

    validate
];

// Department validation rules
const validateDepartment = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s&]+$/)
        .withMessage('Department name can only contain letters, spaces, and ampersands'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),

    validate
];

// Position validation rules
const validatePosition = [
    body('title')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Position title must be between 2 and 100 characters'),

    body('department_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Department ID must be a positive integer'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),

    validate
];

// Category validation rules
const validateCategory = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),

    validate
];

// ID parameter validation
const validateId = (paramName = 'id') => [
    (req, res, next) => {
        const id = req.params[paramName];

        if (!id || isNaN(id) || parseInt(id) <= 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: `${paramName} must be a positive integer`,
                    code: 'INVALID_ID',
                    statusCode: 400
                }
            });
        }

        req.params[paramName] = parseInt(id);
        next();
    }
];

// Query parameter validation for pagination
const validatePagination = [
    (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;

        if (page < 1 || limit < 1 || limit > 100 || offset < 0) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid pagination parameters',
                    code: 'INVALID_PAGINATION',
                    statusCode: 400,
                    details: {
                        page: 'Page must be a positive integer',
                        limit: 'Limit must be between 1 and 100',
                        offset: 'Offset must be a non-negative integer'
                    }
                }
            });
        }

        req.query.page = page;
        req.query.limit = limit;
        req.query.offset = offset;
        next();
    }
];

// Search parameter validation
const validateSearch = [
    (req, res, next) => {
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'created_at';
        const sortOrder = req.query.sortOrder || 'desc';

        if (search && (typeof search !== 'string' || search.trim().length < 2)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Search query must be at least 2 characters long',
                    code: 'INVALID_SEARCH',
                    statusCode: 400
                }
            });
        }

        const validSortFields = ['name', 'created_at', 'updated_at', 'status'];
        const validSortOrders = ['asc', 'desc'];

        if (!validSortFields.includes(sortBy)) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid sort field',
                    code: 'INVALID_SORT',
                    statusCode: 400,
                    details: {
                        sortBy: `Valid fields: ${validSortFields.join(', ')}`,
                        sortOrder: 'Valid orders: asc, desc'
                    }
                }
            });
        }

        if (!validSortOrders.includes(sortOrder.toLowerCase())) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid sort order',
                    code: 'INVALID_SORT',
                    statusCode: 400,
                    details: {
                        sortOrder: 'Valid orders: asc, desc'
                    }
                }
            });
        }

        req.query.search = search ? search.trim() : null;
        req.query.sortBy = sortBy;
        req.query.sortOrder = sortOrder.toLowerCase();
        next();
    }
];

// File upload validation
const validateFileUpload = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'No file uploaded',
                code: 'NO_FILE_UPLOADED',
                statusCode: 400
            }
        });
    }

    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed',
                code: 'INVALID_FILE_TYPE',
                statusCode: 400
            }
        });
    }

    if (req.file.size > maxFileSize) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'File too large. Maximum file size is 5MB',
                code: 'FILE_TOO_LARGE',
                statusCode: 400
            }
        });
    }

    // Check file extension
    const fileExtension = '.' + req.file.originalname.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Invalid file extension',
                code: 'INVALID_FILE_EXTENSION',
                statusCode: 400
            }
        });
    }

    next();
};

module.exports = {
    validate,
    validateEmployee,
    validateItem,
    validateRequest,
    validateDepartment,
    validatePosition,
    validateCategory,
    validateId,
    validatePagination,
    validateSearch,
    validateFileUpload
};