const { getPool } = require('../db/pool');

class CollectionsRepository {
  /**
   * PUBLIC_INTERFACE
   * Lists collections for an owner.
   * @param {string} ownerUserId
   */
  async listByOwner(ownerUserId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, owner_user_id, name, created_at, updated_at
       FROM collections
       WHERE owner_user_id = $1
       ORDER BY updated_at DESC`,
      [ownerUserId]
    );
    return rows;
  }

  /**
   * PUBLIC_INTERFACE
   * Gets a collection by id, constrained by owner.
   * @param {string} ownerUserId
   * @param {string} collectionId
   */
  async getByIdForOwner(ownerUserId, collectionId) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, owner_user_id, name, created_at, updated_at
       FROM collections
       WHERE id = $1 AND owner_user_id = $2
       LIMIT 1`,
      [collectionId, ownerUserId]
    );
    return rows[0] || null;
  }

  /**
   * PUBLIC_INTERFACE
   * Creates a collection for an owner.
   * @param {string} ownerUserId
   * @param {string} name
   */
  async create(ownerUserId, name) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO collections (owner_user_id, name)
       VALUES ($1, $2)
       RETURNING id, owner_user_id, name, created_at, updated_at`,
      [ownerUserId, name]
    );
    return rows[0];
  }

  /**
   * PUBLIC_INTERFACE
   * Updates a collection name, constrained by owner.
   * @param {string} ownerUserId
   * @param {string} collectionId
   * @param {string} name
   */
  async updateName(ownerUserId, collectionId, name) {
    const pool = getPool();
    const { rows } = await pool.query(
      `UPDATE collections
       SET name = $1, updated_at = now()
       WHERE id = $2 AND owner_user_id = $3
       RETURNING id, owner_user_id, name, created_at, updated_at`,
      [name, collectionId, ownerUserId]
    );
    return rows[0] || null;
  }

  /**
   * PUBLIC_INTERFACE
   * Deletes a collection, constrained by owner.
   * @param {string} ownerUserId
   * @param {string} collectionId
   */
  async delete(ownerUserId, collectionId) {
    const pool = getPool();
    const result = await pool.query(
      'DELETE FROM collections WHERE id = $1 AND owner_user_id = $2',
      [collectionId, ownerUserId]
    );
    return result.rowCount > 0;
  }
}

module.exports = new CollectionsRepository();
