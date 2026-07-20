const admin = require('firebase-admin');
const serviceAccount = require("./firebase-admin.json");

// On vérifie que admin.apps est bien défini et vide avant d'initialiser
if (!admin.apps || admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin SDK connecté avec succès au projet :", serviceAccount.project_id);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de Firebase Admin :", error.message);
  }
}

module.exports = admin;