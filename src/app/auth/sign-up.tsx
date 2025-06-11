import { useState } from 'react';
import { View, TextInput, Text, Alert, Pressable } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '~/src/contexts/AuthContext';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';
import { Button } from '~/src/components/Button';
import { Modal } from '~/src/components/Modal';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ share?: string }>();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Suggest username from email
    const suggestedUsername = text.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    setUsername(suggestedUsername);
  };

  const handleSignUp = async () => {
    if (!email || !password || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, username);
      setShowSuccessModal(true);
    } catch (error) {
      let errorMessage = 'Failed to sign up';
      
      if (error instanceof Error) {
        // Handle specific Supabase error codes
        if (error.message.includes('duplicate key value')) {
          errorMessage = 'This email address is already registered. Please sign in instead.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('username')) {
          errorMessage = 'This username is already taken. Please choose another one.';
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
        Create Account
      </Text>
      
      <TextInput
        className="w-full rounded-lg px-4 py-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={handleEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ 
          backgroundColor: colors[isDark ? 'dark' : 'light'].background.secondary,
          color: colors[isDark ? 'dark' : 'light'].text.primary
        }}
        placeholderTextColor={colors[isDark ? 'dark' : 'light'].text.tertiary}
      />
      
      <TextInput
        className="w-full rounded-lg px-4 py-3 mb-4"
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
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
        title="Sign Up"
        onPress={handleSignUp}
        loading={loading}
        className="mb-4"
      />
      
      <Button
        title="Not Now"
        variant="text"
        onPress={() => router.replace('/(app)')}
        className="mb-4"
      />
      
      <View className="flex-row justify-center items-center">
        <Text 
          className="text-gray-600"
          style={{ color: colors[isDark ? 'dark' : 'light'].text.secondary }}
        >
          Already have an account?{' '}
        </Text>
        <Link href="/auth/sign-in" asChild>
          <Pressable>
            <Text 
              style={{ color: colors[isDark ? 'dark' : 'light'].accent.primary }}
            >
              Sign In
            </Text>
          </Pressable>
        </Link>
      </View>

      <Modal
        visible={showSuccessModal}
        title="Welcome!"
        message={params.share ? "Your account is ready! Let's share your problem." : "Your account has been created successfully."}
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