const { ZodError } = require('zod');
const { ValidationError } = require('../errors');

/**
 * PUBLIC_INTERFACE
 * Validates req.body/req.params/req.query using provided Zod schemas.
 *
 * @param {{ body?: import('zod').ZodSchema, params?: import('zod').ZodSchema, query?: import('zod').ZodSchema }} schemas
 */
function validate(schemas) {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(new ValidationError('Request validation failed', { issues: err.issues }));
      }
      return next(err);
    }
  };
}

module.exports = {
  // PUBLIC_INTERFACE
  validate,
};
