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
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT,
      owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Compatibilité avec les bases créées avant l'ajout du slug.
  await db.query(`
    ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
  `);
  await db.query(`
    ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS description TEXT;
  `);
  await db.query(`
    UPDATE workspaces SET slug = 'workspace-' || id WHERE slug IS NULL;
  `);
  await db.query(`
    ALTER TABLE workspaces ALTER COLUMN slug SET NOT NULL;
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      id SERIAL PRIMARY KEY,
      workspace_id INT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(30) NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'manager', 'member')),
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (workspace_id, user_id)
    );
  `);

  // Compatibilité avec l'ancienne table sans colonne id / sans rôle manager.
  await db.query(`
    ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS id SERIAL;
  `);
  await db.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'workspace_members_role_check'
          AND conrelid = 'workspace_members'::regclass
      ) THEN
        ALTER TABLE workspace_members DROP CONSTRAINT workspace_members_role_check;
      END IF;
    END
    $$;
  `);
  await db.query(`
    ALTER TABLE workspace_members
    ADD CONSTRAINT workspace_members_role_check
    CHECK (role IN ('owner', 'admin', 'manager', 'member'));
  `);

  for (const table of ['projects', 'tasks', 'activities', 'notifications', 'documents']) {
    await db.query(`
      ALTER TABLE ${table}
      ADD COLUMN IF NOT EXISTS workspace_id INT REFERENCES workspaces(id) ON DELETE CASCADE;
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_${table}_workspace_id ON ${table}(workspace_id);
    `);
  }

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id
    ON workspace_members(workspace_id);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id
    ON workspace_members(user_id);
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
  const slug = `espace-${userId}-${Date.now()}`;
  const { rows: created } = await db.query(
    `
      INSERT INTO workspaces (name, slug, description, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `,
    [name, slug, 'Espace de travail par défaut.', userId]
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

const ensureUserWorkspaces = async () => {
  const { rows: users } = await db.query('SELECT id, name FROM users ORDER BY id;');
  for (const user of users) {
    await findOrCreateDefaultWorkspace(user.id, user.name);
  }
};

const backfillEntityWorkspaces = async () => {
  for (const table of ['tasks', 'activities', 'notifications', 'documents']) {
    await db.query(
      `UPDATE ${table} entity
       SET workspace_id = project.workspace_id
       FROM projects project
       WHERE entity.project_id = project.id AND entity.workspace_id IS NULL;`
    );
  }

  await db.query(`
    UPDATE notifications n
    SET workspace_id = (
      SELECT MIN(wm.workspace_id)
      FROM workspace_members wm
      WHERE wm.user_id = n.recipient_id
    )
    WHERE n.workspace_id IS NULL;
  `);
};

const ensureSchema = async () => {
  // Photo de profil (compatibilité avec les bases créées avant son ajout).
  await db.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
  `);

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

  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      recipient_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      actor_id INT REFERENCES users(id) ON DELETE SET NULL,
      type VARCHAR(40) NOT NULL,
      message TEXT NOT NULL,
      project_id INT REFERENCES projects(id) ON DELETE CASCADE,
      task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
    ON notifications(recipient_id, created_at DESC);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
    ON password_reset_tokens(user_id);
  `);

  await createWorkspacesSchema();
  await ensureUserWorkspaces();
  await backfillProjectWorkspaces();
  await backfillEntityWorkspaces();
};

module.exports = ensureSchema;
module.exports.findOrCreateDefaultWorkspace = findOrCreateDefaultWorkspace;
