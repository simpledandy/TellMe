import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, Text, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/src/contexts/AuthContext';
import { Button } from '~/src/components/Button';
import { Modal } from '~/src/components/Modal';
import { colors } from '~/src/theme/colors';
import { useTheme } from '~/src/contexts/ThemeContext';
import { DarkTheme } from '@react-navigation/native';

type ThemeMode = 'light' | 'dark' | 'system';

interface AlertModal {
  visible: boolean;
  title: string;
  message: string;
  buttons?: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

export default function MainScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [alertModal, setAlertModal] = useState<AlertModal>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const startEditing = () => {
    setIsEditing(true);
  };

  const resetScreen = () => {
    setIsEditing(false);
    setInputText('');
  };

  const handleShare = async () => {
    if (!user) {
      setAlertModal({
        visible: true,
        title: 'Sign In Required',
        message: 'Please sign in to share your problem.',
        buttons: [
          {
            text: 'Cancel',
            onPress: () => {
              setAlertModal({ ...alertModal, visible: false });
              resetScreen();
            },
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () => {
              setAlertModal({ ...alertModal, visible: false });
              router.push('/auth/sign-in?share=true');
            },
            style: 'default',
          },
        ],
      });
      return;
    }

    if (!inputText.trim()) {
      setAlertModal({
        visible: true,
        title: 'Empty Problem',
        message: 'Please enter your problem before sharing.',
        buttons: [
          {
            text: 'OK',
            onPress: () => setAlertModal({ ...alertModal, visible: false }),
            style: 'default',
          },
        ],
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('problems')
        .insert([
          {
            description: inputText.trim(),
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      setAlertModal({
        visible: true,
        title: 'Success!',
        message: 'Your problem has been shared.',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              setAlertModal({ ...alertModal, visible: false });
              resetScreen();
            },
            style: 'default',
          },
        ],
      });
    } catch (error) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Failed to share your problem. Please try again.',
        buttons: [
          {
            text: 'OK',
            onPress: () => setAlertModal({ ...alertModal, visible: false }),
            style: 'default',
          },
        ],
      });
    }
  };

  const goToFeed = () => {
    router.push('/feed');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: colors[isDark ? 'dark' : 'light'].background.primary }}
    >
      {!isEditing ? (
        <Animated.View 
          style={{ opacity: fadeAnim }}
          className="flex-1 justify-center items-center px-6"
        >
          <Pressable 
            onPress={startEditing}
            className="w-full items-center"
          >
            <Text 
              className="text-4xl font-light text-center mb-8"
              style={{ color: colors[isDark ? 'dark' : 'light'].text.primary }}
            >
              What is your Problem Now?
            </Text>
          </Pressable>
          <Button
            title="No problem now"
            variant="text"
            onPress={goToFeed}
            className="mt-4"
          />
        </Animated.View>
      ) : (
        <View className="flex-1 px-6">
          <View className="flex-1 justify-center">
            <View className="relative">
              <Text 
                className="text-4xl font-light absolute w-full text-center"
                style={{ 
                  display: inputText.length > 0 ? 'none' : 'flex',
                  color: colors[isDark ? 'dark' : 'light'].text.tertiary
                }}
              >
                Type your problem here...
              </Text>
              <TextInput
                className="text-6xl font-light top-2.5 text-center"
                value={inputText}
                onChangeText={setInputText}
                autoFocus={true}
                multiline
                textAlign="center"
                style={{ color: colors[isDark ? 'dark' : 'light'].text.primary }}
                cursorColor={colors[isDark ? 'dark' : 'light'].text.primary}
                placeholderTextColor={colors[isDark ? 'dark' : 'light'].text.tertiary}
              />
            </View>
          </View>
          <View className="py-4">
            <Button
              title="Share Problem"
              onPress={handleShare}
              size="lg"
              className="self-end"
              disabled={inputText.length === 0}
            />
          </View>
        </View>
      )}

      <Modal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onClose={() => {
          setAlertModal({ ...alertModal, visible: false });
          if (alertModal.title === 'Sign In Required') {
            resetScreen();
          }
        }}
        buttons={alertModal.buttons}
      />
    </KeyboardAvoidingView>
  );
} 