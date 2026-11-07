// middlewares/roleMiddleware.js
const { sendError } = require('../utils/response');

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Accès interdit. Permissions insuffisantes.', []);
    }
    next();
  };
};

module.exports = checkRole;
