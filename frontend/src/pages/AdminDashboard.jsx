import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 1. Charger les utilisateurs au montage du composant
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // On récupère le token stocké au login
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await API.get('/admin/users', config);
        setUsers(response.data);
      } catch (err) {
        console.error("Erreur d'accès admin:", err);
        // Si l'utilisateur n'est pas admin, on le dégage à l'accueil
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // 2. Fonction pour valider ou suspendre un utilisateur
  const handleToggleVerify = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const newStatus = !currentStatus;

      const response = await API.put(`/admin/verify-user/${userId}`, { isVerified: newStatus }, config);
      
      // Mettre à jour l'état local pour changer instantanément l'affichage du bouton
      setUsers(users.map(user => user._id === userId ? { ...user, isVerified: newStatus } : user));
      setMessage(response.data.message);
      
      // Effacer le message flash après 3 secondes
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error("Erreur lors de la modification du statut:", err);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">Chargement du panel admin...</div>;

  return (
    <div className="min-h-screen bg-[#030014] text-zinc-50 p-6 font-sans antialiased">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
          Panel Administration HITAS Connect
        </h1>
        <p className="text-zinc-400 text-sm mb-6">Gère la validation et la sécurité des accès étudiants et alumni.</p>

        {message && (
          <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs rounded-xl">
            {message}
          </div>
        )}

        <div className="bg-[#0b081e]/40 border border-indigo-950/60 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-indigo-950/80 bg-[#030014]/50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Email</th>
                <th className="p-4">Rôle</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/40 text-sm">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-indigo-950/10 transition-colors">
                  <td className="p-4 font-medium text-zinc-200">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs rounded-full bg-zinc-800 text-zinc-300 capitalize font-medium">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.isVerified ? (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        ● Validé
                      </span>
                    ) : (
                      <span className="text-amber-400 text-xs font-semibold flex items-center gap-1">
                        ○ En attente
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleVerify(user._id, user.isVerified)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          user.isVerified
                            ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {user.isVerified ? 'Bloquer' : 'Valider'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;