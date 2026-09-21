import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeId, ThemeDefinition, THEMES, getSavedTheme, saveSelectedTheme } from './theme';

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeDefinition;
  setThemeId: (id: ThemeId) => void;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => getSavedTheme());

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    saveSelectedTheme(id);
  };

  const theme = useMemo(() => THEMES[themeId] || THEMES.academic_blue, [themeId]);

  const availableThemes = useMemo(() => Object.values(THEMES), []);

  useEffect(() => {
    // Apply body class if needed
    if (themeId === 'slate_dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeId]);

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
