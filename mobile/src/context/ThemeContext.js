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
      primary: '#e06f29',
      primaryHover: '#c95f20',
      secondary: '#3d09d0',
      secondaryHover: '#32109f',
      danger: '#dc323f',
      dangerSoft: 'rgba(220, 50, 63, 0.18)',
      warning: '#e6ae12',
      warningSoft: 'rgba(230, 174, 18, 0.15)',
      success: '#e6ae12',
      successSoft: 'rgba(230, 174, 18, 0.15)',
      accent: '#3d09d0',
      accentSoft: 'rgba(61, 9, 208, 0.15)',

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
      background: '#f8fafc',
      surface: '#f8fafc',
      surfaceSolid: '#f8fafc',
      card: '#ffffff',

      // Neumorphic shadows
      neuLight: '#ffffff',
      neuDark: '#c8d0db',
      neuInset: 'rgba(0,0,0,0.06)',

      // Text
      text: '#111827',
      textSecondary: '#374151',
      textMuted: '#6b7280',

      // Brand colors
      primary: '#e06f29',
      primaryHover: '#c95f20',
      secondary: '#3d09d0',
      secondaryHover: '#32109f',
      danger: '#dc323f',
      dangerSoft: 'rgba(220, 50, 63, 0.10)',
      warning: '#e6ae12',
      warningSoft: 'rgba(230, 174, 18, 0.10)',
      success: '#e6ae12',
      successSoft: 'rgba(230, 174, 18, 0.10)',
      accent: '#3d09d0',
      accentSoft: 'rgba(61, 9, 208, 0.10)',

      // Borders
      border: '#e5e7eb',
      borderLight: '#f3f4f6',

      // Status bar
      statusBar: 'dark',
    },
  },
};

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
        // setThemeState(savedTheme);
      } else {
        // Use system preference as default
        // setThemeState('light');
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
