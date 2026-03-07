/**
 * Enhanced Error Handler Middleware
 * - Sanitizes error messages (no stack traces in production)
 * - Structured JSON logging
 * - Proper HTTP status codes
 * - Request correlation IDs for debugging
 */

const errorHandler = (err, req, res, next) => {
  // Generate correlation ID for tracking
  const correlationId = req.id || `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log error with full details (internal only)
  const errorLog = {
    correlationId,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode: err.status || 500,
    message: err.message,
    error: err.name,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  console.error(JSON.stringify(errorLog));

  // Determine status code
  let statusCode = err.status || 500;
  if (err.code === '23505') statusCode = 409; // Unique constraint violation
  if (err.code === '23503') statusCode = 400; // Foreign key violation
  if (err.message?.includes('not found')) statusCode = 404;
  if (err.message?.includes('permission') || err.message?.includes('denied')) statusCode = 403;
  if (err.message?.includes('invalid') || err.message?.includes('validation')) statusCode = 400;

  // Sanitized response (safe for client)
  const response = {
    error: getClientMessage(err, statusCode),
    correlationId, // Client can report this for debugging
  };

  // Add validation details if available
  if (err.details && statusCode === 400) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};

/**
 * Get safe error message for client
 */
const getClientMessage = (err, statusCode) => {
  if (process.env.NODE_ENV === 'production') {
    // Generic messages in production
    const messages = {
      400: 'Invalid request',
      401: 'Authentication required',
      403: 'Access denied',
      404: 'Resource not found',
      409: 'Conflict (resource may already exist)',
      500: 'Internal server error',
    };
    return messages[statusCode] || 'An error occurred';
  }

  // Detailed messages in development
  return err.message || 'Internal server error';
};

/**
 * Request ID middleware (for correlation tracking)
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Structured JSON logger middleware
 */
const structuredLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify({
      type: 'request',
      correlationId: req.id,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    }));
  }

  // Log response
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      type: 'response',
      correlationId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    }));

    return originalJson(data);
  };

  next();
};

module.exports = {
  errorHandler,
  getClientMessage,
  requestIdMiddleware,
  structuredLogger,
};
