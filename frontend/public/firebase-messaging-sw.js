importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialise Firebase dans le Service Worker
firebase.initializeApp({
  apiKey: "TON_API_KEY",
  authDomain: "TON_AUTH_DOMAIN",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_STORAGE_BUCKET",
  messagingSenderId: "TON_MESSAGING_SENDER_ID",
  appId: "TON_APP_ID"
});

const messaging = firebase.messaging();

// Gère l'affichage lorsque l'application est en arrière-plan / fermée
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notification reçue en arrière-plan : ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-192x192.png', // L'icône de ton application
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});