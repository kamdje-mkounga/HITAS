import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import API from '../services/api';

const ProfileProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const [checking, setChecking] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const verifyProfileStatus = async () => {
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        // On demande directement au backend l'état du profil
        const response = await API.get('/profile/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token
          }
        });

        // 🎯 Condition stricte : l'utilisateur doit avoir rempli TOUS les champs obligatoires
        const p = response.data;
        if (p && p.firstName && p.lastName && p.promotion && p.specialty && p.currentLocation && p.bio) {
          setIsComplete(true);
          localStorage.setItem('isProfileComplete', 'true');
        } else {
          setIsComplete(false);
          localStorage.removeItem('isProfileComplete');
        }
      } catch (err) {
        console.error("Erreur vérification profil", err);
        setIsComplete(false);
        localStorage.removeItem('isProfileComplete');
      } finally {
        setChecking(false);
      }
    };

    verifyProfileStatus();
  }, [token]);

  // Pendant la vérification avec le serveur, on affiche un écran d'attente propre
  if (checking) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center text-zinc-400 font-bold tracking-widest uppercase text-xs">
        <div className="animate-pulse">   <span className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">Vérification des accès en cours......</span></div>
      </div>
    );
  }

  // Si pas de jeton, redirection vers le login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🔥 Si le profil n'est pas strictement complet, REDIRECTION FORCÉE ET INDÉPASSABLE
  if (!isComplete) {
    return <Navigate to="/profil?reason=incomplete" replace />;
  }

  // Si tout est validé par le serveur, on ouvre l'accès aux pages (Blog, Annuaire, etc.)
  return <Outlet />;
};

export default ProfileProtectedRoute;