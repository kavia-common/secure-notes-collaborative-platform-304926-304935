const notesRepo = require('../repositories/notes');
const { NotFoundError } = require('../errors');

class NotesService {
  /**
   * PUBLIC_INTERFACE
   * List notes for a collection (owned).
   * @param {string} userId
   * @param {string} collectionId
   */
  async listForCollection(userId, collectionId) {
    // If collection is not owned, repository returns empty. We keep 200 [] semantics for list.
    return notesRepo.listForCollection(userId, collectionId);
  }

  /**
   * PUBLIC_INTERFACE
   * Create note under collection (owned).
   * @param {string} userId
   * @param {string} collectionId
   * @param {{ title: string, content: string }} input
   */
  async createForCollection(userId, collectionId, input) {
    const note = await notesRepo.createForCollection(userId, collectionId, input);
    if (!note) throw new NotFoundError('Collection not found');
    return note;
  }

  /**
   * PUBLIC_INTERFACE
   * Get note by id (owned).
   * @param {string} userId
   * @param {string} noteId
   */
  async get(userId, noteId) {
    const note = await notesRepo.getByIdForOwner(userId, noteId);
    if (!note) throw new NotFoundError('Note not found');
    return note;
  }

  /**
   * PUBLIC_INTERFACE
   * Update note by id (owned).
   * @param {string} userId
   * @param {string} noteId
   * @param {{ title: string, content: string }} input
   */
  async update(userId, noteId, input) {
    const updated = await notesRepo.updateForOwner(userId, noteId, input);
    if (!updated) throw new NotFoundError('Note not found');
    return updated;
  }

  /**
   * PUBLIC_INTERFACE
   * Delete note by id (owned).
   * @param {string} userId
   * @param {string} noteId
   */
  async delete(userId, noteId) {
    const ok = await notesRepo.deleteForOwner(userId, noteId);
    if (!ok) throw new NotFoundError('Note not found');
    return ok;
  }
}

module.exports = new NotesService();
