const jwt = require('jsonwebtoken');
const { getConfig } = require('../config');
const { AuthRequiredError, InvalidTokenError } = require('../errors');

const config = getConfig();

/**
 * PUBLIC_INTERFACE
 * Middleware that requires an authenticated user via JWT stored in an HTTP-only cookie.
 */
function requireAuth(req, _res, next) {
  const token = req.cookies ? req.cookies[config.cookieName] : null;
  if (!token) {
    return next(new AuthRequiredError());
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };
    return next();
  } catch (err) {
    return next(new InvalidTokenError('Invalid or expired token'));
  }
}

module.exports = {
  // PUBLIC_INTERFACE
  requireAuth,
};
