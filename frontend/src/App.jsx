import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Annuaire from './pages/Annuaire';
import Blog from './pages/Blog';
import Showcase from './pages/Showcase'; 
import Profil from './pages/Profil'; // 👈 ON GARDE UNIQUEMENT CELUI-CI (SANS "E")

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
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

        {/* 🚀 LA ROUTE CORRIGÉE ICI AVEC <Profil /> */}
        <Route path="/profil" element={
          <PrivateRoute>
            <Profil /> 
          </PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;