const { getPool } = require('../db/pool');

class UsersRepository {
  /**
   * PUBLIC_INTERFACE
   * Finds a user by email.
   * @param {string} email
   */
  async findByEmail(email) {
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * PUBLIC_INTERFACE
   * Creates a user.
   * @param {{ email: string, passwordHash: string }} input
   */
  async create({ email, passwordHash }) {
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, created_at, updated_at`,
      [email, passwordHash]
    );
    return rows[0];
  }
}

module.exports = new UsersRepository();
