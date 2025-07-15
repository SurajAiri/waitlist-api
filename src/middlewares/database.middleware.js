import mongoose from "mongoose";

// Error handling middleware for database connection issues
export const handleDatabaseErrors = (error, req, res, next) => {
  console.error('Database error:', error);

  // MongoDB connection errors
  if (error.name === 'MongoServerError' || error.name === 'MongoNetworkError') {
    return res.status(503).json({
      statusCode: 503,
      error: { message: 'Database temporarily unavailable' },
      message: 'Service temporarily unavailable'
    });
  }

  // MongoDB timeout errors
  if (error.name === 'MongoTimeoutError' || error.message.includes('buffering timed out')) {
    return res.status(504).json({
      statusCode: 504,
      error: { message: 'Database operation timed out' },
      message: 'Request timeout'
    });
  }

  // Mongoose validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      statusCode: 400,
      error: { message: 'Validation failed', details: error.message },
      message: 'Invalid data'
    });
  }

  // Default error
  next(error);
};

// Middleware to check database connection before each request
export const checkDatabaseConnection = async (req, res, next) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        statusCode: 503,
        error: { message: 'Database not available' },
        message: 'Service temporarily unavailable'
      });
    }
    next();
  } catch (error) {
    handleDatabaseErrors(error, req, res, next);
  }
};
