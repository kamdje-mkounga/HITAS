import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProfileProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const isProfileComplete = localStorage.getItem('isProfileComplete') === 'true';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si le profil n'est pas rempli, on force la redirection vers l'édition de profil
  if (!isProfileComplete) {
    return <Navigate to="/profil?reason=incomplete" replace />;
  }

  return <Outlet />;
};

export default ProfileProtectedRoute;