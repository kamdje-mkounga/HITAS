import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import { io } from 'socket.io-client';

// 🌐 CONFIGURATION DE L'URL DU BACKEND (Local vs Render)
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://hitas.onrender.com'; 

// Initialisation du socket connecté au serveur Render
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

// --- COMPOSANT ORBITING LOGO ---
function OrbitingLogo() {
  return (
    <div className="relative w-32 h-32 mx-auto my-6 flex items-center justify-center">
      {/* Tu peux replacer ici le code SVG ou l'image exacte de ton logo animé */}
      <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-xl font-bold text-zinc-200">
        HITAS
      </div>
    </div>
  );
}

function Home() {
  const [unreadCount, setUnreadCount] = useState(0);

  // --- 1. CHARGEMENT INITIAL DES COMPTEURS ---
  useEffect(() => {
    const fetchArticlesAndCalculateUnread = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/posts`); 
        const articles = response.data || [];
        const lastViewedBlog = localStorage.getItem('last_viewed_blog');
        
        if (!lastViewedBlog) {
          setUnreadCount(articles.length);
          return;
        }

        const lastViewedDate = new Date(lastViewedBlog);
        const unreadArticles = articles.filter(article => {
          if (!article.date) return false;
          const articleDate = new Date(article.date);
          return articleDate > lastViewedDate;
        });

        setUnreadCount(unreadArticles.length);
      } catch (error) {
        console.error("Erreur initialisation des notifications:", error);
      }
    };

    fetchArticlesAndCalculateUnread();
  }, []);

  // --- 2. ÉCOUTE DES ÉVÉNEMENTS EN TEMPS RÉEL ---
  useEffect(() => {
    socket.on('article_published', (newArticle) => {
      console.log("Notification reçue en direct du serveur Render :", newArticle);
      const lastViewedBlog = localStorage.getItem('last_viewed_blog');
      
      if (!lastViewedBlog) {
        setUnreadCount(prev => prev + 1);
        return;
      }

      const lastViewedDate = new Date(lastViewedBlog);
      const articleDate = new Date(newArticle.date);

      if (articleDate > lastViewedDate) {
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      socket.off('article_published');
    };
  }, []);

  // --- 3. SÉCURISATION DU CLIC ET RESET ---
  const handleBlogClick = () => {
    localStorage.setItem('last_viewed_blog', new Date().toISOString());
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 px-2">
            Le hub de la communauté étudiante de HITAS
          </h1>
          
          <OrbitingLogo />

          <p className="text-zinc-400 text-lg mt-4 px-4">
            Connecte-toi avec la diaspora, partage des opportunités et propulse tes projets techniques.
          </p>
        </div>

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

          {/* Carte Blog d'Entraide */}
          <Link 
            to="/blog" 
            onClick={handleBlogClick}
            className="group p-6 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="relative w-12 h-12 mb-4">
                <div className="w-full h-full text-3xl bg-zinc-950 flex items-center justify-center rounded-xl border border-zinc-800">
                  📝
                </div>
                
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white animate-pulse shadow-md border-2 border-zinc-900">
                    {unreadCount}
                  </span>
                )}
              </div>

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