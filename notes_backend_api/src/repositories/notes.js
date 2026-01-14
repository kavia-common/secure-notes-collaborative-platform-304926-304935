const { getPool } = require('../db/pool');

class NotesRepository {
  /**
   * PUBLIC_INTERFACE
   * Lists notes for a collection owned by a user.
   * @param {string} ownerUserId
   * @param {string} collectionId
   */
  async listForCollection(ownerUserId, collectionId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT n.id, n.collection_id, n.title, n.content, n.created_at, n.updated_at
       FROM notes n
       JOIN collections c ON c.id = n.collection_id
       WHERE n.collection_id = $1 AND c.owner_user_id = $2
       ORDER BY n.updated_at DESC`,
      [collectionId, ownerUserId]
    );
    return rows;
  }

  /**
   * PUBLIC_INTERFACE
   * Creates a note for a collection owned by a user.
   * @param {string} ownerUserId
   * @param {string} collectionId
   * @param {{ title: string, content: string }} input
   */
  async createForCollection(ownerUserId, collectionId, { title, content }) {
    const pool = getPool();

    // Guard: ensure collection exists and is owned by user.
    const { rows: colRows } = await pool.query(
      'SELECT id FROM collections WHERE id = $1 AND owner_user_id = $2 LIMIT 1',
      [collectionId, ownerUserId]
    );
    if (colRows.length === 0) return null;

    const { rows } = await pool.query(
      `INSERT INTO notes (collection_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING id, collection_id, title, content, created_at, updated_at`,
      [collectionId, title, content]
    );
    return rows[0];
  }

  /**
   * PUBLIC_INTERFACE
   * Gets a note by id, constrained by owner via join through collections.
   * @param {string} ownerUserId
   * @param {string} noteId
   */
  async getByIdForOwner(ownerUserId, noteId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT n.id, n.collection_id, n.title, n.content, n.created_at, n.updated_at
       FROM notes n
       JOIN collections c ON c.id = n.collection_id
       WHERE n.id = $1 AND c.owner_user_id = $2
       LIMIT 1`,
      [noteId, ownerUserId]
    );
    return rows[0] || null;
  }

  /**
   * PUBLIC_INTERFACE
   * Updates a note by id, constrained by owner via join through collections.
   * @param {string} ownerUserId
   * @param {string} noteId
   * @param {{ title: string, content: string }} input
   */
  async updateForOwner(ownerUserId, noteId, { title, content }) {
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE notes n
       SET title = $1, content = $2, updated_at = now()
       FROM collections c
       WHERE n.id = $3 AND c.id = n.collection_id AND c.owner_user_id = $4
       RETURNING n.id, n.collection_id, n.title, n.content, n.created_at, n.updated_at`,
      [title, content, noteId, ownerUserId]
    );
    return rows[0] || null;
  }

  /**
   * PUBLIC_INTERFACE
   * Deletes a note by id, constrained by owner via join through collections.
   * @param {string} ownerUserId
   * @param {string} noteId
   */
  async deleteForOwner(ownerUserId, noteId) {
    const pool = getPool();
    const result = await pool.query(
      `DELETE FROM notes n
       USING collections c
       WHERE n.id = $1 AND c.id = n.collection_id AND c.owner_user_id = $2`,
      [noteId, ownerUserId]
    );
    return result.rowCount > 0;
  }
}

module.exports = new NotesRepository();
