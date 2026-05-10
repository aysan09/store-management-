const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    message: err.message || 'Server Error',
    statusCode: err.statusCode || 500,
    code: err.code || 'INTERNAL_SERVER_ERROR'
  };

  // MySQL duplicate key error
  if (err.code === 'ER_DUP_ENTRY') {
    const field = err.message.match(/Duplicate entry '([^']+)'/)?.[1] || 'field';
    error.message = `Duplicate entry for ${field}. This record already exists.`;
    error.statusCode = 409;
    error.code = 'DUPLICATE_ENTRY';
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    error.message = 'Referenced record not found. Please check the related data.';
    error.statusCode = 400;
    error.code = 'FOREIGN_KEY_CONSTRAINT';
  }

  // MySQL check constraint error
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    error.message = 'Data validation failed. Please check the input values.';
    error.statusCode = 400;
    error.code = 'CHECK_CONSTRAINT_VIOLATION';
  }

  // MySQL connection error
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    error.message = 'Database connection failed. Please try again later.';
    error.statusCode = 503;
    error.code = 'DATABASE_CONNECTION_ERROR';
  }

  // MySQL timeout error
  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
    error.message = 'Request timed out. Please try again.';
    error.statusCode = 408;
    error.code = 'REQUEST_TIMEOUT';
  }

  // Validation errors (custom or from validation libraries)
  if (err.name === 'ValidationError' || err.code === 'VALIDATION_ERROR') {
    const validationErrors = err.errors || err.details || [];
    error.message = Array.isArray(validationErrors)
      ? validationErrors.map(e => e.message || e).join(', ')
      : error.message;
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
  }

  // Authentication errors
  if (err.name === 'UnauthorizedError' || err.code === 'UNAUTHORIZED') {
    error.message = 'Authentication failed. Please log in again.';
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
  }

  // Authorization errors
  if (err.code === 'FORBIDDEN' || err.message.includes('permission')) {
    error.message = 'You do not have permission to perform this action.';
    error.statusCode = 403;
    error.code = 'FORBIDDEN';
  }

  // Not found errors
  if (err.code === 'NOT_FOUND' || err.statusCode === 404) {
    error.message = 'The requested resource was not found.';
    error.statusCode = 404;
    error.code = 'NOT_FOUND';
  }

  // Request too large
  if (err.code === 'ENTITY_TOO_LARGE' || err.message.includes('too large')) {
    error.message = 'Request payload too large. Please reduce the file size or data.';
    error.statusCode = 413;
    error.code = 'PAYLOAD_TOO_LARGE';
  }

  // Rate limiting
  if (err.code === 'TOO_MANY_REQUESTS' || err.message.includes('rate limit')) {
    error.message = 'Too many requests. Please wait before trying again.';
    error.statusCode = 429;
    error.code = 'TOO_MANY_REQUESTS';
  }

  // Handle specific MySQL errors
  if (err.errno) {
    switch (err.errno) {
      case 1062: // ER_DUP_ENTRY
        error.message = 'Duplicate entry. This record already exists.';
        error.statusCode = 409;
        error.code = 'DUPLICATE_ENTRY';
        break;
      case 1452: // ER_NO_REFERENCED_ROW_2
        error.message = 'Referenced record not found. Please check the related data.';
        error.statusCode = 400;
        error.code = 'FOREIGN_KEY_CONSTRAINT';
        break;
      case 1264: // ER_WARN_DATA_OUT_OF_RANGE
      case 1265: // ER_WARN_DATA_TRUNCATED
        error.message = 'Data validation failed. Please check the input values.';
        error.statusCode = 400;
        error.code = 'DATA_VALIDATION_ERROR';
        break;
      case 1045: // ER_ACCESS_DENIED_ERROR
        error.message = 'Database access denied. Please check your credentials.';
        error.statusCode = 503;
        error.code = 'DATABASE_ACCESS_ERROR';
        break;
      case 2006: // CR_SERVER_GONE_ERROR
      case 2013: // CR_SERVER_LOST
        error.message = 'Database connection lost. Please try again.';
        error.statusCode = 503;
        error.code = 'DATABASE_CONNECTION_LOST';
        break;
    }
  }

  // Production vs Development error response
  const isDevelopment = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  };

  // Include stack trace only in development
  if (isDevelopment) {
    response.error.stack = err.stack;
  }

  // Log critical errors for monitoring
  if (error.statusCode >= 500) {
    console.error('CRITICAL ERROR:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
