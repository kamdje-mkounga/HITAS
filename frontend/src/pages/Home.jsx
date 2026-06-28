import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased">
      {/* Notre nouvelle barre de navigation */}
      <Navbar />

      {/* Contenu Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Le hub de la communauté étudiante d'HITAS
          </h1>
          <p className="text-zinc-400 text-lg">
            Connecte-toi avec la diaspora, partage des opportunités et propulse tes projets techniques.
          </p>
        </div>

        {/* Grille des modules principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Carte Annuaire */}
          <Link to="/annuaire" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">👤</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">Annuaire</h3>
              <p className="text-zinc-400 text-sm">Trouve et contacte les étudiants basés en Inde, en France ou au Cameroun.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              Explorer l'annuaire →
            </span>
          </Link>

          {/* Carte Blog */}
          <Link to="/blog" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">📝</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">Blog d'Entraide</h3>
              <p className="text-zinc-400 text-sm">Découvre les guides d'installation, astuces pour les visas et partages d'expériences.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              Lire les articles →
            </span>
          </Link>

          {/* Carte Showcase */}
          <Link to="/showcase" className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4 bg-zinc-950 w-12 h-12 flex items-center justify-center rounded-xl border border-zinc-800">🚀</div>
              <h3 className="font-bold text-zinc-100 text-lg mb-1 group-hover:text-white transition-colors">Showcase</h3>
              <p className="text-zinc-400 text-sm">Expose tes créations et tes codes pour valoriser le savoir-faire de l'école.</p>
            </div>
            <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 mt-6 flex items-center gap-1 transition-colors">
              Voir les projets →
            </span>
          </Link>

        </div>

      </main>
    </div>
  );
}

export default Home;