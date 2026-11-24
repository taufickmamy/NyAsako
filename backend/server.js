const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { sendError } = require('./utils/response');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');
const activityRoutes = require('./routes/activityRoutes');
const globalActivityRoutes = require('./routes/globalActivityRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const globalTaskRoutes = require('./routes/globalTaskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const globalDocumentRoutes = require('./routes/globalDocumentRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const ensureSchema = require('./config/ensureSchema');

const app = express();
const server = http.createServer(app);

// Origines autorisées (frontend Vite + éventuelles URLs de production).
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Configuration de Socket.io avec CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Middlewares globaux
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Fichiers téléchargés (documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API (versionnées)
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/team', teamRoutes);
apiRouter.use('/workspaces', workspaceRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/projects/:projectId/tasks', taskRoutes);
apiRouter.use('/projects/:projectId/documents', documentRoutes);
apiRouter.use('/projects/:projectId/activities', activityRoutes);
apiRouter.use('/tasks/:taskId/comments', commentRoutes);
apiRouter.use('/tasks', globalTaskRoutes);
apiRouter.use('/documents', globalDocumentRoutes);
apiRouter.use('/activities', globalActivityRoutes);
apiRouter.use('/notifications', notificationRoutes);

app.use('/api/v1', apiRouter);

// Alias de compatibilité pour les anciens clients encore branchés sur /api.
// Les nouvelles intégrations doivent utiliser /api/v1.
app.use('/api', apiRouter);

// Route de test de base
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Bienvenue sur l\'API SaaS Project Management !', data: null });
});

// Route inconnue
app.use((req, res) => {
  sendError(res, 404, 'Ressource introuvable.', []);
});

// Gestion centralisée des erreurs (respecte error.statusCode)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) console.error(err);
  const errors = Array.isArray(err.errors) ? err.errors : [];
  sendError(res, statusCode, err.message || 'Erreur interne du serveur.', errors);
});

// Authentification Socket.io : chaque connexion rejoint sa salle utilisateur.
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers.authorization || '').split(' ')[1];

  if (!token) return next(new Error('Jeton manquant.'));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Jeton invalide ou expiré.'));
    socket.userId = user.id;
    next();
  });
});

// Gestion des connexions Socket.io en temps réel
io.on('connection', (socket) => {
  socket.join(`user_${socket.userId}`);
  console.log(`⚡ Un utilisateur s'est connecté : ${socket.id}`);

  // Exemple d'écoute d'un événement (ex: déplacement d'une tâche dans le Kanban)
  socket.on('join_project', (projectId) => {
    socket.join(`project_${projectId}`);
    console.log(`Utilisateur a rejoint la salle du projet : project_${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Un utilisateur s'est déconnecté : ${socket.id}`);
  });
});

// Export de io pour l'utiliser dans les contrôleurs si besoin
app.set('socketio', io);

// Vérification du schéma (commentaires, workspaces) avant de servir les routes
ensureSchema()
  .then(() => console.log('✅ Schéma de base de données vérifié'))
  .catch((error) => console.error('❌ Impossible de vérifier le schéma :', error.message));

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});
