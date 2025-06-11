import { useState } from 'react';
import { View, TextInput, Text, Alert, Pressable } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '~/src/contexts/AuthContext';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';
import { Button } from '~/src/components/Button';
import { Modal } from '~/src/components/Modal';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { signIn } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ share?: string }>();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      setShowSuccessModal(true);
    } catch (error) {
      let errorMessage = 'Failed to sign in';
      
      if (error instanceof Error) {
        // Handle specific Supabase error codes
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    if (params.share) {
      router.replace('/(app)');
    } else {
      router.replace('/(app)');
    }
  };

  return (
    <View 
      className="flex-1 justify-center w-full px-4"
      style={{ backgroundColor: colors[isDark ? 'dark' : 'light'].background.primary }}
    >
      <Text 
        className="text-3xl font-bold mb-8 text-center"
        style={{ color: colors[isDark ? 'dark' : 'light'].text.primary }}
      >
        Welcome Back
      </Text>
      
      <TextInput
        className="w-full rounded-lg px-4 py-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ 
          backgroundColor: colors[isDark ? 'dark' : 'light'].background.secondary,
          color: colors[isDark ? 'dark' : 'light'].text.primary
        }}
        placeholderTextColor={colors[isDark ? 'dark' : 'light'].text.tertiary}
      />
      
      <TextInput
        className="w-full rounded-lg px-4 py-3 mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ 
          backgroundColor: colors[isDark ? 'dark' : 'light'].background.secondary,
          color: colors[isDark ? 'dark' : 'light'].text.primary
        }}
        placeholderTextColor={colors[isDark ? 'dark' : 'light'].text.tertiary}
      />
      
      <Button
        title="Sign In"
        onPress={handleSignIn}
        loading={loading}
        className="mb-4"
      />
      
      <Button
        title="Not Now"
        variant="text"
        onPress={() => router.replace('/(app)')}
        className="mb-4"
      />
      
      <View className="flex-row justify-center">
        <Text 
          className="text-gray-600"
          style={{ color: colors[isDark ? 'dark' : 'light'].text.secondary }}
        >
          Don't have an account?{' '}
        </Text>
        <Link href="/auth/sign-up" asChild>
          <Pressable>
            <Text 
              style={{ color: colors[isDark ? 'dark' : 'light'].accent.primary }}
            >
              Sign Up
            </Text>
          </Pressable>
        </Link>
      </View>

      <Modal
        visible={showSuccessModal}
        title="Welcome Back!"
        message={params.share ? "You're all set! Let's share your problem." : "You've successfully signed in."}
        onClose={handleSuccess}
        buttons={[
          {
            text: params.share ? "Share Problem" : "Continue",
            onPress: handleSuccess,
            style: 'default',
          }
        ]}
      />
    </View>
  );
} 