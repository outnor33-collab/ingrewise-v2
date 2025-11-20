import React from 'react';
import { useTheme, themes } from '../contexts/ThemeContext';

// This is a type assertion because Theme is defined in ThemeContext
type Theme = keyof typeof themes;

const themeColors: Record<Theme, string> = {
  fuchsia: 'bg-fuchsia-500',
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
};


const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-full border border-gray-700">
      {(Object.keys(themes) as Theme[]).map((themeKey) => {
        return (
          <button
            key={themeKey}
            onClick={() => setTheme(themeKey)}
            className={`w-5 h-5 rounded-full ${themeColors[themeKey]} transition-transform duration-200 hover:scale-110 ${theme === themeKey ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
            aria-label={`Switch to ${themeKey} theme`}
          />
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
