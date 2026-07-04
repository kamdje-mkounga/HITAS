// 1. CHARGER LE .ENV EN TOUT PREMIER (Ligne 1)
import { io } from 'socket.io-client';
const socket = io('http://localhost:5000'); // Remplace par l'URL de ton serveur (ou laisse vide si même domaine)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
console.log("MONGO_URI loaded:", !!process.env.MONGO_URI);

if (process.env.MONGO_URI) {
    console.log(process.env.MONGO_URI.substring(0, 60) + "...");
}

// 2. Les autres imports (maintenant ils ont accès aux variables d'environnement)
const express = require('express');
const http = require('http'); // 🌐 AJOUTÉ : Requis pour lier Socket.io à Express
const { Server } = require('socket.io'); // 🌐 AJOUTÉ : Le moteur temps réel
const cors = require('cors'); 
const connectDB = require('./config/db'); 

// 3. Connexion à la base de données MongoDB
connectDB();

// 4. Initialisation de l'application Express
const app = express();

// 🌐 AJOUTÉ : Création du serveur HTTP natif enveloppant Express
const server = http.createServer(app);

// 🌐 AJOUTÉ : Initialisation de Socket.io avec support CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Aligné sur ta configuration CORS actuelle
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// 🌐 AJOUTÉ : On attache 'io' à l'instance 'app' pour qu'il soit accessible dans tes fichiers de routes
app.set('io', io);
//
// Exemple dans ton fichier de route ou contrôleur d'articles :
const newArticle = await Article.create(req.body);

// 🚀 On prévient tous les clients connectés qu'un nouvel article est disponible
if (req.io) {
  req.io.emit('article_published', newArticle);
} else if (global.io) {
  global.io.emit('article_published', newArticle);
}
//

// 🌐 AJOUTÉ : Suivi basique des connexions (Utile pour tes logs de debug)
io.on('connection', (socket) => {
  console.log(`Un utilisateur s'est connecté au live (ID: ${socket.id})`);
  
  socket.on('disconnect', () => {
    console.log(`Un utilisateur a quitté le live`);
  });
});

// 5. Configuration du CORS pour Express
app.use(cors({
  origin: '*',
  credentials: true
}));

// 6. Middlewares globaux pour parser le JSON (avec support des fichiers lourds)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🛠️ NETTOYAGE : L'ancien middleware app.use('/uploads', ...) a été supprimé d'ici !
// Vos fichiers transitent désormais directement par la mémoire tampon vers Supabase.

// 8. Déclaration de toutes tes routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/project', require('./routes/project'));

// 9. Route de test globale
app.get('/', (req, res) => {
    res.send("L'API d'HITAS Connect fonctionne à merveille ! 🚀");
});

// 10. Démarrage du serveur d'écoute (⚠️ Modifié app.listen par server.listen)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Le serveur a démarré sur le port ${PORT} avec support Temps Réel WebSockets.`);
});