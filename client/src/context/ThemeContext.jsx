import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  {
    id: 'espresso',
    name: 'Warm Espresso',
    accent: '#e09f67',
    bg: '#191412',
    description: 'Warm architectural wood & copper'
  },
  {
    id: 'sunset',
    name: 'Sunset Rose',
    accent: '#FB9590',
    bg: '#180e16',
    description: 'Apricot, peach & wine palette'
  },
  {
    id: 'midnight',
    name: 'Midnight Tech',
    accent: '#38bdf8',
    bg: '#0f172a',
    description: 'Deep navy slate & neon cyan'
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    accent: '#34d399',
    bg: '#0c1a14',
    description: 'Calming sage & gold accents'
  },
  {
    id: 'light',
    name: 'Editorial Paper',
    accent: '#b8753d',
    bg: '#faf7f2',
    description: 'Clean daylight editorial cream'
  }
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('odoo_theme') || 'espresso';
  });

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('odoo_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeContext;
