import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export const SUPPORTED_LANGUAGES = ["ar", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const RTL_LANGUAGES: SupportedLanguage[] = ["ar"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    fallbackLng: "ar",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: {
      escapeValue: false,
    },
    // Arabic is the primary market (Kuwaiti investors), so the site always
    // defaults to Arabic unless the visitor has explicitly switched language
    // before (persisted to localStorage by the header toggle). Browser/OS
    // language is intentionally NOT used to decide the default.
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "altiva_lang",
    },
  });

export function isRtl(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang as SupportedLanguage);
}

export default i18n;
