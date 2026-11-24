// controllers/authController.js
const authService = require('../services/authService');
const passwordResetService = require('../services/passwordResetService');
const { sendSuccess, sendError } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 400, 'Tous les champs obligatoires doivent être remplis.', []);
    }

    const newUser = await authService.register(name, email, password, role);
    return sendSuccess(res, 201, 'Utilisateur créé avec succès.', { user: newUser });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Email et mot de passe requis.', []);
    }

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Stockage du Refresh Token dans un cookie HTTP-Only sécurisé
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return sendSuccess(res, 200, 'Connexion réussie.', { user, accessToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Supprimer le cookie contenant le refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return sendSuccess(res, 200, 'Déconnexion réussie.', null);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(String(email).trim())) {
      return sendError(res, 400, 'Une adresse e-mail valide est requise.', []);
    }

    const { devLink } = await passwordResetService.requestPasswordReset(email);
    const data = process.env.NODE_ENV === 'production' ? null : { devLink };
    return sendSuccess(
      res,
      200,
      'Si un compte est associé à cette adresse, un e-mail de réinitialisation a été envoyé.',
      data
    );
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;
    if (!token) {
      return sendError(res, 400, 'Jeton de réinitialisation invalide.', []);
    }
    if (!password || String(password).length < 8) {
      return sendError(res, 400, 'Le mot de passe doit contenir au moins 8 caractères.', []);
    }

    await passwordResetService.resetPassword({ token, email, password });
    return sendSuccess(res, 200, 'Mot de passe réinitialisé avec succès.', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
