import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { type Language } from '../translations';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ru', label: 'Русский' },
    { code: 'zh', label: '中文' },
  ];

  const activeClasses = 'bg-[rgb(var(--color-accent-dark))] text-white';
  const inactiveClasses = 'bg-gray-700 hover:bg-gray-600 text-gray-300';

  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-600">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLanguage(code)}
          className={`px-3 py-1 text-sm font-medium transition-colors duration-200 ${
            language === code ? activeClasses : inactiveClasses
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
