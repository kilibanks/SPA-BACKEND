const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.statusCode || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`);

  // Known operational errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry — resource already exists',
    });
  }

  // Unhandled/unexpected errors
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};

module.exports = errorMiddleware;
