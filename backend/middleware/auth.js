const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Récupérer le token (vérifie à la fois le header x-auth-token et Authorization Bearer)
  let token = req.header('x-auth-token') || req.header('Authorization');

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }

  // Si pas de token
  if (!token) {
    return res.status(401).json({ message: 'Pas de jeton, autorisation refusée.' });
  }

  try {
    // 2. Vérification du jeton avec la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Injection sécurisée de l'utilisateur
    // Assurez-vous que la structure correspond (decoded.user ou decoded.id selon votre payload)
    req.user = decoded.user || decoded; 
    
    next();
  } catch (err) {
    console.error("❌ ÉCHEC DE VALIDATION JWT :", err.message);
    return res.status(401).json({ message: 'Le jeton n’est pas valide ou a expiré.' });
  }
};