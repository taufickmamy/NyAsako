// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authenticateToken);

// Profil de l'utilisateur connecté (tous les rôles)
router.get('/me', userController.getMe);
router.patch('/me', userController.updateMe);
// Upload de la photo de profil (tous les rôles)
router.post('/me/avatar', upload.single('avatar'), userController.uploadProfilePicture);

// Administration globale (Administrateur uniquement)
router.use(authorizeRoles('Administrateur'));

router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.patch('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);


module.exports = router;
