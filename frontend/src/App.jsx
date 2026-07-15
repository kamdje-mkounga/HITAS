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
import NotificationBadge from "./components/NotificationBadge";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      {/* 🔒 AutoLogout enveloppe toutes les routes pour suivre l'activité sur tout le site */}
      <AutoLogout>
        <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 
          
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/annuaire" element={<PrivateRoute><Annuaire /></PrivateRoute>} />
          <Route path="/blog" element={<PrivateRoute><Blog /></PrivateRoute>} />
          
          <Route path="/showcase" element={
            <PrivateRoute>
              <Showcase />
            </PrivateRoute>
          } />

          <Route path="/profil" element={
            <PrivateRoute>
              <Profil /> 
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />

          <Route path="/profile/:id" element={<PublicProfile />} />

        </Routes>
      </AutoLogout>
    </Router>
  );
}

export default App;