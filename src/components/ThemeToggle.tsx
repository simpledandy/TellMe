import React from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { isDark } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Pressable
      onPress={toggleTheme}
      className="p-2 rounded-full"
      style={{ backgroundColor: colors[isDark ? 'dark' : 'light'].background.secondary }}
    >
      <Ionicons
        name={isDark ? 'sunny' : 'moon'}
        size={24}
        color={colors[isDark ? 'dark' : 'light'].accent.primary}
      />
    </Pressable>
  );
} 