import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { reviewUserRegistration } from '../services/api';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error("Erreur d'accès admin:", err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getEffectiveStatus = (user) => {
    if (user.approvalStatus) return user.approvalStatus;
    return user.isVerified ? 'approved' : 'pending';
  };

  const handleReviewDecision = async (userId, decision) => {
    try {
      setActionLoadingId(userId);
      const reason = rejectionReasons[userId] || '';
      const response = await reviewUserRegistration(userId, {
        decision,
        rejectionReason: decision === 'rejected' ? reason : '',
      });

      const updated = response.user;
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, ...updated } : u))
      );
      setMessage(response.message);
      setTimeout(() => setMessage(''), 3500);
    } catch (err) {
      console.error('Erreur lors de la décision admin:', err);
      setMessage(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (filterStatus === 'all') return true;
    return getEffectiveStatus(u) === filterStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
        Chargement du panel admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-zinc-50 p-6 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
              Panel Administration HITAS Connect
            </h1>
            <p className="text-zinc-400 text-sm">
              Vérifiez le profil complet soumis par chaque étudiant ou alumni et autorisez ou refusez l&apos;accès.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'pending', label: 'En attente' },
              { key: 'approved', label: 'Approuvés' },
              { key: 'rejected', label: 'Refusés' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterStatus === tab.key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs rounded-xl">
            {message}
          </div>
        )}

        <div className="bg-[#0b081e]/40 border border-indigo-950/60 rounded-2xl overflow-x-auto backdrop-blur-md">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-indigo-950/80 bg-[#030014]/50 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Utilisateur &amp; Profil</th>
                <th className="p-4">Promo &amp; Spécialité</th>
                <th className="p-4">Localisation</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Décision Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-950/40 text-sm">
              {filteredUsers.map((user) => {
                const status = getEffectiveStatus(user);
                const p = user.profile;

                return (
                  <tr key={user._id} className="hover:bg-indigo-950/10 transition-colors align-top">
                    <td className="p-4">
                      <div className="font-semibold text-zinc-100">
                        {p?.firstName || p?.lastName
                          ? `${p.firstName || ''} ${p.lastName || ''}`.trim()
                          : 'Profil non renseigné'}
                      </div>
                      <div className="text-xs text-zinc-400">{user.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[11px] rounded-full bg-zinc-800 text-zinc-300 capitalize">
                        {user.role}
                      </span>
                    </td>

                    <td className="p-4 text-xs text-zinc-300">
                      <div>
                        <span className="font-semibold text-indigo-300">
                          {p?.promotion ? `Promo ${p.promotion}` : 'Promo —'}
                        </span>
                        {p?.degreeLevel ? ` • ${p.degreeLevel}` : ''}
                      </div>
                      <div className="mt-1 text-zinc-400">{p?.specialty || 'Spécialité —'}</div>
                      {p?.status && (
                        <div className="mt-1 text-[11px] text-zinc-500">
                          {p.status}
                          {p.currentCompany ? ` — ${p.currentCompany}` : ''}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-xs text-zinc-300">
                      <div>{p?.currentLocation || '—'}</div>
                      {(p?.city || p?.country) && (
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {[p.city, p.country].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {status === 'approved' && (
                        <span className="text-emerald-400 text-xs font-semibold">● Approuvé</span>
                      )}
                      {status === 'pending' && (
                        <span className="text-amber-400 text-xs font-semibold">○ En attente</span>
                      )}
                      {status === 'rejected' && (
                        <div>
                          <span className="text-red-400 text-xs font-semibold">✕ Refusé</span>
                          {user.rejectionReason && (
                            <p className="text-[11px] text-red-300/80 mt-1 max-w-[180px]">
                              Motif : {user.rejectionReason}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {user.role !== 'admin' && (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={actionLoadingId === user._id || status === 'approved'}
                              onClick={() => handleReviewDecision(user._id, 'approved')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 disabled:opacity-40 cursor-pointer"
                            >
                              Autoriser
                            </button>
                            <button
                              type="button"
                              disabled={actionLoadingId === user._id || status === 'rejected'}
                              onClick={() => handleReviewDecision(user._id, 'rejected')}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 disabled:opacity-40 cursor-pointer"
                            >
                              Refuser
                            </button>
                          </div>
                          <input
                            type="text"
                            value={rejectionReasons[user._id] || ''}
                            onChange={(e) =>
                              setRejectionReasons((prev) => ({
                                ...prev,
                                [user._id]: e.target.value,
                              }))
                            }
                            placeholder="Motif du refus (optionnel)"
                            className="w-52 px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-xs text-zinc-400">
                    Aucun utilisateur trouvé pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;