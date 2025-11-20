import React, { createContext, useState, useContext, ReactNode, useLayoutEffect } from 'react';

type Theme = 'fuchsia' | 'sky' | 'emerald' | 'amber';

interface ThemeConfig {
  accentLight: string; // 400
  accentBase: string; // 500
  accentDark: string; // 600
  accentDarker: string; // 700
  accentShadow: string; // 900
}

export const themes: Record<Theme, ThemeConfig> = {
  fuchsia: {
    accentLight: '228 123 228', // text-fuchsia-400
    accentBase: '217 70 239',   // ring-fuchsia-500
    accentDark: '192 38 211',    // bg-fuchsia-600
    accentDarker: '162 28 175', // hover:bg-fuchsia-700
    accentShadow: '112 26 117',  // shadow-fuchsia-900
  },
  sky: {
    accentLight: '96 165 250', // text-sky-400
    accentBase: '59 130 246',  // ring-sky-500
    accentDark: '37 99 235',   // bg-sky-600
    accentDarker: '29 78 216', // hover:bg-sky-700
    accentShadow: '23 37 84',  // shadow-sky-900
  },
  emerald: {
    accentLight: '52 211 153', // text-emerald-400
    accentBase: '16 185 129',  // ring-emerald-500
    accentDark: '5 150 105',   // bg-emerald-600
    accentDarker: '4 120 87',  // hover:bg-emerald-700
    accentShadow: '6 78 59',    // shadow-emerald-900
  },
  amber: {
    accentLight: '251 191 36', // text-amber-400
    accentBase: '245 158 11',  // ring-amber-500
    accentDark: '217 119 6',   // bg-amber-600
    accentDarker: '180 83 9',  // hover:bg-amber-700
    accentShadow: '120 53 15', // shadow-amber-900
  },
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('fuchsia');

  useLayoutEffect(() => {
    const root = document.documentElement;
    const themeConfig = themes[theme];
    root.style.setProperty('--color-accent-light', themeConfig.accentLight);
    root.style.setProperty('--color-accent-base', themeConfig.accentBase);
    root.style.setProperty('--color-accent-dark', themeConfig.accentDark);
    root.style.setProperty('--color-accent-darker', themeConfig.accentDarker);
    root.style.setProperty('--color-accent-shadow', themeConfig.accentShadow);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
