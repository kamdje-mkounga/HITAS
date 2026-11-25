import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import API from '../services/api';

const ProfileProtectedRoute = () => {
  const token = localStorage.getItem('token');
  const [checking, setChecking] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isApproved, setIsApproved] = useState(true);

  useEffect(() => {
    const verifyAccessAndProfile = async () => {
      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const response = await API.get('/profile/me');
        const p = response.data;

        const userObj = p?.user && typeof p.user === 'object' ? p.user : null;
        const role = userObj?.role || localStorage.getItem('userRole');
        const approvalStatus = userObj?.approvalStatus || localStorage.getItem('approvalStatus') || 'approved';

        if (role === 'admin' || approvalStatus === 'approved') {
          setIsApproved(true);
        } else {
          setIsApproved(false);
          localStorage.removeItem('token');
          localStorage.setItem('approvalStatus', approvalStatus);
        }

        const hasRequiredFields = Boolean(
          p &&
          p.firstName &&
          p.lastName &&
          p.promotion &&
          p.specialty &&
          p.currentLocation
        );

        if (hasRequiredFields) {
          setIsComplete(true);
          localStorage.setItem('isProfileComplete', 'true');
        } else {
          setIsComplete(false);
          localStorage.removeItem('isProfileComplete');
        }
      } catch (err) {
        if (err.response?.status === 403 && err.response?.data?.approvalStatus) {
          setIsApproved(false);
          localStorage.removeItem('token');
          localStorage.setItem('approvalStatus', err.response.data.approvalStatus);
        } else {
          console.error('Erreur vérification profil', err);
          setIsComplete(false);
          localStorage.removeItem('isProfileComplete');
        }
      } finally {
        setChecking(false);
      }
    };

    verifyAccessAndProfile();
  }, [token]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400 text-xs font-semibold tracking-widest uppercase">
            Chargement du profil...
          </span>
        </div>
      </div>
    );
  }

  if (!token || !isApproved) {
    return <Navigate to="/login" replace />;
  }

  if (!isComplete) {
    return <Navigate to="/profil?reason=incomplete" replace />;
  }

  return <Outlet />;
};

export default ProfileProtectedRoute;