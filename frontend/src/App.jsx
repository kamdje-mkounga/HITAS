import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  
  // 🍏 iOS PWA Helper: Initialise et nettoie les anomalies de badges au rechargement complet de l'App
  useEffect(() => {
    const clearInitialBadges = async () => {
      if ('clearAppBadge' in navigator) {
        try {
          // Si l'utilisateur ouvre l'application, on peut choisir de remettre à zéro le compteur global du téléphone
          const token = localStorage.getItem('token');
          if (!token) {
            await navigator.clearAppBadge();
          }
        } catch (err) {
          console.log("Erreur d'initialisation du badge:", err);
        }
      }
    };
    clearInitialBadges();
  }, []);

  return (
    <Router>
      {/* 🔔 Gère la demande de permission FCM et la transmission du token au backend */}
      <NotificationPermission />
      
      {/* 🔒 AutoLogout enveloppe toutes les routes pour suivre l'activité sur tout le site */}
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
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/annuaire" element={<PrivateRoute><Annuaire /></PrivateRoute>} />
            <Route path="/blog" element={<PrivateRoute><Blog /></PrivateRoute>} />
            <Route path="/showcase" element={<PrivateRoute><Showcase /></PrivateRoute>} />
          </Route>

          {/* 🔀 Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AutoLogout>
    </Router>
  );
}

export default App;