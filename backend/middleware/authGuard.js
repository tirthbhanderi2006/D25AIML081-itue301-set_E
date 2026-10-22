const jwt = require('jsonwebtoken');

/**
 * Authentication Guard Middleware
 * Validates the Bearer token from the Authorization header.
 * Returns HTTP 401 if token is missing or invalid.
 */
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Bearer token missing or malformed.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'driveeasy_super_secret_jwt_key_2026';
    const decoded = jwt.verify(token, secret);
    // Attach customer info to request object
    req.customer = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

module.exports = authGuard;
