const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Secure Notes API',
      version: '1.0.0',
      description:
        'Express API for authentication and secure CRUD of collections and notes. Uses JWT stored in HTTP-only cookies.',
    },
    tags: [
      { name: 'Health', description: 'Service health check' },
      { name: 'Auth', description: 'Authentication endpoints (cookie-based JWT)' },
      { name: 'Collections', description: 'Collections owned by the authenticated user' },
      { name: 'Notes', description: 'Notes owned by the authenticated user (ownership via collection)' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
          description: 'JWT access token stored in an HTTP-only cookie.',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
