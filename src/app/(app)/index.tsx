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

export default function Main() {
  const [inputText, setInputText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(1));
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [alertModal, setAlertModal] = useState<AlertModal>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string, buttons?: AlertModal['buttons']) => {
    setAlertModal({
      visible: true,
      title,
      message,
      buttons,
    });
  };

  const hideAlert = () => {
    setAlertModal(prev => ({ ...prev, visible: false }));
  };

  const handleShare = async () => {
    try {
      if (!user) {
        showAlert(
          'Sign in to Share',
          'You need to sign in to share your problems.',
          [
            {
              text: 'Sign In',
              onPress: () => {
                hideAlert();
                router.push({
                  pathname: '/auth/sign-in',
                  params: { share: 'true' }
                });
              },
              style: 'default',
            },
            {
              text: 'Sign Up',
              onPress: () => {
                hideAlert();
                router.push({
                  pathname: '/auth/sign-up',
                  params: { share: 'true' }
                });
              },
              style: 'default',
            },
            {
              text: 'Cancel',
              onPress: hideAlert,
              style: 'cancel',
            },
          ]
        );
        return;
      }

      const { data, error } = await supabase
        .from('problems')
        .insert([
          { 
            description: inputText,
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting problem:', error);
        showAlert('Error', 'Failed to share your problem. Please try again.');
      } else {
        console.log('Problem shared:', data);
        setInputText('');
        setIsEditing(false);
        // Fade in the welcome screen
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        
        // Show success message
        showAlert(
          'Success',
          'Your problem has been shared!',
          [
            {
              text: 'View Feed',
              onPress: () => {
                hideAlert();
                router.push('/feed');
              },
              style: 'default',
            },
            {
              text: 'Stay Here',
              onPress: hideAlert,
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    // Fade out the welcome screen
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
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
        onClose={hideAlert}
        buttons={alertModal.buttons}
      />
    </KeyboardAvoidingView>
  );
} 