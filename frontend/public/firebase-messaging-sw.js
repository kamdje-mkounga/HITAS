importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialise Firebase dans le Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyD7yfdB5dK_uDEi4QZbAbsjSuLe7ubyALY",
  authDomain: "hitas-connect.firebaseapp.com",
  projectId: "hitas-connect",
  storageBucket: "hitas-connect.firebasestorage.app",
  messagingSenderId: "974821857399",
  appId: "1:974821857399:web:12ffac470f1f764e728e72"
});

const messaging = firebase.messaging();

// Gère l'affichage lorsque l'application est en arrière-plan / fermée (Essentiellement pour Android/PC)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notification reçue en arrière-plan : ', payload);

  // 💡 Si le backend a envoyé une notification visible standard, on extrait ses infos
  const notificationTitle = payload.notification?.title || "📢 Nouvelle publication";
  const notificationOptions = {
    body: payload.notification?.body || "Un nouveau post est disponible sur le blog.",
    icon: payload.notification?.icon || '/logo192.png',
    badge: '/logo192.png',
    data: payload.data // On conserve le lien ou l'action de redirection
  };

  // 🍏 COMPORTEMENT IOS / SAFARI PWA :
  // Sur iPhone, modifier le badge depuis cette fonction échoue ou est bloqué par Apple.
  // C'est l'iOS de l'iPhone qui lit directement le paramètre "badge" de l'APNS envoyé par ton backend.
  // Ce code sert de secours pour les navigateurs de bureau (Chrome/Edge/Android).
  if (typeof self.navigator !== 'undefined' && 'setAppBadge' in self.navigator) {
    const badgeCount = parseInt(payload.data?.unreadCount || payload.data?.badgeCount || 1, 10);
    self.navigator.setAppBadge(badgeCount).catch(err => console.log("Erreur badge SW:", err));
  }

  // Si c'est un push silencieux (uniquement pour baisser le badge lors d'une suppression),
  // on n'affiche pas de bannière de notification !
  if (payload.data?.action === "DELETE_POST") {
    return Promise.resolve();
  }

  return self.registration.showNotification(notificationTitle, notificationOptions);
});