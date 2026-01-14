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

  const required = ['JWT_SECRET'];
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

  const backendUrl = process.env.BACKEND_URL || null;
  const frontendUrl = process.env.FRONTEND_URL || null;

  // Allowlist origins: prefer ALLOWED_ORIGINS (comma-separated), fall back to legacy CORS_ORIGIN.
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  const allowedHeaders = (process.env.ALLOWED_HEADERS || 'Content-Type,Authorization')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  const allowedMethods = (process.env.ALLOWED_METHODS || 'GET,POST,PUT,DELETE,PATCH,OPTIONS')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  // In preview, frontend/backend are served over https on different ports (cross-site).
  // Cookie-based auth across sites requires SameSite=None and Secure=true.
  const isHttps = (backendUrl && backendUrl.startsWith('https://')) || false;
  const shouldUseSecureCookies = isProduction || isHttps || String(process.env.COOKIE_SECURE || '').toLowerCase() === 'true';

  const sameSite =
    process.env.COOKIE_SAMESITE ||
    (shouldUseSecureCookies ? 'none' : 'lax');

  return {
    nodeEnv,
    isProduction,

    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT || 3001),

    // CORS configuration (dynamic; must be an explicit origin when credentials=true)
    allowedOrigins,
    allowedHeaders,
    allowedMethods,
    corsCredentials: true,
    corsMaxAge: Number(process.env.CORS_MAX_AGE || 0) || undefined,

    trustProxy: String(process.env.TRUST_PROXY || '').toLowerCase() === 'true',

    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',

    cookieName: process.env.COOKIE_NAME || 'access_token',
    cookieOptions: {
      httpOnly: true,
      // Express expects sameSite to be boolean|'lax'|'strict'|'none'
      sameSite: String(sameSite).toLowerCase(),
      secure: shouldUseSecureCookies,
      path: '/',
      // Optional but useful for previews (subdomain sharing). If unset, host-only cookies are used.
      ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    },

    databaseUrl: process.env.DATABASE_URL || null,
    pgssl: (process.env.PGSSL || '').toLowerCase() === 'true',
  };
}

module.exports = {
  // PUBLIC_INTERFACE
  getConfig,
};
