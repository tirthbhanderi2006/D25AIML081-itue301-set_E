/**
 * Custom request logger middleware
 * Logs [METHOD] [PATH] [TIMESTAMP] for every incoming HTTP request.
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${req.method}] [${req.originalUrl || req.url}] [${timestamp}]`);
  next();
};

module.exports = requestLogger;
