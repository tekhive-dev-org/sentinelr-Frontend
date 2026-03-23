import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = '@sentinelr/theme';

// Theme color definitions — Neumorphism
export const themes = {
  dark: {
    name: 'dark',
    colors: {
      // Backgrounds
      background: '#1e1e2e',
      surface: '#1e1e2e',
      surfaceSolid: '#1e1e2e',
      card: '#1e1e2e',

      // Neumorphic shadows
      neuLight: '#2a2a3e',
      neuDark: '#121220',
      neuInset: 'rgba(0,0,0,0.35)',

      // Text
      text: '#e4e4ef',
      textSecondary: '#9090a7',
      textMuted: '#5a5a70',

      // Brand colors
      primary: '#3e0d10',
      danger: '#db323f',
      dangerSoft: 'rgba(219, 50, 63, 0.18)',
      warning: '#e6ad13',
      warningSoft: 'rgba(230, 173, 19, 0.15)',
      success: '#22c55e',
      successSoft: 'rgba(34, 197, 94, 0.15)',
      accent: '#3b82f6',
      accentSoft: 'rgba(59, 130, 246, 0.15)',

      // Borders
      border: 'rgba(255, 255, 255, 0.06)',
      borderLight: 'rgba(255, 255, 255, 0.04)',

      // Status bar
      statusBar: 'light',
    },
  },
  light: {
    name: 'light',
    colors: {
      // Backgrounds
      background: '#e0e5ec',
      surface: '#e0e5ec',
      surfaceSolid: '#e0e5ec',
      card: '#e0e5ec',

      // Neumorphic shadows
      neuLight: '#ffffff',
      neuDark: '#a3b1c6',
      neuInset: 'rgba(0,0,0,0.08)',

      // Text
      text: '#2d3748',
      textSecondary: '#5a6578',
      textMuted: '#8f9bb3',

      // Brand colors
      primary: '#3e0d10',
      danger: '#db323f',
      dangerSoft: 'rgba(219, 50, 63, 0.12)',
      warning: '#c9960f',
      warningSoft: 'rgba(201, 150, 15, 0.12)',
      success: '#16a34a',
      successSoft: 'rgba(22, 163, 74, 0.12)',
      accent: '#2563eb',
      accentSoft: 'rgba(37, 99, 235, 0.10)',

      // Borders
      border: 'rgba(0, 0, 0, 0.06)',
      borderLight: 'rgba(0, 0, 0, 0.04)',

      // Status bar
      statusBar: 'dark',
    },
  },
};

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        setThemeState(savedTheme);
      } else {
        // Use system preference as default
        setThemeState(systemColorScheme || 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const currentTheme = themes[theme];
  const colors = currentTheme.colors;
  const isDark = theme === 'dark';

  const value = {
    theme,
    isDark,
    colors,
    setTheme,
    toggleTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
