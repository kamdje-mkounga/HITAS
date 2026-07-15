importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.9.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD7yfdB5dK_uDEi4QZbAbsjSuLe7ubyALY",
  authDomain: "hitas-connect.firebaseapp.com",
  projectId: "hitas-connect",
  storageBucket: "hitas-connect.firebasestorage.app",
  messagingSenderId: "974821857399",
  appId: "1:974821857399:web:12ffac470f1f764e728e72"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

  console.log("Notification reçue :", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/hitas_logo.svg",
      badge: "/hitas_logo.svg"
    }
  );

});