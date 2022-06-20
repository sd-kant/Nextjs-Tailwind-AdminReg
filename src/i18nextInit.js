import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from "./assets/locales/en/translation.json";
import translationJA from "./assets/locales/ja/translation.json";
import translationFr from "./assets/locales/fr/translation.json";
import translationFrCa from "./assets/locales/fr-ca/translation.json";
const fallbackLng = ['en'];
const availableLanguages = ['en', 'ja', 'fr', 'frca'];
const resources = {
  en: {
    translation: translationEN
  },
  ja: {
    translation: translationJA
  },
  fr: {
    translation: translationFr
  },
  'frca': {
    translation: translationFrCa
  },
};

i18n
  .use(Backend) // load translations using http (default public/assets/locals/en/translations)
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass the i18n instance to react-i18next.
  .init({
    resources,
    lng: localStorage.getItem("kop-v2-lang") || 'en',
    fallbackLng, // fallback language is english.
    // detection: {
    //   checkWhitelist: true, // options for language detection
    // },
    debug: false,
    whitelist: availableLanguages,
    interpolation: {
      escapeValue: false, // no need for react. it escapes by default
    },
    react: {
      // Turn off the use of React Suspense
      useSuspense: false
    }
  });

export default i18n;