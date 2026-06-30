import axios from 'axios';

// 1. INITIALISATION DE L'API D'ABORD
const API = axios.create({
  baseURL: 'https://hitas.onrender.com/api',
});

// 2. CONFIGURATION DE L'INTERCEPTEUR AUTOMATIQUE
// Ce bloc s'exécutera AVANT chaque requête sortante
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // On s'assure que le token existe et n'est pas une chaîne fantôme
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers['x-auth-token'] = token;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. EXPORT DES FONCTIONS DE REQUÊTES (Encapsulation)
// Récupération du profil
export const getProfile = async () => {
  const response = await API.get('/profile/me');
  return response.data;
};

// Récupération des publications
export const getPosts = async () => {
  const response = await API.get('/posts');
  return response.data;
};

// Récupération des projets
export const getProjects = async () => {
  const response = await API.get('/project');
  return response.data;
};

// On exporte aussi l'instance de base au cas où tu en as besoin ailleurs
export default API;