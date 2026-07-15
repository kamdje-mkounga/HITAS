import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD7yfdB5dK_uDEi4QZbAbsjSuLe7ubyALY",
  authDomain: "hitas-connect.firebaseapp.com",
  projectId: "hitas-connect",
  storageBucket: "hitas-connect.firebasestorage.app",
  messagingSenderId: "974821857399",
  appId: "1:974821857399:web:12ffac470f1f764e728e72"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);