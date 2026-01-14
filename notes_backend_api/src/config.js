const dotenv = require('dotenv');

dotenv.config();

/**
 * PUBLIC_INTERFACE
 * Loads and validates environment configuration for the API.
 *
 * NOTE: Only environment variable NAMES are documented here. Values must be provided via runtime environment.
 */
function getConfig() {
  /** @type {string[]} */
  const missing = [];

  const required = ['JWT_SECRET', 'CORS_ORIGIN'];
  for (const key of required) {
    if (!process.env[key] || String(process.env[key]).trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    // Fail-fast during startup to avoid running a misconfigured auth system.
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    nodeEnv,
    isProduction,

    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT || 3001),

    corsOrigin: process.env.CORS_ORIGIN,
    // Cookie auth across origins requires credentials=true and a non-* origin.
    corsCredentials: true,

    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',

    cookieName: process.env.COOKIE_NAME || 'access_token',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction, // must be true when served over https in production
      path: '/',
    },

    databaseUrl: process.env.DATABASE_URL || null,
    pgssl: (process.env.PGSSL || '').toLowerCase() === 'true',
  };
}

module.exports = {
  // PUBLIC_INTERFACE
  getConfig,
};
