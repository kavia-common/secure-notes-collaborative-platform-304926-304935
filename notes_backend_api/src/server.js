const app = require('./app');
const { ensureSchema } = require('./db/migrate');

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

/**
 * PUBLIC_INTERFACE
 * Starts the HTTP server after performing minimal startup checks.
 *
 * - Runs DB schema initialization with a short timeout so previews don't hang indefinitely
 * - If DATABASE_URL is missing, schema initialization is skipped (API will still start, but persistence will fail)
 *
 * @returns {Promise<import('http').Server>}
 */
async function startServer() {
  // Only attempt schema init when DB is configured.
  if (process.env.DATABASE_URL) {
    const timeoutMs = Number(process.env.DB_INIT_TIMEOUT_MS || 5000);

    try {
      await Promise.race([
        ensureSchema(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`DB init timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Schema initialization failed:', err);
      // Continue starting the server so health/docs still load and logs are visible.
    }
  }

  const server = app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at http://${HOST}:${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  return server;
}

startServer();

module.exports = { startServer };
