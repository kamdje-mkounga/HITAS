import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="w-full bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-black tracking-tight text-zinc-50">
          HITAS <span className="text-zinc-400 font-light">Connect</span>
        </Link>

       {/* Liens de navigation centraux */}
       <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-zinc-400">
          <Link to="/" className="hover:text-zinc-100 transition-colors">Accueil</Link>
          <Link to="/annuaire" className="hover:text-zinc-100 transition-colors">Annuaire</Link>
          <Link to="/blog" className="hover:text-zinc-100 transition-colors">Blog & Entraide</Link>
          <Link to="/showcase" className="hover:text-zinc-100 transition-colors">Showcase</Link>
        </div>

       
       



       {/* Boutons d'action à droite */}
       <div className="flex items-center space-x-3">
          <Link
            to="/profil"
            className="px-3 py-1.5 text-zinc-400 hover:text-zinc-100 text-xs font-semibold transition-colors"
          >
            ⚙️ Mon Profil
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 text-xs font-semibold rounded-lg transition-all"
          >
            Déconnexion
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;