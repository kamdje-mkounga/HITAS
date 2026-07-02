import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AutoLogout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  // Temps avant déconnexion : 5 minutes (5 * 60 * 1000 ms)
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; 

  const handleLogout = () => {
    // Nettoyage des données de session
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    alert("🔒 Votre session a expiré pour cause d'inactivité. Veuillez vous reconnecter.");
    navigate('/login');
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // On n'active pas la surveillance sur les pages d'authentification
    const publicPages = ['/login', '/register'];
    if (publicPages.includes(location.pathname)) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Liste des événements qui prouvent que l'utilisateur est actif
    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    // Initialisation ou réinitialisation du timer au changement de page
    resetTimer();

    // Ajout des écouteurs d'événements globaux
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Nettoyage à la destruction du composant
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [location.pathname]);

  return children;
}

export default AutoLogout;