// utils/response.js
// Format de réponse unique de l'API NyAsako (Cahier des charges §12).
//
// Succès :
//   { "success": true, "message": "...", "data": {} }
// Erreur :
//   { "success": false, "message": "...", "errors": [] }

const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, statusCode, message, errors = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
