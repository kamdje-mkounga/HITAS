// 1. CHARGER LE .ENV EN TOUT PREMIER (Ligne 1)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// 2. Les autres imports (maintenant ils ont accès aux variables d'environnement)
const express = require('express');
const cors = require('cors'); 
const connectDB = require('./config/db'); 

// 3. Connexion à la base de données MongoDB
connectDB();

// 4. Initialisation de l'application Express
const app = express();

// 5. Configuration du CORS
app.use(cors({
  origin: '*',
  //origin: 'http://localhost:5173', 
  credentials: true
}));

// 6. Middlewares globaux pour parser le JSON (avec support des fichiers lourds)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 7. Servir le dossier 'uploads' de manière statique pour l'accès aux photos de profil
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 8. Déclaration de toutes tes routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/project', require('./routes/project'));

// 9. Route de test globale
app.get('/', (req, res) => {
    res.send("L'API d'HITAS Connect fonctionne à merveille ! 🚀");
});
//const a=10;

// 10. Démarrage du serveur d'écoute
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Le serveur a démarré sur le port ${PORT}`);
});