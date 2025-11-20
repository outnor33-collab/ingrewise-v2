import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { translations, type Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs: Language[] = ['en', 'fr', 'ar', 'ru', 'zh'];
    if (supportedLangs.includes(browserLang as Language)) {
        return browserLang as Language;
    }
    return 'ar'; // Default to Arabic
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage());

  useEffect(() => {
    const newDir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = newDir;
    document.title = translations[language].pageTitle;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};