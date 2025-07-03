import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../features/auth/context/AuthContext';
import { THEME_PALETTES } from '../data/themePalettes';

interface Theme {
  name: string;
  primary: string;
  secondary: string;
  primaryRgb: string;
  secondaryRgb: string;
  accent?: string;
  accentRgb?: string;
}

// Convert theme palettes to the Theme interface
const predefinedThemes: Record<string, Theme> = THEME_PALETTES.reduce((acc, palette) => {
  acc[palette.id] = {
    name: palette.name,
    primary: palette.primary,
    secondary: palette.secondary,
    primaryRgb: hexToRgb(palette.primary),
    secondaryRgb: hexToRgb(palette.secondary),
    accent: palette.accent,
    accentRgb: palette.accent ? hexToRgb(palette.accent) : undefined
  };
  return acc;
}, {} as Record<string, Theme>);

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  currentTheme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: typeof predefinedThemes;
  customColors: { primary?: string; secondary?: string } | null;
  setCustomColors: (colors: { primary?: string; secondary?: string }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { schoolInfo, updateSchoolSettings } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('classboom-dark-mode');
    if (saved !== null) return saved === 'true';
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [currentThemeName, setCurrentThemeName] = useState(() => {
    return localStorage.getItem('classboom-theme') || 'warm-inviting';
  });
  
  const [customColors, setCustomColors] = useState<{ primary?: string; secondary?: string } | null>(null);

  // Get current theme object
  const currentTheme = customColors ? {
    name: 'Custom',
    primary: customColors.primary || predefinedThemes['warm-inviting'].primary,
    secondary: customColors.secondary || predefinedThemes['warm-inviting'].secondary,
    primaryRgb: hexToRgb(customColors.primary || predefinedThemes['warm-inviting'].primary),
    secondaryRgb: hexToRgb(customColors.secondary || predefinedThemes['warm-inviting'].secondary)
  } : predefinedThemes[currentThemeName] || predefinedThemes['warm-inviting'];

  // Apply theme to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply dark mode class
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply theme colors
    root.style.setProperty('--classboom-primary', currentTheme.primaryRgb);
    root.style.setProperty('--classboom-secondary', currentTheme.secondaryRgb);
    root.style.setProperty('--classboom-primary-hex', currentTheme.primary);
    root.style.setProperty('--classboom-secondary-hex', currentTheme.secondary);
    
    // Apply accent color if available
    if (currentTheme.accent && currentTheme.accentRgb) {
      root.style.setProperty('--classboom-accent', currentTheme.accentRgb);
      root.style.setProperty('--classboom-accent-hex', currentTheme.accent);
    }
    
    // Save preferences
    localStorage.setItem('classboom-dark-mode', isDarkMode.toString());
    if (!customColors) {
      localStorage.setItem('classboom-theme', currentThemeName);
    }
  }, [isDarkMode, currentTheme, currentThemeName, customColors]);

  // Load theme from school settings if available
  useEffect(() => {
    if (schoolInfo?.settings) {
      // Load dark mode preference
      if (typeof schoolInfo.settings.darkMode === 'boolean') {
        setIsDarkMode(schoolInfo.settings.darkMode);
      }
      
      // Load theme name if available
      if (schoolInfo.settings.themeName) {
        setCurrentThemeName(schoolInfo.settings.themeName);
        setCustomColors(null);
      }
      // Or load custom colors if available
      else if (schoolInfo.settings.theme) {
        const { primary, secondary } = schoolInfo.settings.theme;
        if (primary || secondary) {
          setCustomColors({ primary, secondary });
        }
      }
    }
  }, [schoolInfo]);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Try to save to database (don't block on this)
    if (updateSchoolSettings) {
      updateSchoolSettings({ darkMode: newMode }).catch(err => {
        console.log('Failed to save dark mode preference:', err);
      });
    }
  };

  const setTheme = async (themeName: string) => {
    if (predefinedThemes[themeName]) {
      setCurrentThemeName(themeName);
      setCustomColors(null);
      
      // Try to save to database
      if (updateSchoolSettings) {
        updateSchoolSettings({ themeName }).catch(err => {
          console.log('Failed to save theme preference:', err);
        });
      }
    }
  };

  const updateCustomColors = (colors: { primary?: string; secondary?: string }) => {
    setCustomColors(colors);
  };

  return (
    <ThemeContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      currentTheme,
      setTheme,
      availableThemes: predefinedThemes,
      customColors,
      setCustomColors: updateCustomColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r} ${g} ${b}`;
  }
  return '0 0 0';
}