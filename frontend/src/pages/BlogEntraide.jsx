import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Trash2,
  Send,
  Layers,
  MessageCircle,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import Navbar from '../components/Navbar';
import tradPattern from '../assets/traditional.jpg';

const BlogEntraide = ({ hasNewNotification, clearNotifications }) => {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('General');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const socketRef = useRef(null);

  const BACKEND_URL = 'https://hitas.onrender.com';
  const loggedInUserId = localStorage.getItem('userId') || '';

  /* =========================================================
     UTILITAIRES
  ========================================================= */

  const formatMediaUrl = (url) => {
    if (!url) return '';

    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {
      return url;
    }

    return `${BACKEND_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');

    return {
      headers: {
        'x-auth-token': token
      }
    };
  };

  const getUserId = (userField) => {
    if (!userField) return '';

    return typeof userField === 'object'
      ? userField._id
      : userField;
  };

  /* =========================================================
     CHARGEMENT DES POSTS
  ========================================================= */

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${BACKEND_URL}/api/posts`
      );

      setPosts(res.data);
    } catch (err) {
      console.error(err);

      setError(
        'Impossible de charger les publications.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    if (clearNotifications) {
      clearNotifications();
    }
  }, [clearNotifications]);

  /* =========================================================
     SOCKET.IO
  ========================================================= */

  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    const handleCreated = (newPost) => {
      setPosts((prevPosts) => {
        if (
          prevPosts.some(
            (post) => post._id === newPost._id
          )
        ) {
          return prevPosts;
        }

        return [newPost, ...prevPosts];
      });
    };

    const handleDeleted = (deletedPostId) => {
      setPosts((prevPosts) =>
        prevPosts.filter(
          (post) => post._id !== deletedPostId
        )
      );
    };

    const handleUpdated = (updatedPost) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );
    };

    const handleInteractions = (updatedPost) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );
    };

    socket.on(
      'posts_created',
      handleCreated
    );

    socket.on(
      'posts_deleted',
      handleDeleted
    );

    socket.on(
      'posts_updated',
      handleUpdated
    );

    socket.on(
      'posts_updated_interactions',
      handleInteractions
    );

    return () => {
      socket.off(
        'posts_created',
        handleCreated
      );

      socket.off(
        'posts_deleted',
        handleDeleted
      );

      socket.off(
        'posts_updated',
        handleUpdated
      );

      socket.off(
        'posts_updated_interactions',
        handleInteractions
      );

      socket.disconnect();
    };
  }, []);

  /* =========================================================
     CRÉATION D'UN POST
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (!text.trim()) {
      setError(
        'Le corps du message ne peut pas être vide.'
      );

      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/posts`,
        {
          text,
          category,
          socketId: socketRef.current?.id
        },
        getAuthHeader()
      );

      setText('');

      setSuccess(
        'Publication partagée avec succès !'
      );

      setTimeout(() => {
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        'Erreur lors de la publication. As-tu bien créé ton profil ?'
      );
    }
  };

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  const handleDelete = async (postId) => {
    if (
      !window.confirm(
        'Es-tu sûr de vouloir supprimer cette publication ?'
      )
    ) {
      return;
    }

    try {
      await axios.delete(
        `${BACKEND_URL}/api/posts/${postId}`,
        getAuthHeader()
      );

    } catch (err) {
      console.error(err);

      alert(
        'Erreur lors de la suppression ou action non autorisée.'
      );
    }
  };

  /* =========================================================
     FILTRES
  ========================================================= */

  const filteredPosts =
    selectedFilter === 'Tous'
      ? posts
      : posts.filter(
          (post) =>
            post.category === selectedFilter
        );

  /* =========================================================
     BADGES
  ========================================================= */

  const getBadgeColor = (cat) => {
    switch (cat) {
      case 'Entraide':
        return `
          bg-purple-500/10
          text-purple-600
          dark:text-purple-400
          border-purple-500/20
        `;

      case 'Stage/Emploi':
        return `
          bg-emerald-500/10
          text-emerald-600
          dark:text-emerald-400
          border-emerald-500/20
        `;

      case 'Logement':
        return `
          bg-amber-500/10
          text-amber-600
          dark:text-amber-400
          border-amber-500/20
        `;

      default:
        return `
          bg-indigo-500/10
          text-indigo-600
          dark:text-indigo-400
          border-indigo-500/20
        `;
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        text-slate-900
        dark:text-zinc-50
        flex
        flex-col
        font-sans
        antialiased
        selection:bg-indigo-500
        selection:text-white
        transition-colors
        duration-300
      "
      style={{
        backgroundColor: 'var(--bg-color)',
        backgroundImage: `
          linear-gradient(
            to bottom,
            var(--home-overlay-1),
            var(--home-overlay-2)
          ),
          url(${tradPattern})
        `,
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
      }}
    >

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar
        hasNewNotification={hasNewNotification}
        clearNotifications={clearNotifications}
      />

      <main
        className="
          flex-1
          w-full
          max-w-2xl
          mx-auto
          px-3
          sm:px-4
          py-6
          sm:py-8
        "
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-6">

          <h1
            className="
              text-2xl
              sm:text-3xl
              font-extrabold
              tracking-tight
              text-slate-900
              dark:text-transparent
              dark:bg-gradient-to-r
              dark:from-white
              dark:via-zinc-200
              dark:to-zinc-400
              dark:bg-clip-text
            "
          >
            Blog & Entraide
          </h1>

          <p
            className="
              mt-1.5
              text-xs
              sm:text-sm
              text-slate-600
              dark:text-zinc-400
            "
          >
            Pose tes questions, partage des opportunités
            ou échange avec la communauté.
          </p>

        </div>

        {/* ===================================================
            FORMULAIRE
        =================================================== */}

        <div
          className="
            bg-white/90
            dark:bg-[#161618]/95
            backdrop-blur-xl
            rounded-2xl
            border
            border-slate-200
            dark:border-zinc-800
            shadow-lg
            mb-6
            overflow-hidden
          "
        >

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-5"
          >

            {/* Textarea */}

            <textarea
              rows="3"
              className="
                w-full
                bg-transparent
                border-0
                outline-none
                resize-none
                text-sm
                sm:text-base
                text-slate-900
                dark:text-zinc-100
                placeholder-slate-400
                dark:placeholder-zinc-600
                leading-relaxed
              "
              placeholder="Que veux-tu partager aujourd'hui ?"
              value={text}
              onChange={(e) =>
                setText(e.target.value)
              }
            />

            {/* Messages */}

            {error && (
              <div
                className="
                  mt-3
                  bg-red-500/10
                  border
                  border-red-500/20
                  text-red-500
                  dark:text-red-400
                  p-2.5
                  rounded-lg
                  text-xs
                "
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="
                  mt-3
                  bg-emerald-500/10
                  border
                  border-emerald-500/20
                  text-emerald-500
                  dark:text-emerald-400
                  p-2.5
                  rounded-lg
                  text-xs
                "
              >
                {success}
              </div>
            )}

            {/* Bottom toolbar */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-3
                mt-3
                pt-3
                border-t
                border-slate-200
                dark:border-zinc-800
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  bg-slate-50
                  dark:bg-[#0d0d0e]
                  border
                  border-slate-200
                  dark:border-zinc-800
                  px-3
                  py-1.5
                  rounded-lg
                  w-fit
                "
              >

                <Layers
                  className="
                    h-3.5
                    w-3.5
                    text-indigo-500
                  "
                />

                <label
                  className="
                    text-[10px]
                    font-semibold
                    text-slate-500
                    dark:text-zinc-500
                    uppercase
                  "
                >
                  Catégorie
                </label>

                <select
                  className="
                    bg-transparent
                    text-xs
                    font-semibold
                    text-slate-800
                    dark:text-zinc-200
                    focus:outline-none
                    cursor-pointer
                  "
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                >

                  <option
                    value="General"
                    className="bg-white dark:bg-[#0d0d0e]"
                  >
                    Général
                  </option>

                  <option
                    value="Entraide"
                    className="bg-white dark:bg-[#0d0d0e]"
                  >
                    Entraide
                  </option>

                  <option
                    value="Stage/Emploi"
                    className="bg-white dark:bg-[#0d0d0e]"
                  >
                    Stage / Emploi
                  </option>

                  <option
                    value="Logement"
                    className="bg-white dark:bg-[#0d0d0e]"
                  >
                    Logement
                  </option>

                </select>

              </div>

              <button
                type="submit"
                className="
                  bg-gradient-to-r
                  from-indigo-600
                  to-purple-600
                  hover:from-indigo-500
                  hover:to-purple-500
                  text-white
                  font-bold
                  px-5
                  py-2
                  rounded-lg
                  text-xs
                  transition-all
                  shadow-md
                  active:scale-[0.98]
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                Publier
                <Send className="h-3.5 w-3.5" />
              </button>

            </div>

          </form>

        </div>

        {/* ===================================================
            FILTRES
        =================================================== */}

        <div
          className="
            flex
            gap-2
            overflow-x-auto
            pb-2
            mb-5
            scrollbar-hide
          "
        >

          {[
            'Tous',
            'General',
            'Entraide',
            'Stage/Emploi',
            'Logement'
          ].map((cat) => (

            <button
              key={cat}
              onClick={() =>
                setSelectedFilter(cat)
              }
              className={`
                flex-shrink-0
                px-3.5
                py-1.5
                rounded-full
                text-[11px]
                font-semibold
                border
                transition-all
                ${
                  selectedFilter === cat
                    ? `
                      bg-gradient-to-r
                      from-indigo-600
                      to-purple-600
                      text-white
                      border-transparent
                      shadow-md
                    `
                    : `
                      bg-white/80
                      dark:bg-[#161618]
                      text-slate-600
                      dark:text-zinc-400
                      border-slate-200
                      dark:border-zinc-800
                      hover:border-indigo-500/50
                    `
                }
              `}
            >

              {cat === 'General'
                ? 'Général'
                : cat === 'Tous'
                ? '📢 Tous'
                : cat === 'Stage/Emploi'
                ? '💼 Stage / Emploi'
                : cat}

            </button>

          ))}

        </div>

        {/* ===================================================
            POSTS
        =================================================== */}

        {loading ? (

          <div
            className="
              text-center
              text-slate-500
              dark:text-zinc-500
              py-12
              text-xs
              font-bold
              tracking-widest
              animate-pulse
            "
          >
            CHARGEMENT DU FIL D'ACTUALITÉ...
          </div>

        ) : filteredPosts.length === 0 ? (

          <div
            className="
              text-center
              text-slate-600
              dark:text-zinc-500
              py-12
              bg-white/80
              dark:bg-[#161618]
              border
              border-slate-200
              dark:border-zinc-800
              rounded-2xl
              text-sm
              shadow-lg
            "
          >
            Aucune publication trouvée
            dans cette catégorie.
          </div>

        ) : (

          <div className="space-y-4">

            {filteredPosts.map((post) => {

              const isOwner =
                getUserId(post.user) ===
                loggedInUserId;

              const hasLikes =
                post.likes?.length > 0;

              const hasComments =
                post.comments?.length > 0;

              return (

                <article
                  key={post._id}
                  className="
                    bg-white
                    dark:bg-[#161618]
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-zinc-800
                    overflow-hidden
                    shadow-sm
                    hover:shadow-md
                    transition-shadow
                  "
                >

                  {/* =========================================
                      POST HEADER
                  ========================================= */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      px-4
                      py-3
                    "
                  >

                    <div className="flex items-center gap-3">

                      {post.avatar ? (

                        <img
                          src={formatMediaUrl(post.avatar)}
                          alt={`${post.firstName} ${post.lastName}`}
                          className="
                            w-10
                            h-10
                            rounded-full
                            object-cover
                            border
                            border-slate-200
                            dark:border-zinc-700
                          "
                        />

                      ) : (

                        <div
                          className="
                            w-10
                            h-10
                            rounded-full
                            bg-gradient-to-br
                            from-indigo-500
                            to-purple-600
                            text-white
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-xs
                            uppercase
                          "
                        >
                          {post.firstName?.[0] || 'U'}
                          {post.lastName?.[0] || ''}
                        </div>

                      )}

                      <div>

                        <h3
                          className="
                            font-semibold
                            text-sm
                            text-slate-900
                            dark:text-zinc-100
                          "
                        >
                          {post.firstName}{' '}
                          {post.lastName}
                        </h3>

                        <div className="flex items-center gap-2">

                          <p
                            className="
                              text-[10px]
                              text-slate-500
                              dark:text-zinc-500
                            "
                          >
                            {new Date(
                              post.date
                            ).toLocaleDateString(
                              'fr-FR',
                              {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </p>

                          <span
                            className={`
                              text-[9px]
                              uppercase
                              font-bold
                              px-1.5
                              py-0.5
                              rounded
                              border
                              ${getBadgeColor(
                                post.category
                              )}
                            `}
                          >
                            {post.category === 'General'
                              ? 'Général'
                              : post.category}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* Menu */}

                    {isOwner ? (

                      <button
                        onClick={() =>
                          handleDelete(post._id)
                        }
                        className="
                          p-2
                          rounded-full
                          text-slate-400
                          dark:text-zinc-500
                          hover:text-red-500
                          hover:bg-red-500/10
                          transition-all
                        "
                        title="Supprimer"
                      >
                        <Trash2
                          size={16}
                        />
                      </button>

                    ) : (

                      <button
                        className="
                          p-2
                          rounded-full
                          text-slate-400
                          dark:text-zinc-500
                          hover:bg-slate-100
                          dark:hover:bg-zinc-800
                        "
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>

                    )}

                  </div>

                  {/* =========================================
                      POST CONTENT
                  ========================================= */}

                  {post.text?.trim() && (

                    <div
                      className="
                        px-4
                        pb-3
                      "
                    >

                      <p
                        className="
                          text-sm
                          text-slate-800
                          dark:text-zinc-200
                          whitespace-pre-wrap
                          leading-relaxed
                        "
                      >
                        {post.text}
                      </p>

                    </div>

                  )}

                  {/* =========================================
                      POST MEDIA
                  ========================================= */}

                  {post.mediaUrl && (

                    <div
                      className="
                        w-full
                        bg-slate-50
                        dark:bg-black/20
                      "
                    >

                      <img
                        src={formatMediaUrl(
                          post.mediaUrl
                        )}
                        alt="Publication"
                        className="
                          block
                          w-full
                          max-h-[650px]
                          object-contain
                        "
                        onError={(e) => {
                          e.currentTarget.style.display =
                            'none';
                        }}
                      />

                    </div>

                  )}

                  {/* =========================================
                      POST FOOTER
                  ========================================= */}

                  <div
                    className="
                      px-4
                      py-2.5
                      border-t
                      border-slate-100
                      dark:border-zinc-800
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-5
                      "
                    >

                      <button
                        className="
                          flex
                          items-center
                          gap-1.5
                          text-slate-500
                          dark:text-zinc-400
                          hover:text-pink-500
                          transition-colors
                        "
                      >
                        <Heart size={18} />

                        <span
                          className="text-xs"
                        >
                          {post.likes?.length || 0}
                        </span>

                      </button>

                      <button
                        className="
                          flex
                          items-center
                          gap-1.5
                          text-slate-500
                          dark:text-zinc-400
                          hover:text-indigo-500
                          transition-colors
                        "
                      >
                        <MessageCircle
                          size={18}
                        />

                        <span
                          className="text-xs"
                        >
                          {post.comments?.length || 0}
                        </span>

                      </button>

                    </div>

                    <span
                      className="
                        text-[10px]
                        text-slate-400
                        dark:text-zinc-600
                      "
                    >
                      {hasLikes
                        ? `${post.likes.length} réaction${
                            post.likes.length > 1
                              ? 's'
                              : ''
                          }`
                        : hasComments
                        ? `${post.comments.length} commentaire${
                            post.comments.length > 1
                              ? 's'
                              : ''
                          }`
                        : ''}
                    </span>

                  </div>

                </article>

              );

            })}

          </div>

        )}

      </main>

    </div>
  );
};

export default BlogEntraide;