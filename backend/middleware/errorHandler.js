/**
 * Global Error Handling Middleware
 * Intercepts errors and returns clean structured JSON instead of raw stack traces.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Caught]:', err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Failed';
    details = Object.values(err.errors).map((val) => val.message);
  }

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with invalid ID: ${err.value}`;
  }

  // Handle MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate field value entered: ${duplicateField} must be unique.`;
  }

  // Handle explicit status on error object
  if (err.status) {
    statusCode = err.status;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details && { details })
  });
};

module.exports = errorHandler;
