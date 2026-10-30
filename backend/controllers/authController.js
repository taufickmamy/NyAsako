// controllers/authController.js
const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
    }

    const newUser = await authService.register(name, email, password, role);
    return res.status(201).json({ message: 'Utilisateur créé avec succès.', user: newUser });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const { user, accessToken, refreshToken } = await authService.login(email, password);

    // Stockage du Refresh Token dans un cookie HTTP-Only sécurisé
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return res.status(200).json({ message: 'Connexion réussie.', user, accessToken });
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

    return res.status(200).json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
    register,
    login,
    logout,
};