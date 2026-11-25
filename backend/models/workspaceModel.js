// models/workspaceModel.js
const db = require('../config/db');

const createWorkspaceWithOwner = async (name, slug, ownerId, description = null) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const insertWorkspaceQuery = `
      INSERT INTO workspaces (name, slug, description, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows: wsRows } = await client.query(insertWorkspaceQuery, [
      name,
      slug,
      description || null,
      ownerId,
    ]);
    const workspace = wsRows[0];

    const insertMemberQuery = `
      INSERT INTO workspace_members (workspace_id, user_id, role)
      VALUES ($1, $2, 'owner')
      RETURNING *;
    `;
    await client.query(insertMemberQuery, [workspace.id, ownerId]);

    await client.query('COMMIT');
    return workspace;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const findWorkspacesByUserId = async (userId) => {
  const query = `
    SELECT w.*, wm.role AS my_role
    FROM workspaces w
    INNER JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE wm.user_id = $1
    ORDER BY w.created_at DESC;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

const findWorkspaceById = async (workspaceId, userId) => {
  const query = `
    SELECT w.*, wm.role AS my_role
    FROM workspaces w
    INNER JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE w.id = $1 AND wm.user_id = $2
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [workspaceId, userId]);
  return rows[0] || null;
};

const updateWorkspaceById = async (workspaceId, payload = {}) => {
  const mapping = {
    name: 'name',
    slug: 'slug',
    description: 'description',
  };
  const values = [workspaceId];
  const assignments = [];

  Object.entries(mapping).forEach(([key, column]) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      values.push(payload[key]);
      assignments.push(`${column} = $${values.length}`);
    }
  });

  if (assignments.length === 0) {
    const { rows: current } = await db.query('SELECT * FROM workspaces WHERE id = $1;', [workspaceId]);
    return current[0] || null;
  }

  assignments.push('updated_at = CURRENT_TIMESTAMP');
  const query = `
    UPDATE workspaces
    SET ${assignments.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, values);
  return rows[0] || null;
};

const deleteWorkspaceById = async (workspaceId) => {
  const query = `
    DELETE FROM workspaces
    WHERE id = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [workspaceId]);
  return rows[0] || null;
};

const findProjectsByWorkspaceId = async (workspaceId) => {
  const query = `
    SELECT *
    FROM projects
    WHERE workspace_id = $1
    ORDER BY id DESC;
  `;
  const { rows } = await db.query(query, [workspaceId]);
  return rows;
};

const findMembersByWorkspaceId = async (workspaceId) => {
  const query = `
    SELECT wm.id, wm.workspace_id, wm.user_id, wm.role, wm.joined_at,
           u.name, u.email
    FROM workspace_members wm
    INNER JOIN users u ON u.id = wm.user_id
    WHERE wm.workspace_id = $1
    ORDER BY wm.joined_at ASC;
  `;
  const { rows } = await db.query(query, [workspaceId]);
  return rows;
};

const findUserByEmail = async (email) => {
  const query = 'SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1;';
  const { rows } = await db.query(query, [email]);
  return rows[0] || null;
};

const upsertMember = async (workspaceId, userId, role) => {
  const query = `
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (workspace_id, user_id)
    DO UPDATE SET role = EXCLUDED.role
    RETURNING *;
  `;
  const { rows } = await db.query(query, [workspaceId, userId, role]);
  return rows[0];
};

const findMemberDetails = async (workspaceId, userId) => {
  const query = `
    SELECT wm.id, wm.workspace_id, wm.user_id, wm.role, wm.joined_at,
           u.name, u.email
    FROM workspace_members wm
    INNER JOIN users u ON u.id = wm.user_id
    WHERE wm.workspace_id = $1 AND wm.user_id = $2
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [workspaceId, userId]);
  return rows[0] || null;
};

const findMember = async (workspaceId, userId) => {
  const query = `
    SELECT * FROM workspace_members
    WHERE workspace_id = $1 AND user_id = $2
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [workspaceId, userId]);
  return rows[0] || null;
};

const countOwners = async (workspaceId) => {
  const query = `
    SELECT COUNT(*)::int AS total
    FROM workspace_members
    WHERE workspace_id = $1 AND role = 'owner';
  `;
  const { rows } = await db.query(query, [workspaceId]);
  return rows[0].total;
};

const countMembers = async (workspaceId) => {
  const query = `
    SELECT COUNT(*)::int AS total
    FROM workspace_members
    WHERE workspace_id = $1;
  `;
  const { rows } = await db.query(query, [workspaceId]);
  return rows[0].total;
};

const updateMemberRole = async (workspaceId, userId, role) => {
  const query = `
    UPDATE workspace_members
    SET role = $3
    WHERE workspace_id = $1 AND user_id = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [workspaceId, userId, role]);
  return rows[0] || null;
};

const removeMember = async (workspaceId, userId) => {
  const query = `
    DELETE FROM workspace_members
    WHERE workspace_id = $1 AND user_id = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [workspaceId, userId]);
  return rows[0] || null;
};

module.exports = {
  createWorkspaceWithOwner,
  findWorkspacesByUserId,
  findWorkspaceById,
  updateWorkspaceById,
  deleteWorkspaceById,
  findProjectsByWorkspaceId,
  findMembersByWorkspaceId,
  findUserByEmail,
  upsertMember,
  findMemberDetails,
  findMember,
  countOwners,
  countMembers,
  updateMemberRole,
  removeMember,
};