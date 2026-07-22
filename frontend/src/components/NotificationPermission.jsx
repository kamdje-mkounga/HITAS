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

      // 📱 Vérification du support des notifications et des service workers
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        console.log("Ce navigateur ne gère pas les notifications push ou les service workers.");
        return;
      }

      try {
        // 🚀 1. ENREGISTREMENT EXPLICITE DU SERVICE WORKER ICI
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log("✅ Service Worker enregistré avec succès, scope:", registration.scope);

        // 2. Gestion des permissions de notification
        let permission = Notification.permission;
        
        if (permission === "default") {
          permission = await Notification.requestPermission();
        }

        if (permission === "granted") {
          await registerToken(registration);
        } else {
          console.log("Permission de notification refusée.");
        }
      } catch (err) {
        console.error("Erreur lors de l'enregistrement du Service Worker ou des permissions :", err);
      }
    }

    async function registerToken(registration) {
      try {
        // On passe directement l'enregistrement que l'on vient de faire à getToken
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