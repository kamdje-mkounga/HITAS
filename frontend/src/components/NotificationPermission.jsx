import { useEffect } from "react";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase/firebase";

const VAPID_KEY =
"BOh0xGH6_Rq1yaJaXio2W0SQMd5vplhb3zL_7MBAyfy7zZk5CJdOulOD33qiRyyDOLLoewyfU0XBEH-KlNEpnvA";

export default function NotificationPermission() {

    useEffect(() => {

        async function requestPermission() {

            const permission = await Notification.requestPermission();

            if (permission !== "granted") {
                console.log("Permission refusée.");
                return;
            }

            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY
            });

            console.log("FCM TOKEN :", token);
        }

        requestPermission();

    }, []);

    return null;
}