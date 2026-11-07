// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 401, 'Accès refusé. Jeton manquant.', []);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return sendError(res, 403, 'Jeton invalide ou expiré.', []);
    }
    req.user = user;
    next();
  });
};

// Restreint l'accès aux rôles fournis (Administrateur, Manager, Développeur).
const authorizeRoles = (...roles) => (req, res, next) => {
  const allowed = roles.flat();

  if (!req.user || !allowed.includes(req.user.role)) {
    return sendError(res, 403, "Accès refusé. Vous n'avez pas les droits nécessaires.", []);
  }

  next();
};

module.exports = authenticateToken;
module.exports.authorizeRoles = authorizeRoles;
