import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase/firebase";
import API from "../services/api"; // On passe par ton instance centrale

const VAPID_KEY = "BOh0xGH6_Rq1yaJaXio2W0SQMd5vplhb3zL_7MBAyfy7zZk5CJdOulOD33qiRyyDOLLoewyfU0XBEH-KlNEpnvA";

export default function NotificationPermission() {
  useEffect(() => {
    async function requestPermission() {
      const authToken = localStorage.getItem("token");
      
      // 🔒 Si l'utilisateur n'est pas loggé, on ne fait rien
      if (!authToken) return;

      // 📱 Vérification du support navigateur (requis pour les PWA)
      if (!("Notification" in window)) {
        console.log("Ce navigateur ne gère pas les notifications push.");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Permission de notification refusée.");
          return;
        }

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (!token) {
          console.log("Impossible de récupérer le token FCM.");
          return;
        }

        console.log("🔥 Mon FCM TOKEN généré :", token);

        // 📤 Envoi au backend
        // Note : On utilise '/auth/fcm-token' car ton instance 'API' préfixe déjà probablement '/api'
        await API.put(
          "/auth/fcm-token",
          { token },
          {
            headers: {
              "x-auth-token": authToken, // Pense à doubler avec Authorization si ton middleware écoute les deux
              "Authorization": `Bearer ${authToken}` 
            }
          }
        );

        console.log("✅ Jeton enregistré avec succès dans MongoDB.");
      } catch (err) {
        console.error("Erreur configuration Notification Permission :", err);
      }
    }

    requestPermission();
  }, []);

  return null;
}