import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase/firebase";
import API from "../services/api";

const VAPID_KEY = "BOh0xGH6_Rq1yaJaXio2W0SQMd5vplhb3zL_7MBAyfy7zZk5CJdOulOD33qiRyyDOLLoewyfU0XBEH-KlNEpnvA";

export default function NotificationPermission() {
  const authToken = localStorage.getItem("token");

  useEffect(() => {
    async function setupFCM() {
      // 🔒 Si l'utilisateur n'est pas connecté, on attend qu'il le soit
      if (!authToken) return;

      // 📱 Vérification du support des notifications
      if (!("Notification" in window)) {
        console.log("Ce navigateur ne gère pas les notifications push.");
        return;
      }

      // Si la permission est déjà accordée, on récupère directement le jeton sans re-demander
      if (Notification.permission === "granted") {
        await registerToken();
      } else if (Notification.permission !== "denied") {
        // 🍏 Sur iOS/Safari, il est fortement conseillé de lier cette demande à un bouton (ex: dans Profil)
        // Mais si la permission n'est pas refusée, on tente de la demander au chargement de la session
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            await registerToken();
          }
        } catch (err) {
          console.error("Erreur lors de la demande de permission :", err);
        }
      }
    }

    async function registerToken() {
      try {
        // Enregistrement du Service Worker explicite requis pour récupérer le token sur certaines PWA iOS
        const registration = await navigator.serviceWorker.ready;
        
        const token = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });

        if (!token) {
          console.log("Impossible de récupérer le token FCM.");
          return;
        }

        console.log("🔥 Mon FCM TOKEN généré :", token);

        // 📤 Envoi au backend
        await API.put(
          "/auth/fcm-token",
          { token },
          {
            headers: {
              "x-auth-token": authToken,
              "Authorization": `Bearer ${authToken}` 
            }
          }
        );

        console.log("✅ Jeton enregistré avec succès dans MongoDB.");
      } catch (err) {
        console.error("Erreur lors de la récupération ou de l'envoi du token FCM :", err);
      }
    }

    setupFCM();
  }, [authToken]); // 🔄 Relance la logique dès que l'utilisateur se connecte / déconnecte

  return null;
}