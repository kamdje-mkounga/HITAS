import { useEffect } from "react";
import axios from "axios";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase/firebase";

const VAPID_KEY =
  "BOh0xGH6_Rq1yaJaXio2W0SQMd5vplhb3zL_7MBAyfy7zZk5CJdOulOD33qiRyyDOLLoewyfU0XBEH-KlNEpnvA";

// ⚠️ Mets ici l'URL de ton backend
const BACKEND_URL = "http://localhost:5000";

export default function NotificationPermission() {

  useEffect(() => {

    async function requestPermission() {

      try {

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log("Permission refusée.");
          return;
        }

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });

        if (!token) {
          console.log("Impossible de récupérer le token.");
          return;
        }

        console.log("FCM TOKEN :", token);

        await axios.put(
          `${BACKEND_URL}/api/auth/fcm-token`,
          { token },
          {
            headers: {
              "x-auth-token": localStorage.getItem("token")
            }
          }
        );

        console.log("✅ Token enregistré dans MongoDB");

      } catch (err) {
        console.error("Erreur Notification :", err);
      }

    }

    requestPermission();

  }, []);

  return null;
}