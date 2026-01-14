const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersRepo = require('../repositories/users');
const { getConfig } = require('../config');
const { ConflictError, InvalidCredentialsError, ValidationError } = require('../errors');

const config = getConfig();

class AuthService {
  /**
   * PUBLIC_INTERFACE
   * Registers a new user.
   * @param {{ email: string, password: string }} input
   */
  async register({ email, password }) {
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await usersRepo.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('Email already exists');
    }

    // Password requirements per docs: minimum 12 chars (simple baseline).
    if (String(password).length < 12) {
      throw new ValidationError('Password must be at least 12 characters long');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await usersRepo.create({ email: normalizedEmail, passwordHash });
    return { id: user.id, email: user.email };
  }

  /**
   * PUBLIC_INTERFACE
   * Validates credentials and returns signed JWT payload.
   * @param {{ email: string, password: string }} input
   */
  async login({ email, password }) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await usersRepo.findByEmail(normalizedEmail);
    if (!user) throw new InvalidCredentialsError();

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new InvalidCredentialsError();

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return { user: { id: user.id, email: user.email }, token };
  }

  /**
   * PUBLIC_INTERFACE
   * Returns the cookie clearing spec for logout.
   */
  logoutCookie() {
    return { name: config.cookieName, options: config.cookieOptions };
  }
}

module.exports = new AuthService();
