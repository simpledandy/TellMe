import React from 'react';
import { View, Text, Modal as RNModal, Pressable, StyleSheet } from 'react-native';
import { Button } from './Button';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../theme/colors';

interface ModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

export function Modal({ visible, title, message, onClose, buttons = [] }: ModalProps) {
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.container, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>
          <View style={styles.buttonContainer}>
            {buttons.length > 0 ? (
              buttons.map((button, index) => (
                <Button
                  key={index}
                  title={button.text}
                  onPress={button.onPress}
                  variant={button.style === 'destructive' ? 'destructive' : 'default'}
                  className="flex-1 mx-1"
                />
              ))
            ) : (
              <Button
                title="OK"
                onPress={onClose}
                className="flex-1"
              />
            )}
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
}); 