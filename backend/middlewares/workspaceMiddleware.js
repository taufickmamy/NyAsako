// middlewares/workspaceMiddleware.js
const db = require('../config/db');
const { sendError } = require('../utils/response');

const requireWorkspaceMember = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, 'Non authentifié.');
      }

      const rawParamId = req.params.workspaceId || req.params.id;
      const rawHeaderId = req.headers['x-workspace-id'];
      const rawBodyId = req.body?.workspace_id;
      const rawWorkspaceId = rawParamId || rawHeaderId || rawBodyId;

      if (
        rawHeaderId &&
        rawParamId &&
        Number(rawHeaderId) !== Number(rawParamId)
      ) {
        return sendError(res, 400, 'L\'en-tête X-Workspace-Id ne correspond pas à l\'identifiant de la route.');
      }

      if (rawBodyId && rawParamId && Number(rawBodyId) !== Number(rawParamId)) {
        return sendError(res, 400, 'Le workspace_id du corps ne correspond pas à l\'identifiant de la route.');
      }

      const workspaceId = Number(rawWorkspaceId);
      if (!rawWorkspaceId || Number.isNaN(workspaceId) || workspaceId <= 0) {
        return sendError(res, 400, 'Identifiant de workspace (X-Workspace-Id ou ID) manquant ou invalide.');
      }

      const query = `
        SELECT w.id, w.name, w.slug, w.owner_id, wm.role
        FROM workspaces w
        INNER JOIN workspace_members wm ON wm.workspace_id = w.id
        WHERE w.id = $1 AND wm.user_id = $2
        LIMIT 1;
      `;
      const { rows } = await db.query(query, [workspaceId, userId]);

      if (rows.length === 0) {
        return sendError(res, 403, "Accès refusé : vous n'êtes pas membre de ce workspace.");
      }

      const membership = rows[0];

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return sendError(res, 403, 'Accès refusé : permissions insuffisantes dans ce workspace.');
      }

      req.workspace = {
        id: membership.id,
        name: membership.name,
        slug: membership.slug,
        owner_id: membership.owner_id,
      };
      req.workspaceRole = membership.role;

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireWorkspaceMember,
};