import { useState } from 'react';
import { translations } from '../i18n/translations';
import { Translations } from '../types/i18n';

// RTL languages
const RTL_LANGUAGES = ['fa', 'ar', 'he', 'ur'];

export const useI18n = () => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'fa'; // Default to Persian
  });

  const changeLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = translations[currentLanguage] as Translations;
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);

  return {
    t,
    currentLanguage,
    changeLanguage,
    isRTL,
    availableLanguages: Object.keys(translations),
  };
};