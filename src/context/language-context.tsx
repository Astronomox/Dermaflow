"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '@/locales/en.json';
import yo from '@/locales/yo.json';
import sw from '@/locales/sw.json';
import ha from '@/locales/ha.json';
import ig from '@/locales/ig.json';
import zu from '@/locales/zu.json';

// Define the shape of your translation files
interface Translations {
  [key: string]: string | Translations;
}

const translations: { [key: string]: Translations } = {
  en,
  yo,
  sw,
  ha,
  ig,
  zu,
};

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && translations[storedLang]) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    } else {
      console.warn(`Language '${lang}' not found. Defaulting to 'en'.`);
      setLanguageState('en');
      localStorage.setItem('language', 'en');
    }
  };

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    const langFile = translations[language] || translations.en;
    const keys = key.split('.');
    let result: any = langFile;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if key not found in current language
        const enFile = translations.en;
        let enResult: any = enFile;
        for (const enK of keys) {
            enResult = enResult?.[enK];
        }
        
        let fallback = enResult || key;
        if (typeof fallback === 'string' && options) {
            Object.keys(options).forEach(optKey => {
                fallback = fallback.replace(`{{${optKey}}}`, String(options[optKey]));
            });
        }
        return fallback;
      }
    }

    if (typeof result === 'string' && options) {
        Object.keys(options).forEach(optKey => {
            result = result.replace(`{{${optKey}}}`, String(options[optKey]));
        });
    }

    return typeof result === 'string' ? result : key;
  };
  

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

    