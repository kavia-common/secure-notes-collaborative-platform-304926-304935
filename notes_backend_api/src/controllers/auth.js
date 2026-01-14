const authService = require('../services/auth');
const { getConfig } = require('../config');

const config = getConfig();

class AuthController {
  /**
   * PUBLIC_INTERFACE
   * Register a new account.
   */
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return res.status(201).json({ status: 'ok', data: { user } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Login and set JWT cookie.
   */
  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);
      res.cookie(config.cookieName, token, config.cookieOptions);
      return res.status(200).json({ status: 'ok', data: { user } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Logout by clearing cookie.
   */
  async logout(_req, res, next) {
    try {
      // Clear cookie using same options (path, sameSite, secure).
      res.clearCookie(config.cookieName, config.cookieOptions);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new AuthController();
