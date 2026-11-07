// models/workspaceModel.js
const db = require('../config/db');

const WORKSPACE_FIELDS = `
  w.id,
  w.name,
  w.description,
  w.owner_id,
  w.created_at,
  w.updated_at,
  owner.name AS owner_name,
  (SELECT COUNT(*)::int FROM workspace_members wm WHERE wm.workspace_id = w.id) AS members_count,
  (SELECT COUNT(*)::int FROM projects p WHERE p.workspace_id = w.id) AS projects_count
`;

const createWorkspace = async (name, description, ownerId) => {
  const query = `
    INSERT INTO workspaces (name, description, owner_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [name, description, ownerId]);
  return rows[0];
};

const findWorkspaceById = async (id) => {
  const query = `
    SELECT ${WORKSPACE_FIELDS}
    FROM workspaces w
    LEFT JOIN users owner ON w.owner_id = owner.id
    WHERE w.id = $1;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const findWorkspacesByUser = async (userId) => {
  const query = `
    SELECT ${WORKSPACE_FIELDS}, m.role AS member_role
    FROM workspaces w
    JOIN workspace_members m ON m.workspace_id = w.id
    LEFT JOIN users owner ON w.owner_id = owner.id
    WHERE m.user_id = $1
    ORDER BY w.created_at DESC;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

const updateWorkspace = async (id, name, description) => {
  const query = `
    UPDATE workspaces
    SET name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
  `;
  const { rows } = await db.query(query, [name, description, id]);
  return rows[0];
};

const deleteWorkspace = async (id) => {
  const query = 'DELETE FROM workspaces WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const findMembership = async (workspaceId, userId) => {
  const query = `
    SELECT *
    FROM workspace_members
    WHERE workspace_id = $1 AND user_id = $2;
  `;
  const { rows } = await db.query(query, [workspaceId, userId]);
  return rows[0];
};

const findMember = async (workspaceId, userId) => {
  const query = `
    SELECT
      m.workspace_id,
      m.user_id,
      m.role AS workspace_role,
      m.joined_at,
      u.name,
      u.email,
      u.role AS global_role
    FROM workspace_members m
    JOIN users u ON u.id = m.user_id
    WHERE m.workspace_id = $1 AND m.user_id = $2;
  `;
  const { rows } = await db.query(query, [workspaceId, userId]);
  return rows[0];
};

const findMembersByWorkspace = async (workspaceId) => {
  const query = `
    SELECT
      m.workspace_id,
      m.user_id,
      m.role AS workspace_role,
      m.joined_at,
      u.name,
      u.email,
      u.role AS global_role
    FROM workspace_members m
    JOIN users u ON u.id = m.user_id
    WHERE m.workspace_id = $1
    ORDER BY
      CASE m.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END,
      u.name ASC;
  `;
  const { rows } = await db.query(query, [workspaceId]);
  return rows;
};

const addMember = async (workspaceId, userId, role = 'member') => {
  const query = `
    INSERT INTO workspace_members (workspace_id, user_id, role)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [workspaceId, userId, role]);
  return rows[0];
};

const updateMemberRole = async (workspaceId, userId, role) => {
  const query = `
    UPDATE workspace_members
    SET role = $1
    WHERE workspace_id = $2 AND user_id = $3
    RETURNING *;
  `;
  const { rows } = await db.query(query, [role, workspaceId, userId]);
  return rows[0];
};

const removeMember = async (workspaceId, userId) => {
  const query = `
    DELETE FROM workspace_members
    WHERE workspace_id = $1 AND user_id = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [workspaceId, userId]);
  return rows[0];
};

module.exports = {
  createWorkspace,
  findWorkspaceById,
  findWorkspacesByUser,
  updateWorkspace,
  deleteWorkspace,
  findMembership,
  findMember,
  findMembersByWorkspace,
  addMember,
  updateMemberRole,
  removeMember,
};
