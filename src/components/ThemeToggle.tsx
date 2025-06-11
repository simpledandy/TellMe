import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const currentTheme = theme === 'system' ? 'light' : theme;

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Pressable 
      onPress={toggleTheme}
      className="px-4 py-2 rounded-full"
      style={{ backgroundColor: colors[currentTheme].background.secondary }}
    >
      <Text style={{ color: colors[currentTheme].text.primary }}>
        {theme === 'light' ? '🌙' : '☀️'}
      </Text>
    </Pressable>
  );
} 