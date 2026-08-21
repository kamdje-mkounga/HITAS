import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

import {
  Trash2,
  Send,
  Layers,
  MessageCircle,
  Heart,
  MoreHorizontal,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Music,
  Paperclip
} from 'lucide-react';

import Navbar from '../components/Navbar';
import tradPattern from '../assets/traditional.jpg';

const BlogEntraide = ({
  hasNewNotification,
  clearNotifications
}) => {
  /* =========================================================
     STATES
  ========================================================= */

  const [posts, setPosts] = useState([]);

  const [text, setText] = useState('');

  const [category, setCategory] = useState('General');

  const [selectedFilter, setSelectedFilter] =
    useState('Tous');

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  // Fichiers sélectionnés avant publication
  const [selectedFiles, setSelectedFiles] =
    useState([]);

  // Prévisualisations des images
  const [previewUrls, setPreviewUrls] =
    useState([]);

  // Index du média actuellement affiché pour chaque post
  const [activeMediaIndexes, setActiveMediaIndexes] =
    useState({});

  const socketRef = useRef(null);

  const fileInputRef = useRef(null);

  const BACKEND_URL =
    'https://hitas.onrender.com';

  const loggedInUserId =
    localStorage.getItem('userId') || '';

  const MAX_FILES = 10;

  const MAX_FILE_SIZE =
    50 * 1024 * 1024;

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

    return `${BACKEND_URL}${
      url.startsWith('/') ? '' : '/'
    }${url}`;
  };

  const getAuthHeader = () => {
    const token =
      localStorage.getItem('token');

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
     MEDIA UTILITIES
  ========================================================= */

  const getPostMedia = (post) => {
    if (
      post.mediaFiles &&
      Array.isArray(post.mediaFiles) &&
      post.mediaFiles.length > 0
    ) {
      return post.mediaFiles;
    }

    if (post.mediaUrl) {
      return [
        {
          url: post.mediaUrl,
          path: post.mediaPath || '',
          type: post.mediaType || 'image',
          originalName:
            post.mediaOriginalName || ''
        }
      ];
    }

    return [];
  };

  const getMediaTypeFromFile = (file) => {
    const mime =
      file.type?.toLowerCase() || '';

    if (mime.startsWith('image/')) {
      return 'image';
    }

    if (mime.startsWith('audio/')) {
      return 'audio';
    }

    if (mime === 'application/pdf') {
      return 'pdf';
    }

    if (
      mime.includes('msword') ||
      mime.includes(
        'vnd.openxmlformats-officedocument'
      )
    ) {
      return 'document';
    }

    return 'file';
  };

  /* =========================================================
     CHARGEMENT DES POSTS
  ========================================================= */

  const fetchPosts = async () => {
    try {
      setLoading(true);

      setError('');

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
    socketRef.current = io(
      BACKEND_URL,
      {
        transports: [
          'websocket',
          'polling'
        ]
      }
    );

    const socket =
      socketRef.current;

    const handleCreated = (newPost) => {
      setPosts((prevPosts) => {
        if (
          prevPosts.some(
            (post) =>
              post._id === newPost._id
          )
        ) {
          return prevPosts;
        }

        return [
          newPost,
          ...prevPosts
        ];
      });
    };

    const handleDeleted = (
      deletedPostId
    ) => {
      setPosts((prevPosts) =>
        prevPosts.filter(
          (post) =>
            post._id !== deletedPostId
        )
      );
    };

    const handleUpdated = (
      updatedPost
    ) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === updatedPost._id
            ? updatedPost
            : post
        )
      );
    };

    const handleInteractions = (
      updatedPost
    ) => {
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
     SÉLECTION DES FICHIERS
  ========================================================= */

  const handleFileSelection = (
    e
  ) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    setError('');

    if (
      selectedFiles.length +
        files.length >
      MAX_FILES
    ) {
      setError(
        `Tu peux sélectionner au maximum ${MAX_FILES} fichiers par publication.`
      );

      e.target.value = '';

      return;
    }

    const oversizedFile =
      files.find(
        (file) =>
          file.size >
          MAX_FILE_SIZE
      );

    if (oversizedFile) {
      setError(
        `Le fichier "${oversizedFile.name}" dépasse la limite de 50 MB.`
      );

      e.target.value = '';

      return;
    }

    const videoFile =
      files.find((file) =>
        file.type?.startsWith(
          'video/'
        )
      );

    if (videoFile) {
      setError(
        `La vidéo "${videoFile.name}" n'est pas autorisée sur HITAS.`
      );

      e.target.value = '';

      return;
    }

    const newFiles = [
      ...selectedFiles,
      ...files
    ];

    setSelectedFiles(newFiles);

    const newPreviews =
      files.map((file) => {
        if (
          file.type?.startsWith(
            'image/'
          )
        ) {
          return {
            url: URL.createObjectURL(
              file
            ),
            name: file.name,
            type: 'image'
          };
        }

        return {
          url: null,
          name: file.name,
          type:
            getMediaTypeFromFile(
              file
            )
        };
      });

    setPreviewUrls((prev) => [
      ...prev,
      ...newPreviews
    ]);

    e.target.value = '';
  };

  /* =========================================================
     SUPPRIMER UN FICHIER AVANT PUBLICATION
  ========================================================= */

  const removeSelectedFile = (
    index
  ) => {
    const preview =
      previewUrls[index];

    if (preview?.url) {
      URL.revokeObjectURL(
        preview.url
      );
    }

    setSelectedFiles(
      (prev) =>
        prev.filter(
          (_, i) => i !== index
        )
    );

    setPreviewUrls(
      (prev) =>
        prev.filter(
          (_, i) => i !== index
        )
    );
  };

  /* =========================================================
     SUPPRIMER TOUS LES FICHIERS
  ========================================================= */

  const clearSelectedFiles = () => {
    previewUrls.forEach(
      (preview) => {
        if (preview.url) {
          URL.revokeObjectURL(
            preview.url
          );
        }
      }
    );

    setSelectedFiles([]);

    setPreviewUrls([]);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        '';
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(
        (preview) => {
          if (preview.url) {
            URL.revokeObjectURL(
              preview.url
            );
          }
        }
      );
    };
  }, []);

  /* =========================================================
     CRÉATION D'UN POST
  ========================================================= */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError('');

    setSuccess('');

    if (
      !text.trim() &&
      selectedFiles.length === 0
    ) {
      setError(
        'La publication doit contenir du texte ou au moins un fichier.'
      );

      return;
    }

    try {
      const formData =
        new FormData();

      formData.append(
        'text',
        text
      );

      formData.append(
        'category',
        category
      );

      if (
        socketRef.current?.id
      ) {
        formData.append(
          'socketId',
          socketRef.current.id
        );
      }

      // 🟢 Loop through all selected files and append them to 'media'
      selectedFiles.forEach(
        (file) => {
          formData.append(
            'media',
            file
          );
        }
      );

      await axios.post(
        `${BACKEND_URL}/api/posts`,
        formData,
        {
          headers: {
            'x-auth-token':
              localStorage.getItem(
                'token'
              ),
            'Content-Type':
              'multipart/form-data'
          }
        }
      );

      setText('');

      clearSelectedFiles();

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
     SUPPRESSION D'UN POST
  ========================================================= */

  const handleDelete = async (
    postId
  ) => {
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
     CAROUSEL
  ========================================================= */

  const setMediaIndex = (
    postId,
    index
  ) => {
    setActiveMediaIndexes(
      (prev) => ({
        ...prev,
        [postId]: index
      })
    );
  };

  const nextMedia = (
    postId,
    mediaCount
  ) => {
    setActiveMediaIndexes(
      (prev) => {
        const current =
          prev[postId] || 0;

        return {
          ...prev,
          [postId]:
            (current + 1) %
            mediaCount
        };
      }
    );
  };

  const previousMedia = (
    postId,
    mediaCount
  ) => {
    setActiveMediaIndexes(
      (prev) => {
        const current =
          prev[postId] || 0;

        return {
          ...prev,
          [postId]:
            (current - 1 + mediaCount) %
            mediaCount
        };
      }
    );
  };

  /* =========================================================
     FILTRES
  ========================================================= */

  const filteredPosts =
    selectedFilter === 'Tous'
      ? posts
      : posts.filter(
          (post) =>
            post.category ===
            selectedFilter
        );

  /* =========================================================
     BADGES
  ========================================================= */

  const getBadgeColor = (
    cat
  ) => {
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
     RENDER MEDIA (INSTAGRAM-STYLE SLIDING TRACK)
  ========================================================= */

  const renderMedia = (post) => {
    const media = getPostMedia(post);

    if (!media.length) {
      return null;
    }

    const activeIndex =
      activeMediaIndexes[post._id] || 0;

    return (
      <div className="w-full bg-slate-50 dark:bg-black border-y border-slate-100 dark:border-zinc-800">
        <div className="relative w-full overflow-hidden bg-black flex items-center justify-center">
          <div 
            className="flex w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {media.map((item, idx) => {
              const mediaType = item.type || 'image';
              const mediaUrl = formatMediaUrl(item.url);

              return (
                <div 
                  key={idx} 
                  className="min-w-full w-full flex-shrink-0 flex items-center justify-center bg-black"
                >
                  {mediaType === 'image' && (
                    <img
                      src={mediaUrl}
                      alt={item.originalName || 'Publication'}
                      className="block w-full max-h-[700px] object-contain bg-black select-none"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}

                  {mediaType === 'audio' && (
                    <div className="w-full px-6 py-12 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Music size={24} className="text-indigo-500" />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 text-center truncate max-w-[80%]">
                        {item.originalName || 'Fichier audio'}
                      </p>
                      <audio controls src={mediaUrl} className="w-full max-w-lg" />
                    </div>
                  )}

                  {(mediaType === 'pdf' || mediaType === 'document' || mediaType === 'file') && (
                    <div className="w-full px-6 py-12 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <FileText size={24} className="text-indigo-500" />
                      </div>
                      <p className="text-xs text-slate-700 dark:text-zinc-300 text-center max-w-[80%] truncate">
                        {item.originalName || 'Fichier'}
                      </p>
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                      >
                        Ouvrir le fichier
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* PREVIOUS BUTTON */}
          {media.length > 1 && activeIndex > 0 && (
            <button
              type="button"
              onClick={() => previousMedia(post._id, media.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all z-10"
              aria-label="Média précédent"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* NEXT BUTTON */}
          {media.length > 1 && activeIndex < media.length - 1 && (
            <button
              type="button"
              onClick={() => nextMedia(post._id, media.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all z-10"
              aria-label="Média suivant"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* COUNTER BADGE */}
          {media.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full z-10 pointer-events-none">
              {activeIndex + 1} / {media.length}
            </div>
          )}
        </div>

        {/* DOTS NAVIGATION */}
        {media.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-2.5">
            {media.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setMediaIndex(post._id, index)}
                className={`rounded-full transition-all ${
                  index === activeIndex
                    ? 'w-5 h-1.5 bg-indigo-500'
                    : 'w-1.5 h-1.5 bg-slate-300 dark:bg-zinc-700'
                }`}
                aria-label={`Afficher le média ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
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
        backgroundColor:
          'var(--bg-color)',

        backgroundImage: `
          linear-gradient(
            to bottom,
            var(--home-overlay-1),
            var(--home-overlay-2)
          ),
          url(${tradPattern})
        `,

        backgroundSize:
          'contain',

        backgroundRepeat:
          'repeat'
      }}
    >

      <Navbar
        hasNewNotification={
          hasNewNotification
        }
        clearNotifications={
          clearNotifications
        }
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

        {/* HEADER */}
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
            Pose tes questions, partage
            des opportunités ou échange
            avec la communauté.
          </p>

        </div>

        {/* FORMULAIRE */}
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

            {selectedFiles.length >
              0 && (

              <div
                className="
                  mt-3
                  rounded-xl
                  border
                  border-slate-200
                  dark:border-zinc-800
                  overflow-hidden
                  bg-slate-50
                  dark:bg-[#0d0d0e]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    px-3
                    py-2
                    border-b
                    border-slate-200
                    dark:border-zinc-800
                  "
                >

                  <span
                    className="
                      text-[10px]
                      font-semibold
                      text-slate-500
                      dark:text-zinc-500
                    "
                  >
                    {selectedFiles.length}{' '}
                    fichier
                    {selectedFiles.length >
                    1
                      ? 's'
                      : ''}{' '}
                    sélectionné
                    {selectedFiles.length >
                    1
                      ? 's'
                      : ''}
                  </span>

                  <button
                    type="button"
                    onClick={
                      clearSelectedFiles
                    }
                    className="
                      text-[10px]
                      font-semibold
                      text-red-500
                      hover:text-red-400
                    "
                  >
                    Tout retirer
                  </button>

                </div>

                <div
                  className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    gap-1
                    p-1
                  "
                >

                  {previewUrls.map(
                    (
                      preview,
                      index
                    ) => (

                      <div
                        key={`${preview.name}-${index}`}
                        className="
                          relative
                          aspect-square
                          rounded-lg
                          overflow-hidden
                          bg-slate-200
                          dark:bg-zinc-900
                          border
                          border-slate-200
                          dark:border-zinc-800
                        "
                      >

                        {preview.type ===
                          'image' &&
                        preview.url ? (

                          <img
                            src={
                              preview.url
                            }
                            alt={
                              preview.name
                            }
                            className="
                              w-full
                              h-full
                              object-cover
                            "
                          />

                        ) : (

                          <div
                            className="
                              w-full
                              h-full
                              flex
                              flex-col
                              items-center
                              justify-center
                              gap-2
                              p-3
                            "
                          >

                            {preview.type ===
                            'audio' ? (
                              <Music
                                size={25}
                                className="text-indigo-500"
                              />
                            ) : (
                              <FileText
                                size={25}
                                className="text-indigo-500"
                              />
                            )}

                            <span
                              className="
                                text-[9px]
                                text-slate-500
                                dark:text-zinc-500
                                text-center
                                truncate
                                w-full
                              "
                            >
                              {
                                preview.name
                              }
                            </span>

                          </div>

                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeSelectedFile(
                              index
                            )
                          }
                          className="
                            absolute
                            top-1.5
                            right-1.5
                            w-6
                            h-6
                            rounded-full
                            bg-black/70
                            text-white
                            flex
                            items-center
                            justify-center
                            hover:bg-red-500
                            transition-colors
                          "
                          aria-label="Supprimer le fichier"
                        >
                          <X size={13} />
                        </button>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

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
                  flex-wrap
                  items-center
                  gap-2
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
                      setCategory(
                        e.target.value
                      )
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

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="
                    image/jpeg,
                    image/png,
                    image/gif,
                    image/webp,
                    audio/mpeg,
                    audio/wav,
                    audio/mp4,
                    audio/ogg,
                    application/pdf,
                    application/msword,
                    application/vnd.openxmlformats-officedocument.wordprocessingml.document
                  "
                  onChange={
                    handleFileSelection
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="
                    flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-lg
                    border
                    border-slate-200
                    dark:border-zinc-800
                    bg-slate-50
                    dark:bg-[#0d0d0e]
                    text-slate-600
                    dark:text-zinc-400
                    hover:text-indigo-500
                    hover:border-indigo-500/50
                    text-[10px]
                    font-semibold
                    transition-all
                  "
                >

                  <Paperclip
                    size={14}
                  />

                  {selectedFiles.length >
                  0
                    ? `${selectedFiles.length} fichier${
                        selectedFiles.length >
                        1
                          ? 's'
                          : ''
                      }`
                    : 'Ajouter des fichiers'}

                </button>

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

                <Send
                  className="h-3.5 w-3.5"
                />

              </button>

            </div>

          </form>

        </div>

        {/* FILTRES */}
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
                  selectedFilter ===
                  cat
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

              {cat ===
              'General'
                ? 'Général'
                : cat === 'Tous'
                ? '📢 Tous'
                : cat ===
                  'Stage/Emploi'
                ? '💼 Stage / Emploi'
                : cat}

            </button>

          ))}

        </div>

        {/* POSTS */}
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
            CHARGEMENT DU FIL
            D'ACTUALITÉ...
          </div>

        ) : filteredPosts.length ===
          0 ? (

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
            Aucune publication
            trouvée dans cette
            catégorie.
          </div>

        ) : (

          <div className="space-y-4">

            {filteredPosts.map(
              (post) => {

                const isOwner =
                  getUserId(
                    post.user
                  ) ===
                  loggedInUserId;

                const hasLikes =
                  post.likes?.length >
                  0;

                const hasComments =
                  post.comments
                    ?.length > 0;

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

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        px-4
                        py-3
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        {post.avatar ? (

                          <img
                            src={formatMediaUrl(
                              post.avatar
                            )}
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
                            {post.firstName?.[0] ||
                              'U'}

                            {post.lastName?.[0] ||
                              ''}

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

                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              flex-wrap
                            "
                          >

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
                                  minute:
                                    '2-digit'
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
                              {post.category ===
                              'General'
                                ? 'Général'
                                : post.category}
                            </span>

                          </div>

                        </div>

                      </div>

                      {isOwner ? (

                        <button
                          onClick={() =>
                            handleDelete(
                              post._id
                            )
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
                          type="button"
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

                    {getPostMedia(post).length >
                      0 &&
                      renderMedia(post)}

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
                          type="button"
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
                          <Heart
                            size={18}
                          />

                          <span className="text-xs">
                            {post.likes
                              ?.length ||
                              0}
                          </span>

                        </button>

                        <button
                          type="button"
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

                          <span className="text-xs">
                            {post.comments
                              ?.length ||
                              0}
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
                              post.likes
                                .length >
                              1
                                ? 's'
                                : ''
                            }`
                          : hasComments
                          ? `${post.comments.length} commentaire${
                              post
                                .comments
                                .length >
                              1
                                ? 's'
                                : ''
                            }`
                          : ''}
                      </span>

                    </div>

                  </article>

                );
              }
            )}

          </div>

        )}

      </main>

    </div>
  );
};

export default BlogEntraide;