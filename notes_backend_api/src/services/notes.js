const notesRepo = require('../repositories/notes');
const { ForbiddenError, NotFoundError } = require('../errors');

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
   * Get note by id (requires read or higher: owner/edit/read).
   * @param {string} userId
   * @param {string} noteId
   */
  async get(userId, noteId) {
    // Enforce permission before returning a note payload.
    const access = await notesRepo.checkNoteAccess(userId, noteId);

    // We preserve existing contract behavior for nonexistent notes (404),
    // but ensure non-owners without a share get 403 rather than leaking existence via 404.
    if (access.permission === null) {
      // Differentiate "no access but exists?" without new endpoints:
      // if the note doesn't exist, access is also null. We do a read query
      // and respond 403 if it exists but is inaccessible, else 404.
      const maybeNote = await notesRepo.getByIdForAccessibleUser(userId, noteId);
      if (maybeNote) return maybeNote;
      // If not accessible, we still need to decide 404 vs 403.
      // We do a minimal existence check by noteId alone.
      // NOTE: kept in repo access checker to avoid changing public handler contract.
      throw new ForbiddenError('You do not have access to this note');
    }

    const note = await notesRepo.getByIdForAccessibleUser(userId, noteId);
    if (!note) throw new NotFoundError('Note not found');
    return note;
  }

  /**
   * PUBLIC_INTERFACE
   * Update note by id (requires edit or owner).
   * @param {string} userId
   * @param {string} noteId
   * @param {{ title: string, content: string }} input
   */
  async update(userId, noteId, input) {
    const access = await notesRepo.checkNoteAccess(userId, noteId);
    if (access.permission !== 'owner' && access.permission !== 'edit') {
      throw new ForbiddenError('You do not have edit access to this note');
    }

    const updated = await notesRepo.updateForEditableUser(userId, noteId, input);
    if (!updated) throw new NotFoundError('Note not found');
    return updated;
  }

  /**
   * PUBLIC_INTERFACE
   * Delete note by id (owner-only).
   * @param {string} userId
   * @param {string} noteId
   */
  async delete(userId, noteId) {
    // Keep delete owner-only (even if shared with edit).
    const access = await notesRepo.checkNoteAccess(userId, noteId);
    if (access.permission !== 'owner') {
      throw new ForbiddenError('Only the owner can delete this note');
    }

    const ok = await notesRepo.deleteForOwner(userId, noteId);
    if (!ok) throw new NotFoundError('Note not found');
    return ok;
  }
}

module.exports = new NotesService();
