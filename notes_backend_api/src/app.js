const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

const { getConfig } = require('./config');
const { AppError } = require('./errors');

const config = getConfig();

// Initialize express app
const app = express();

/**
 * Build a safe CORS origin resolver.
 * - When credentials=true, origin cannot be '*'
 * - We allow only configured origins; otherwise we reject by returning false.
 */
function corsOriginDelegate(origin, callback) {
  // Non-browser or same-origin requests may not send Origin header; allow them.
  if (!origin) return callback(null, true);

  if (config.allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  return callback(null, false);
}

app.use(
  cors({
    origin: corsOriginDelegate,
    credentials: true,
    methods: config.allowedMethods,
    allowedHeaders: config.allowedHeaders,
    maxAge: config.corsMaxAge,
  })
);

app.set('trust proxy', config.trustProxy);

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
