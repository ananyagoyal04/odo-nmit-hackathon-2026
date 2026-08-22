const ApiError = require('../utils/apiError');
const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = ApiError.badRequest(message);
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ');
    const message = `Duplicate value entered for ${fields}. Must be unique.`;
    error = ApiError.conflict(message, err.keyValue);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((val) => ({
      path: val.path,
      message: val.message
    }));
    const message = details.map((d) => d.message).join(', ');
    error = ApiError.badRequest(message, details);
  }

  // Handle SyntaxError in JSON body parsing
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = ApiError.badRequest('Malformed JSON in request body');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const details = error.details || null;

  if (statusCode === 500 && NODE_ENV !== 'test') {
    console.error('[Error Details]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
