const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const documentRoutes = require('./routes/documentRoutes');
const activityRoutes = require('./routes/activityRoutes');
const globalActivityRoutes = require('./routes/globalActivityRoutes');

const app = express();
const server = http.createServer(app);

// Configuration de Socket.io avec CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Port par défaut de React (Vite)
    credentials: true,
  },
});

// Middlewares globaux
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Fichiers téléchargés (documents)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/documents', documentRoutes);
app.use('/api/projects/:projectId/activities', activityRoutes);
app.use('/api/activities', globalActivityRoutes);

// Route de test de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API SaaS Project Management !' });
});

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ message: 'Ressource introuvable.' });
});

// Gestion centralisée des erreurs (respecte error.statusCode)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({ message: err.message || 'Erreur interne du serveur.' });
});

// Gestion des connexions Socket.io en temps réel
io.on('connection', (socket) => {
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

// Lancement du serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
});