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

// 🖼️ Importation propre de l'image par Vite
import tradPattern from './assets/traditional.jpg';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const BACKEND_URL = "https://hitas.onrender.com";

function App() {
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const token = localStorage.getItem('token');
  const loggedInUserId = localStorage.getItem('userId');

  // 🌓 Synchronisation globale du thème au chargement
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, []);

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

      if (postAuthorId !== myId) {
        setHasNewNotification(true);
      }
    });

    return () => {
      socket.off('article_published');
      socket.disconnect();
    };
  }, [token, loggedInUserId]);

  return (
    <Router>
      {/* 🌟 Conteneur global avec l'image de fond et le filtre dynamique lié aux variables CSS */}
      <div 
        style={{
          backgroundImage: `url(${tradPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100dvh',
          width: '100%',
          filter: 'brightness(var(--bg-brightness)) contrast(var(--bg-contrast))',
          transition: 'filter 0.3s ease'
        }}
      >
        <NotificationPermission />
        
        <AutoLogout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> 
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
            <Route path="/profile/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />

            <Route element={<ProfileProtectedRoute />}>
              <Route path="/" element={<PrivateRoute><Home hasNewNotification={hasNewNotification} clearNotifications={() => setHasNewNotification(false)} /></PrivateRoute>} />
              <Route path="/annuaire" element={<PrivateRoute><Annuaire hasNewNotification={hasNewNotification} clearNotifications={() => setHasNewNotification(false)} /></PrivateRoute>} />
              <Route path="/blog" element={<PrivateRoute><Blog hasNewNotification={hasNewNotification} clearNotifications={() => setHasNewNotification(false)} /></PrivateRoute>} />
              <Route path="/showcase" element={<PrivateRoute><Showcase hasNewNotification={hasNewNotification} clearNotifications={() => setHasNewNotification(false)} /></PrivateRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AutoLogout>
      </div>
    </Router>
  );
}

export default App;