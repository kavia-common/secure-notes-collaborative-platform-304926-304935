const { Pool } = require('pg');
const { getConfig } = require('../config');

const config = getConfig();

/**
 * Lazily created pool singleton.
 * We keep it module-scoped to ensure reuse across imports.
 */
let pool = null;

/**
 * PUBLIC_INTERFACE
 * Returns a configured pg Pool instance.
 */
function getPool() {
  if (pool) return pool;

  if (!config.databaseUrl) {
    // eslint-disable-next-line no-console
    console.warn('DATABASE_URL is not set. Persistence operations will fail until configured.');
  }

  pool = new Pool({
    connectionString: config.databaseUrl || undefined,
    ssl: config.pgssl ? { rejectUnauthorized: false } : undefined,
  });

  pool.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Unexpected PG pool error', err);
  });

  return pool;
}

module.exports = {
  // PUBLIC_INTERFACE
  getPool,
};
