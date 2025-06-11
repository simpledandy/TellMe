import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../theme/colors';
import { createComment } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Modal } from './Modal';

interface CommentInputProps {
  problemId: string;
  onCommentAdded?: () => void;
}

export function CommentInput({ problemId, onCommentAdded }: CommentInputProps) {
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];
  const { user } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    if (!user) {
      setShowSignInModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment({
        problem_id: problemId,
        user_id: user.id,
        content: content.trim(),
      });
      setContent('');
      onCommentAdded?.();
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    setShowSignInModal(false);
    router.push('/auth/sign-in');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.secondary }]}>
      <TextInput
        style={[styles.input, { color: theme.text.primary }]}
        placeholder="Write a comment..."
        placeholderTextColor={theme.text.tertiary}
        value={content}
        onChangeText={setContent}
        multiline
        maxLength={1000}
        editable={!isSubmitting}
      />
      <Pressable
        style={[
          styles.submitButton,
          {
            backgroundColor: content.trim() ? theme.accent.primary : theme.background.primary,
            opacity: isSubmitting ? 0.7 : 1,
          },
        ]}
        onPress={handleSubmit}
        disabled={!content.trim() || isSubmitting}
      >
        <Text style={[styles.submitText, { color: content.trim() ? '#fff' : theme.text.tertiary }]}>
          {isSubmitting ? 'Posting...' : 'Post'}
        </Text>
      </Pressable>

      <Modal
        visible={showSignInModal}
        title="Sign In Required"
        message="Please sign in to leave a comment."
        buttons={[
          {
            text: 'Cancel',
            onPress: () => setShowSignInModal(false),
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: handleSignIn,
            style: 'default',
          },
        ]}
        onClose={() => setShowSignInModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    minHeight: 80,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 