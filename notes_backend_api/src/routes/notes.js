const express = require('express');
const notesController = require('../controllers/notes');
const { requireAuth, validate } = require('../middleware');
const { z } = require('zod');

const router = express.Router();

const noteIdParam = z.object({
  noteId: z.string().uuid(),
});

const updateNoteBody = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(200000),
});

/**
 * @swagger
 * tags:
 *   - name: Notes
 *     description: Notes owned by the authenticated user (ownership via collection)
 */

/**
 * @swagger
 * /notes/{noteId}:
 *   get:
 *     tags: [Notes]
 *     summary: Get note
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Note
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:noteId', requireAuth, validate({ params: noteIdParam }), notesController.get.bind(notesController));

/**
 * @swagger
 * /notes/{noteId}:
 *   put:
 *     tags: [Notes]
 *     summary: Update note
 *     parameters:
 *       - in: path
 *         name: noteId
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
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.put('/:noteId', requireAuth, validate({ params: noteIdParam, body: updateNoteBody }), notesController.update.bind(notesController));

/**
 * @swagger
 * /notes/{noteId}:
 *   delete:
 *     tags: [Notes]
 *     summary: Delete note
 *     parameters:
 *       - in: path
 *         name: noteId
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
router.delete('/:noteId', requireAuth, validate({ params: noteIdParam }), notesController.delete.bind(notesController));

module.exports = router;
