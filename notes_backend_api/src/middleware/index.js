const { requireAuth } = require('./auth');
const { validate } = require('./validate');

// This file exports middleware as the application grows.
module.exports = {
  requireAuth,
  validate,
};
