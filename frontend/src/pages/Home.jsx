import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import axios from 'axios'; 
import { io } from 'socket.io-client';

// 🌐 CONFIGURATION D'ACCÈS AU BACKEND (Local vs Render)
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://hitas.onrender.com'; 

// Initialisation unique du socket connecté à ton serveur Render
const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

function Home() {
  const [unreadCount, setUnreadCount] = useState(0);

  // --- 1. CHARGEMENT INITIAL DES COMPTEURS ---
  useEffect(() => {
    const fetchArticlesAndCalculateUnread = async () => {
      try {
        // Requête HTTP directe sur l'API de ton serveur Render
        const response = await axios.get(`${BACKEND_URL}/api/posts`); 
        const articles = response.data || [];
        const lastViewedBlog = localStorage.getItem('last_viewed_blog');
        
        // Si l'utilisateur n'a jamais cliqué sur le blog, on affiche le total global
        if (!lastViewedBlog) {
          setUnreadCount(articles.length);
          return;
        }

        const lastViewedDate = new Date(lastViewedBlog);
        
        // Filtrer les articles plus récents que la date stockée
        const unreadArticles = articles.filter(article => {
          if (!article.date) return false;
          const articleDate = new Date(article.date);
          return articleDate > lastViewedDate;
        });

        setUnreadCount(unreadArticles.length);
      } catch (error) {
        console.error("Erreur lors de l'initialisation des notifications:", error);
      }
    };

    fetchArticlesAndCalculateUnread();
  }, []);

  // --- 2. ÉCOUTE DE L'ÉVÉNEMENT TEMPS RÉEL (SOCKET.IO) ---
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

      // Si le nouvel article est plus récent que la dernière visite, on incrémente le badge
      if (articleDate > lastViewedDate) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Nettoyage de l'écouteur à la fermeture du composant
    return () => {
      socket.off('article_published');
    };
  }, []);

  // --- 3. CLIC SUR LE BOUTON : RÉINITIALISATION ---
  const handleBlogClick = () => {
    localStorage.setItem('last_viewed_blog', new Date().toISOString());
    setUnreadCount(0);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col font-sans antialiased">
      <Navbar />
      
      {/* Conteneur principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl mx-auto text-center">
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Le hub de la communauté <br />
          <span className="text-indigo-500">étudiante de HITAS</span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mb-12">
          Connecte-toi avec la diaspora, partage des opportunités et profite des ressources techniques.
        </p>

        {/* Section des Grilles de navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          
          {/* Carte Blog d'Entraide avec sa bulle de notification */}
          <Link 
            to="/blog" 
            onClick={handleBlogClick}
            className="group relative bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-indigo-600/10 transition-colors duration-300 relative">
                {/* Icône Document de notification */}
                <span className="text-2xl" role="img" aria-label="blog">📝</span>
                
                {/* Bulle de notification dynamique */}
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-md shadow-red-500/50">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors duration-300">
                Blog d'Entraide
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Découvre les guides partagés, pose tes questions et trouve des astuces pour les cours.
              </p>
            </div>
          </Link>

          {/* Exemple d'une deuxième carte (ex: Projets ou Profil) */}
          <Link 
            to="/projects" 
            className="group bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-zinc-800 rounded-xl group-hover:bg-emerald-600/10 transition-colors duration-300">
                <span className="text-2xl" role="img" aria-label="projects">🚀</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                Projets Étudiants
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Explore les créations de la communauté et rejoins des équipes de développement.
              </p>
            </div>
          </Link>

        </div>
      </main>
    </div>
  );
}

export default Home;