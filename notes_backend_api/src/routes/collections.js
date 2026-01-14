const express = require('express');
const collectionsController = require('../controllers/collections');
const notesController = require('../controllers/notes');
const { requireAuth, validate } = require('../middleware');
const { z } = require('zod');

const router = express.Router();

const uuidParam = z.object({
  collectionId: z.string().uuid(),
});

const createCollectionBody = z.object({
  name: z.string().trim().min(1).max(200),
});

const createNoteBody = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(200000).default(''),
});

/**
 * @swagger
 * tags:
 *   - name: Collections
 *     description: Collections (folders) owned by the authenticated user
 */

/**
 * @swagger
 * /collections:
 *   get:
 *     tags: [Collections]
 *     summary: List collections
 *     description: Returns collections owned by the authenticated user.
 *     responses:
 *       200:
 *         description: Collections list
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireAuth, collectionsController.list.bind(collectionsController));

/**
 * @swagger
 * /collections:
 *   post:
 *     tags: [Collections]
 *     summary: Create collection
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Work
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', requireAuth, validate({ body: createCollectionBody }), collectionsController.create.bind(collectionsController));

/**
 * @swagger
 * /collections/{collectionId}:
 *   get:
 *     tags: [Collections]
 *     summary: Get collection
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Collection
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:collectionId', requireAuth, validate({ params: uuidParam }), collectionsController.get.bind(collectionsController));

/**
 * @swagger
 * /collections/{collectionId}:
 *   put:
 *     tags: [Collections]
 *     summary: Update collection
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put('/:collectionId', requireAuth, validate({ params: uuidParam, body: createCollectionBody }), collectionsController.update.bind(collectionsController));

/**
 * @swagger
 * /collections/{collectionId}:
 *   delete:
 *     tags: [Collections]
 *     summary: Delete collection
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.delete('/:collectionId', requireAuth, validate({ params: uuidParam }), collectionsController.delete.bind(collectionsController));

/**
 * @swagger
 * /collections/{collectionId}/notes:
 *   get:
 *     tags: [Notes]
 *     summary: List notes for a collection
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notes list
 *       401:
 *         description: Unauthorized
 */
router.get('/:collectionId/notes', requireAuth, validate({ params: uuidParam }), notesController.listForCollection.bind(notesController));

/**
 * @swagger
 * /collections/{collectionId}/notes:
 *   post:
 *     tags: [Notes]
 *     summary: Create note under a collection
 *     parameters:
 *       - in: path
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Collection not found
 */
router.post(
  '/:collectionId/notes',
  requireAuth,
  validate({ params: uuidParam, body: createNoteBody }),
  notesController.createForCollection.bind(notesController)
);

module.exports = router;
