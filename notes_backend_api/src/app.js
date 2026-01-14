const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

const { getConfig } = require('./config');
const { AppError } = require('./errors');
const { ensureSchema } = require('./db/migrate');

const config = getConfig();

// Initialize express app
const app = express();

// Ensure DB schema exists (idempotent). Errors will surface early during startup.
ensureSchema().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Schema initialization failed:', err);
});

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.set('trust proxy', true);

// Swagger UI
app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host'); // may or may not include port
  let protocol = req.protocol; // http or https

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');

  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
      (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerSpec,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Parse cookies for cookie-based auth
app.use(cookieParser());

// Mount routes
app.use('/', routes);

// Error handling middleware (consistent envelope)
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);

  // Default
  let httpStatus = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal Server Error';
  let details = undefined;

  if (err instanceof AppError) {
    httpStatus = err.httpStatus;
    code = err.code;
    message = err.message;
    details = err.details;
  }

  // Do not leak internal details in production.
  if (config.isProduction) {
    details = undefined;
  }

  return res.status(httpStatus).json({
    status: 'error',
    code,
    message,
    ...(details ? { details } : {}),
  });
});

module.exports = app;
