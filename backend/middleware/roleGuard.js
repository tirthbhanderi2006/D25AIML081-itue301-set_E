/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to endpoints based on user roles: Customer, Fleet Manager, Admin.
 */
const roleGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.customer) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No user context found.'
      });
    }

    const userRole = req.customer.role || 'Customer';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] role. Current role: ${userRole}`
      });
    }

    next();
  };
};

module.exports = roleGuard;
