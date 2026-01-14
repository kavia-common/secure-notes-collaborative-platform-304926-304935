const { getPool } = require('./pool');

/**
 * PUBLIC_INTERFACE
 * Ensures the required tables exist. This is a lightweight migration mechanism suitable for early-stage projects.
 *
 * In production, replace this with a proper migration tool (e.g., knex, prisma, node-pg-migrate).
 *
 * @returns {Promise<void>}
 */
async function ensureSchema() {
  const pool = getPool();
  if (!pool) return;

  // If DATABASE_URL is missing, pool exists but is misconfigured; let failures surface on first query.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Enable uuid generation (Postgres extensions); ignore if not permitted.
    // Using gen_random_uuid() requires pgcrypto; uuid-ossp provides uuid_generate_v4().
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(320) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS collections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name varchar(200) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        title varchar(200) NOT NULL,
        content text NOT NULL DEFAULT '',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS note_shares (
        note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
        shared_with_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        permission text NOT NULL CHECK (permission IN ('read', 'edit')),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(note_id, shared_with_user_id)
      );
    `);

    await client.query('CREATE INDEX IF NOT EXISTS idx_collections_owner_user_id ON collections(owner_user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_notes_collection_id ON notes(collection_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_note_shares_shared_with_note ON note_shares(shared_with_user_id, note_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_note_shares_note_id ON note_shares(note_id);');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  ensureSchema,
};
