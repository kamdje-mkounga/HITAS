import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🔥 Enregistrement du Service Worker Firebase pour les notifications Push PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then((registration) => {
        console.log('🚀 Service Worker Firebase enregistré avec succès ! Scope: ', registration.scope);
      })
      .catch((err) => {
        console.error('❌ Échec de l\'enregistrement du Service Worker :', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)