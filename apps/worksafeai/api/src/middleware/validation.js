const { z } = require('zod');

/**
 * Extract a flat array of validation error details from a ZodError.
 * Handles both Zod v3 (error.errors) and Zod v4 (error.issues / error.errors)
 * where individual issue objects may have changed field names.
 */
const extractZodErrors = (error) => {
  // Zod v3: error.errors = ZodIssue[]
  // Zod v4: error.issues = ZodIssue[]  (error.errors is kept as alias but may differ)
  const issues = Array.isArray(error.issues) ? error.issues
    : Array.isArray(error.errors) ? error.errors
    : [];

  return issues.map(issue => ({
    field: Array.isArray(issue.path) && issue.path.length > 0
      ? issue.path.join('.')
      : 'unknown',
    message: issue.message || 'Invalid value',
  }));
};

// Middleware factory to validate request body against schema
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = extractZodErrors(error);
        if (process.env.NODE_ENV === 'development') {
          console.error('Validation error (body):', details);
        }
        return res.status(400).json({ error: 'Validation error', details });
      }
      console.error('Unexpected validation error:', error.message);
      return res.status(400).json({ error: 'Invalid request' });
    }
  };
};

// Middleware factory to validate query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details = extractZodErrors(error);
        return res.status(400).json({ error: 'Validation error', details });
      }
      res.status(400).json({ error: 'Invalid query parameters' });
    }
  };
};

module.exports = { validateBody, validateQuery };
