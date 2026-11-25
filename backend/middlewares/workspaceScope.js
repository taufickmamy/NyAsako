const db = require('../config/db');
const { sendError } = require('../utils/response');

const requestedWorkspaceId = (req) =>
  req.headers['x-workspace-id'] || req.query?.workspaceId || req.body?.workspace_id;

const membershipQuery = `
  SELECT w.id, w.name, w.slug, w.owner_id, wm.role, wm.workspace_id
  FROM workspaces w
  INNER JOIN workspace_members wm ON wm.workspace_id = w.id
  WHERE w.id = $1 AND wm.user_id = $2
  LIMIT 1;
`;

const loadMembership = async (workspaceId, userId) => {
  const { rows } = await db.query(membershipQuery, [workspaceId, userId]);
  return rows[0] || null;
};

const applyWorkspace = (req, membership) => {
  req.workspace = {
    id: membership.workspace_id ?? membership.id,
    name: membership.name,
    slug: membership.slug,
    owner_id: membership.owner_id,
  };
  req.workspaceRole = membership.role;
  req.workspaceId = req.workspace.id;
};

const requireActiveWorkspace = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 401, 'Non authentifié.');
    }

    const requested = requestedWorkspaceId(req);
    let workspaceId = null;

    if (requested) {
      workspaceId = Number(requested);
      if (!Number.isInteger(workspaceId) || workspaceId <= 0) {
        return sendError(res, 400, 'Identifiant de workspace invalide.');
      }
    } else {
      const { rows } = await db.query(
        `SELECT wm.workspace_id, wm.role
         FROM workspace_members wm
         WHERE wm.user_id = $1
         ORDER BY wm.joined_at ASC, wm.workspace_id ASC
         LIMIT 1;`,
        [userId]
      );
      if (!rows[0]) {
        return sendError(res, 403, 'Aucun espace de travail actif.');
      }
      workspaceId = rows[0].workspace_id;
    }

    const membership = await loadMembership(workspaceId, userId);
    if (!membership) {
      return sendError(res, 403, "Accès refusé : vous n'êtes pas membre de cet espace de travail.");
    }

    applyWorkspace(req, membership);
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireProjectWorkspace = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 401, 'Non authentifié.');
    }

    const projectId = req.params.projectId || req.params.id;
    const { rows } = await db.query(
      'SELECT id, workspace_id FROM projects WHERE id = $1;',
      [projectId]
    );
    const project = rows[0];

    if (!project) {
      return sendError(res, 404, 'Projet non trouvé.');
    }

    const requested = requestedWorkspaceId(req);
    if (
      requested &&
      Number(requested) !== Number(project.workspace_id)
    ) {
      return sendError(res, 403, "Accès refusé : ce projet n'appartient pas à cet espace de travail.");
    }

    const membership = await loadMembership(project.workspace_id, userId);
    if (!membership) {
      return sendError(res, 403, "Accès refusé : vous n'êtes pas membre de cet espace de travail.");
    }

    applyWorkspace(req, membership);
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  requireActiveWorkspace,
  requireProjectWorkspace,
};
