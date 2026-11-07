// config/ensureSchema.js
const db = require('./db');

/**
 * Crée les tables ajoutées après la version initiale du schéma.
 * Idempotent : peut être exécuté à chaque démarrage du serveur.
 */
const createWorkspacesSchema = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      owner_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'member')),
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (workspace_id, user_id)
    );
  `);

  // Relation projet <-> workspace (nullable pour rester compatible avec l'existant).
  await db.query(`
    ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS workspace_id INT REFERENCES workspaces(id) ON DELETE CASCADE;
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id
    ON workspace_members(user_id);
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_projects_workspace_id
    ON projects(workspace_id);
  `);
};

/**
 * Crée (si nécessaire) le workspace par défaut d'un utilisateur.
 * Retourne l'identifiant du workspace.
 */
const findOrCreateDefaultWorkspace = async (userId, userName) => {
  const { rows: existing } = await db.query(
    `
      SELECT w.id
      FROM workspaces w
      JOIN workspace_members m ON m.workspace_id = w.id
      WHERE m.user_id = $1 AND m.role = 'owner'
      ORDER BY w.id ASC
      LIMIT 1;
    `,
    [userId]
  );

  if (existing[0]) return existing[0].id;

  const name = `Espace de ${userName || 'NyAsako'}`;
  const { rows: created } = await db.query(
    `
      INSERT INTO workspaces (name, description, owner_id)
      VALUES ($1, $2, $3)
      RETURNING id;
    `,
    [name, 'Espace de travail par défaut.', userId]
  );

  const workspaceId = created[0].id;

  await db.query(
    `
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES ($1, $2, 'owner')
      ON CONFLICT (workspace_id, user_id) DO NOTHING;
    `,
    [workspaceId, userId]
  );

  return workspaceId;
};

/**
 * Rattache les projets existants à un workspace afin que la migration
 * n'isole aucun projet déjà présent en base.
 */
const backfillProjectWorkspaces = async () => {
  const { rows: creators } = await db.query(`
    SELECT DISTINCT p.created_by, u.name
    FROM projects p
    JOIN users u ON u.id = p.created_by
    WHERE p.workspace_id IS NULL;
  `);

  for (const creator of creators) {
    const workspaceId = await findOrCreateDefaultWorkspace(creator.created_by, creator.name);
    await db.query(
      'UPDATE projects SET workspace_id = $1 WHERE created_by = $2 AND workspace_id IS NULL;',
      [workspaceId, creator.created_by]
    );
  }

  // Projets orphelins (créateur supprimé) : on les rattache au workspace
  // du premier administrateur disponible.
  const { rows: orphanCount } = await db.query(
    'SELECT COUNT(*)::int AS count FROM projects WHERE workspace_id IS NULL;'
  );

  if (orphanCount[0].count > 0) {
    const { rows: fallbackOwner } = await db.query(`
      SELECT id, name
      FROM users
      ORDER BY (role = 'Administrateur') DESC, id ASC
      LIMIT 1;
    `);

    if (fallbackOwner[0]) {
      const workspaceId = await findOrCreateDefaultWorkspace(
        fallbackOwner[0].id,
        fallbackOwner[0].name
      );
      await db.query(
        'UPDATE projects SET workspace_id = $1 WHERE workspace_id IS NULL;',
        [workspaceId]
      );
    }
  }
};

const ensureSchema = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INT REFERENCES users(id) ON DELETE SET NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
  `);

  await createWorkspacesSchema();
  await backfillProjectWorkspaces();
};

module.exports = ensureSchema;
module.exports.findOrCreateDefaultWorkspace = findOrCreateDefaultWorkspace;
