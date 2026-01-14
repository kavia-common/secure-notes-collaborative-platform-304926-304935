const express = require('express');
const healthController = require('../controllers/health');

const authRoutes = require('./auth');
const collectionRoutes = require('./collections');
const noteRoutes = require('./notes');

const router = express.Router();

// Health endpoint

/**
 * @swagger
 * /:
 *   get:
 *     tags: [Health]
 *     summary: Health endpoint
 *     responses:
 *       200:
 *         description: Service health check passed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/', healthController.check.bind(healthController));

// Feature routes
router.use('/auth', authRoutes);
router.use('/collections', collectionRoutes);
router.use('/notes', noteRoutes);

module.exports = router;
