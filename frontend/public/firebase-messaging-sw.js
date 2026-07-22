// 1. Importer d'abord le Core de Firebase, puis le module de messagerie
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 2. Initialisation de Firebase
firebase.initializeApp({
  apiKey: "AIzaSyD7yfdB5dK_uDEi4QZbAbsjSuLe7ubyALY",
  authDomain: "hitas-connect.firebaseapp.com",
  projectId: "hitas-connect",
  storageBucket: "hitas-connect.firebasestorage.app",
  messagingSenderId: "974821857399",
  appId: "1:974821857399:web:12ffac470f1f764e728e72"
});

const messaging = firebase.messaging();

// 3. Gestion des messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan : ', payload);

  // Extraction propre des données
  const data = payload.data || {};
  const notificationTitle = data.title || payload.notification?.title || "📢 Hitas Connect";
  const notificationBody = data.body || payload.notification?.body || "Vous avez une nouvelle notification.";
  const notificationIcon = data.icon || payload.notification?.icon || '/logo192.png';
  const targetUrl = data.url || 'https://ronaldokamdje-9589s-projects.vercel.app/blog';

  // --- GESTION DU BADGE ---
  if ('setAppBadge' in self.navigator) {
    const unreadCount = parseInt(data.unreadCount, 10);
    
    if (!isNaN(unreadCount)) {
      if (unreadCount > 0) {
        self.navigator.setAppBadge(unreadCount).catch(err => {
          console.log("Erreur mise à jour badge SW:", err);
        });
      } else {
        // Si le compteur est à 0, on efface proprement le badge
        self.navigator.clearAppBadge().catch(err => {
          console.log("Erreur effacement badge SW:", err);
        });
      }
    }
  }

  // Si c'est un signal silencieux (ex: suppression de post), on n'affiche pas de popup visuelle
  if (data.action === "DELETE_POST" || data.silent === "true") {
    return Promise.resolve();
  }

  // --- AFFICHAGE DE LA NOTIFICATION (Écran de verrouillage / Bannieère) ---
  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/logo192.png',
    tag: 'hitas-notification-tag', // Évite d'empiler des dizaines de notifications identiques
    renotify: true,              // Fait vibrer/sonner même si une notification porte le même tag
    data: { ...data, url: targetUrl }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 4. Gestion du clic sur la notification (pour rediriger l'utilisateur vers la bonne page)
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Clic sur la notification reçu.', event.notification);
  event.notification.close();

  const targetUrl = event.notification.data?.url || 'https://ronaldokamdje-9589s-projects.vercel.app/blog';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si une fenêtre est déjà ouverte, on l'amène au premier plan et on navigue
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, on ouvre une nouvelle fenêtre/onglet
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});