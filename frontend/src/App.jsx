import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Annuaire from './pages/Annuaire';
import Blog from './pages/Blog';
import Showcase from './pages/Showcase'; 
import Profil from './pages/Profil'; 
import AutoLogout from './components/AutoLogout'; 
import PublicProfile from './pages/PublicProfile'; 
import AdminDashboard from './pages/AdminDashboard';
import ProfileProtectedRoute from './components/ProfileProtectedRoute';
import NotificationPermission from "./components/NotificationPermission";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const BACKEND_URL = "https://hitas.onrender.com";

function App() {
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId');

  // 🌓 Synchronisation globale du thème au chargement de l'application
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, []);

  // 🍏 iOS PWA Helper: Initialise et nettoie les anomalies de badges au rechargement
  useEffect(() => {
    const clearInitialBadges = async () => {
      if ('clearAppBadge' in navigator) {
        try {
          const currentToken = localStorage.getItem('token');
          if (!currentToken) {
            await navigator.clearAppBadge();
          }
        } catch (err) {
          console.log("Erreur d'initialisation du badge:", err);
        }
      }
    };
    clearInitialBadges();
  }, []);

  // 🌐 ÉCOUTE GLOBALE DES SOCKETS (Fonctionne désormais sur TOUTES les pages du site)
  useEffect(() => {
    if (!token || !loggedInUserId) return;

    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('article_published', (newPost) => {
      if (!newPost || !newPost.user) return;

      const rawAuthorId = typeof newPost.user === 'object' ? newPost.user._id : newPost.user;
      const postAuthorId = String(rawAuthorId).trim();
      const myId = String(loggedInUserId).trim();

      // Si c'est le post de quelqu'un d'autre -> On active l'indicateur global
      if (postAuthorId !== myId) {
        setHasNewNotification(true);
      }
    });

    return () => {
      socket.off('article_published');
      socket.disconnect();
    };
  }, [token, loggedInUserId]);

  // 🔄 Écoute du retour au premier plan pour rafraîchir l'état si l'onglet était en veille
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("🔄 Application active, vérification des états globaux...");
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <Router>
      {/* 🔔 Gère la demande de permission FCM */}
      <NotificationPermission />
      
      {/* 🔒 AutoLogout enveloppe toutes les routes */}
      <AutoLogout>
        <Routes>
          {/* 🌐 Routes Publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          
          {/* 🛠️ Tableau de bord Admin */}
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

          {/* 📝 Page Profil */}
          <Route path="/profil" element={
            <PrivateRoute>
              <Profil /> 
            </PrivateRoute>
          } />
          
          {/* 🛡️ Profils Publics */}
          <Route path="/profile/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />

          {/* 🔒 Routes Protégées par le Profil Complet */}
          <Route element={<ProfileProtectedRoute />}>
            <Route path="/" element={<PrivateRoute><Home hasNewNotification={hasNewNotification} clearNotifications={() => setHasNewNotification(false)} /></PrivateRoute>} />
            <Route path="/annuaire" element={<PrivateRoute><Annuaire hasNewNotification={hasNewNotification} clearNotifications={() => setHasNewNotification(false)} /></PrivateRoute>} />
            <Route path="/blog" element={<PrivateRoute><Blog hasNewNotification={hasNewNotification} clearNotifications={() => setHasNewNotification(false)} /></PrivateRoute>} />
            <Route path="/showcase" element={<PrivateRoute><Showcase hasNewNotification={hasNewNotification} clearNotifications={() => setHasNewNotification(false)} /></PrivateRoute>} />
          </Route>

          {/* 🔀 Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AutoLogout>
    </Router>
  );
}

export default App;