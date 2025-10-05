import { createSignal, createMemo } from 'solid-js';
import { translations } from '../i18n/translations';
import { Translations } from '../types/i18n';

const RTL_LANGUAGES = ['fa', 'ar', 'he', 'ur'];

export const createI18n = () => {
  const getInitialLanguage = () => {
    const saved = localStorage.getItem('language');
    return saved || 'fa';
  };

  const [currentLanguage, setCurrentLanguage] = createSignal(getInitialLanguage());

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = createMemo(() => translations[currentLanguage()] as Translations);
  const isRTL = createMemo(() => RTL_LANGUAGES.includes(currentLanguage()));

  return {
    t,
    currentLanguage,
    changeLanguage,
    isRTL,
    availableLanguages: Object.keys(translations),
  };
};