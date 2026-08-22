const ApiError = require('../utils/apiError');

/**
 * Validates request payload against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed; // Replace with sanitized/coerced values
      next();
    } catch (err) {
      if (err.errors) {
        const errorDetails = err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message
        }));
        const message = errorDetails.map((e) => `${e.path}: ${e.message}`).join(', ') || 'Validation error';
        return next(ApiError.badRequest(message, errorDetails));
      }
      return next(ApiError.badRequest('Invalid request data', err));
    }
  };
};

module.exports = validate;
