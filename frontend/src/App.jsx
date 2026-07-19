import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Annuaire from './pages/Annuaire';
import Blog from './pages/Blog';
import Showcase from './pages/Showcase'; 
import Profil from './pages/Profil'; 
import AutoLogout from './components/AutoLogout'; // 👈 On importe le composant de déconnexion automatique
import PublicProfile from './pages/PublicProfile'; // Ajuste le chemin selon ton dossier
import AdminDashboard from './pages/AdminDashboard';
import ProfileProtectedRoute from './components/ProfileProtectedRoute';
import NotificationPermission from "./components/NotificationPermission";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <NotificationPermission />
      {/* 🔒 AutoLogout enveloppe toutes les routes pour suivre l'activité sur tout le site */}
      <AutoLogout>
        <Routes>
          {/* 🌐 Routes Publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          
          {/* 🛠️ Tableau de bord Admin */}
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />

          {/* 📝 Page Profil (Accessible pour remplir les données manquantes) */}
          <Route path="/profil" element={
            <PrivateRoute>
              <Profil /> 
            </PrivateRoute>
          } />
          
          {/* 🛡️ Profils Publics */}
          <Route path="/profile/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />

          {/* 🔒 Routes Protégées par le Profil Complet */}
          {/* Si le profil n'est pas complété, l'utilisateur sera redirigé de force vers /profil */}
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