const express = require('express');
const authController = require('../controllers/auth');
const { validate } = require('../middleware');
const { z } = require('zod');

const router = express.Router();

const authBodySchema = z.object({
  email: z.string().email().transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1),
});

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints (JWT stored in HTTP-only cookies)
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a user with a hashed password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: very-strong-password
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */
router.post('/register', validate({ body: authBodySchema }), authController.register.bind(authController));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: Verifies credentials and sets the access token cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in; access token cookie set
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate({ body: authBodySchema }), authController.login.bind(authController));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout
 *     description: Clears the access token cookie.
 *     responses:
 *       204:
 *         description: Logged out
 */
router.post('/logout', authController.logout.bind(authController));

module.exports = router;
