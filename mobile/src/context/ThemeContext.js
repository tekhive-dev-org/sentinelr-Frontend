import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = '@sentinelr/theme';

// Theme color definitions
export const themes = {
  dark: {
    name: 'dark',
    colors: {
      // Backgrounds
      background: '#000000',
      surface: 'rgba(62, 13, 16, 0.35)',
      surfaceSolid: '#1a0a0b',
      card: 'rgba(62, 13, 16, 0.4)',
      
      // Text
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textMuted: '#6b7280',
      
      // Brand colors (consistent across themes)
      primary: '#3e0d10',
      danger: '#db323f',
      warning: '#e6ad13',
      success: '#22c55e',
      
      // Borders
      border: 'rgba(62, 13, 16, 0.6)',
      borderLight: 'rgba(255, 255, 255, 0.1)',
      
      // Status bar
      statusBar: 'light',
    },
  },
  light: {
    name: 'light',
    colors: {
      // Backgrounds
      background: '#f8f9fa',
      surface: 'rgba(62, 13, 16, 0.08)',
      surfaceSolid: '#ffffff',
      card: 'rgba(62, 13, 16, 0.06)',
      
      // Text
      text: '#1f2937',
      textSecondary: '#4b5563',
      textMuted: '#9ca3af',
      
      // Brand colors (consistent across themes)
      primary: '#3e0d10',
      danger: '#db323f',
      warning: '#c9960f',
      success: '#16a34a',
      
      // Borders
      border: 'rgba(62, 13, 16, 0.15)',
      borderLight: 'rgba(0, 0, 0, 0.08)',
      
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
