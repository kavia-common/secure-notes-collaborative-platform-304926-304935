const collectionsService = require('../services/collections');

class CollectionsController {
  /**
   * PUBLIC_INTERFACE
   * List collections for authenticated user.
   */
  async list(req, res, next) {
    try {
      const collections = await collectionsService.list(req.user.userId);
      return res.status(200).json({ status: 'ok', data: { collections } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Create collection for authenticated user.
   */
  async create(req, res, next) {
    try {
      const collection = await collectionsService.create(req.user.userId, req.body.name);
      return res.status(201).json({ status: 'ok', data: { collection } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Get a collection by id (owned).
   */
  async get(req, res, next) {
    try {
      const collection = await collectionsService.get(req.user.userId, req.params.collectionId);
      return res.status(200).json({ status: 'ok', data: { collection } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Update collection name (owned).
   */
  async update(req, res, next) {
    try {
      const collection = await collectionsService.update(
        req.user.userId,
        req.params.collectionId,
        req.body.name
      );
      return res.status(200).json({ status: 'ok', data: { collection } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Delete collection (owned).
   */
  async delete(req, res, next) {
    try {
      await collectionsService.delete(req.user.userId, req.params.collectionId);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new CollectionsController();
