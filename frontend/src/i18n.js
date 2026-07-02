import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // Détecte automatiquement la langue du navigateur de l'étudiant
  .use(initReactI18next)
  .init({
    resources: {
      fr: {
        translation: {
          "welcome": "Bienvenue sur HITAS",
          "logout_inactivity": "Votre session a expiré pour cause d'inactivité.",
          "profile": "Mon Profil"
        }
      },
      en: {
        translation: {
          "welcome": "Welcome to HITAS",
          "logout_inactivity": "Your session has expired due to inactivity.",
          "profile": "My Profile"
        }
      },
      resources: {
        fr: {
          translation: {
            "home": {
              "title": "Le hub de la communauté étudiante de HITAS",
              "subtitle": "Connecte-toi avec la diaspora, partage des opportunités et propulse tes projets techniques.",
              "modules": {
                "annuaire": {
                  "title": "Annuaire",
                  "desc": "Trouve et contacte les étudiants basés en Inde, en France ou au Cameroun.",
                  "link": "Explorer l'annuaire"
                },
                "blog": {
                  "title": "Blog d'Entraide",
                  "desc": "Découvre les guides d'installation, astuces pour les visas et partages d'expériences.",
                  "link": "Lire les articles"
                },
                "showcase": {
                  "title": "Showcase",
                  "desc": "Expose tes créations et tes codes pour valoriser le savoir-faire de l'école.",
                  "link": "Voir les projets"
                }
              }
            }
          }
        },
        en: {
          translation: {
            "home": {
              "title": "The hub of the HITAS student community",
              "subtitle": "Connect with the diaspora, share opportunities, and power up your technical projects.",
              "modules": {
                "annuaire": {
                  "title": "Directory",
                  "desc": "Find and contact students based in India, France, or Cameroon.",
                  "link": "Explore the directory"
                },
                "blog": {
                  "title": "Help Blog",
                  "desc": "Discover setup guides, visa tips, and shared student experiences.",
                  "link": "Read articles"
                },
                "showcase": {
                  "title": "Showcase",
                  "desc": "Exhibit your creations and source codes to promote the school's expertise.",
                  "link": "View projects"
                }
              }
            }
          }
        }
      }
    },
    fallbackLng: "fr", // Langue par défaut si celle du navigateur n'est pas dispo
    interpolation: { escapeValue: false }
  });

export default i18n;