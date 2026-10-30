// middlewares/roleMiddleware.js
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit. Permissions insuffisantes.' });
    }
    next();
  };
};

module.exports = checkRole;