const notesService = require('../services/notes');

class NotesController {
  /**
   * PUBLIC_INTERFACE
   * List notes for a collection (owned).
   */
  async listForCollection(req, res, next) {
    try {
      const notes = await notesService.listForCollection(req.user.userId, req.params.collectionId);
      return res.status(200).json({ status: 'ok', data: { notes } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Create a note under a collection (owned).
   */
  async createForCollection(req, res, next) {
    try {
      const note = await notesService.createForCollection(req.user.userId, req.params.collectionId, req.body);
      return res.status(201).json({ status: 'ok', data: { note } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Get a note by id (owned).
   */
  async get(req, res, next) {
    try {
      const note = await notesService.get(req.user.userId, req.params.noteId);
      return res.status(200).json({ status: 'ok', data: { note } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Update a note by id (owned).
   */
  async update(req, res, next) {
    try {
      const note = await notesService.update(req.user.userId, req.params.noteId, req.body);
      return res.status(200).json({ status: 'ok', data: { note } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Delete a note by id (owned).
   */
  async delete(req, res, next) {
    try {
      await notesService.delete(req.user.userId, req.params.noteId);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new NotesController();
