import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform, Text, Animated, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/src/contexts/AuthContext';
import { Button } from '~/src/components/Button';
import { Modal } from '~/src/components/Modal';
import { colors } from '~/src/theme/colors';
import { useTheme } from '~/src/contexts/ThemeContext';
import { createProblem } from '~/src/lib/database';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
    setTitle('');
    setDescription('');
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

    if (!title.trim() || !description.trim()) {
      setAlertModal({
        visible: true,
        title: 'Empty Fields',
        message: 'Please enter both title and description before sharing.',
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
      await createProblem({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        status: 'open',
        is_public: true,
        category_id: null,
        solved_at: null
      });

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
        <ScrollView 
          className="flex-1 px-6"
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            className="w-full rounded-lg px-4 py-3 mb-4 mt-8"
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={{ 
              backgroundColor: colors[isDark ? 'dark' : 'light'].background.secondary,
              color: colors[isDark ? 'dark' : 'light'].text.primary
            }}
            placeholderTextColor={colors[isDark ? 'dark' : 'light'].text.tertiary}
          />
          
          <TextInput
            className="w-full rounded-lg px-4 py-3 mb-6"
            placeholder="Describe your problem..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ 
              backgroundColor: colors[isDark ? 'dark' : 'light'].background.secondary,
              color: colors[isDark ? 'dark' : 'light'].text.primary,
              minHeight: 100
            }}
            placeholderTextColor={colors[isDark ? 'dark' : 'light'].text.tertiary}
          />

          <View className="flex-row justify-between mb-8">
            <Button
              title="Cancel"
              variant="text"
              onPress={resetScreen}
            />
            <Button
              title="Share"
              onPress={handleShare}
            />
          </View>
        </ScrollView>
      )}

      <Modal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        buttons={alertModal.buttons}
        onClose={() => setAlertModal({ ...alertModal, visible: false })}
      />
    </KeyboardAvoidingView>
  );
} 