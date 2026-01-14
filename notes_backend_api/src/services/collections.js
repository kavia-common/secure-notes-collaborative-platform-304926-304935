const collectionsRepo = require('../repositories/collections');
const { NotFoundError } = require('../errors');

class CollectionsService {
  /**
   * PUBLIC_INTERFACE
   * List collections for user.
   * @param {string} userId
   */
  async list(userId) {
    return collectionsRepo.listByOwner(userId);
  }

  /**
   * PUBLIC_INTERFACE
   * Create collection for user.
   * @param {string} userId
   * @param {string} name
   */
  async create(userId, name) {
    return collectionsRepo.create(userId, name);
  }

  /**
   * PUBLIC_INTERFACE
   * Get collection by id (owned).
   * @param {string} userId
   * @param {string} collectionId
   */
  async get(userId, collectionId) {
    const col = await collectionsRepo.getByIdForOwner(userId, collectionId);
    if (!col) throw new NotFoundError('Collection not found');
    return col;
  }

  /**
   * PUBLIC_INTERFACE
   * Update collection name (owned).
   * @param {string} userId
   * @param {string} collectionId
   * @param {string} name
   */
  async update(userId, collectionId, name) {
    const updated = await collectionsRepo.updateName(userId, collectionId, name);
    if (!updated) throw new NotFoundError('Collection not found');
    return updated;
  }

  /**
   * PUBLIC_INTERFACE
   * Delete collection (owned).
   * @param {string} userId
   * @param {string} collectionId
   */
  async delete(userId, collectionId) {
    const ok = await collectionsRepo.delete(userId, collectionId);
    if (!ok) throw new NotFoundError('Collection not found');
    return ok;
  }
}

module.exports = new CollectionsService();
