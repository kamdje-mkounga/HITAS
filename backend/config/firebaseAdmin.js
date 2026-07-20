const admin = require('firebase-admin');
const serviceAccount = require("./firebase-admin.json");

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin SDK connecté avec succès au projet :", serviceAccount.project_id);
  } catch (error) {
    console.error("❌ Erreur lors de la lecture des identifiants Firebase :", error.message);
  }
}

module.exports = admin;