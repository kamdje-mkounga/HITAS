import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = 'http://localhost:5000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNavbarProfile = async () => {
      // Si pas de token, on reste sur l'avatar par défaut
      if (!token) return; 

      try {
        const res = await axios.get(`${BACKEND_URL}/api/profile/me`, {
          headers: { 'x-auth-token': token }
        });
        
        // Si l'utilisateur a un avatar enregistré en BDD
        if (res.data && res.data.avatar) {
          setAvatar(`${BACKEND_URL}${res.data.avatar}`);
        }
      } catch (err) {
        console.error("Impossible de récupérer l'avatar de la navbar", err);
      }
    };

    fetchNavbarProfile();
    
    // Optionnel : Écouter un événement personnalisé si l'utilisateur change sa photo en direct
    window.addEventListener('avatarUpdated', () => fetchNavbarProfile());
    return () => window.removeEventListener('avatarUpdated', () => fetchNavbarProfile());
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav className="bg-black text-white p-4 flex justify-between items-center border-b border-white/5">
      <Link to="/" className="text-xl font-bold tracking-wider">HITAS <span className="font-light text-gray-400">Connect</span></Link>
      
      <div className="flex items-center gap-6">
        <Link to="/annuaire" className="text-sm text-gray-300 hover:text-white">Annuaire</Link>
        <Link to="/blog" className="text-sm text-gray-300 hover:text-white">Blog & Entraide</Link>
        <Link to="/showcase" className="text-sm text-gray-300 hover:text-white">Showcase</Link>
        
        {token ? (
          <div className="flex items-center gap-3">
            <Link to="/profil" className="flex items-center gap-2 text-sm text-gray-300 hover:text-white">
              {/* 📸 L'image dynamique de l'étudiant */}
              <img 
                src={avatar || 'https://via.placeholder.com/150'} // Remplace par ton image de ninja par défaut si null
                alt="Profil" 
                className="w-8 h-8 rounded-full object-cover border border-white/20"
              />
              <span>Mon Profil</span>
            </Link>
            <button onClick={handleLogout} className="text-xs bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-zinc-800">
              Déconnexion
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-sm bg-white text-black px-4 py-1.5 rounded-lg font-semibold">Connexion</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;