// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

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

// Routes API
app.use('/api/auth', authRoutes);

// Route de test de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API SaaS Project Management !' });
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