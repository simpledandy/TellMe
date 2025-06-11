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
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { signUp } = useAuth();
  const { isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ share?: string }>();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    if (params.share) {
      router.replace('/(app)');
    } else {
      router.back();
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
        title="Sign Up"
        onPress={handleSignUp}
        loading={loading}
        className="mb-4"
      />
      
      <View className="flex-row justify-center">
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