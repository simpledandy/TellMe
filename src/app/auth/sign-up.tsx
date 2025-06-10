import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useAuth } from '~/src/contexts/AuthContext';
import { Container } from '~/src/components/Container';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password);
      Alert.alert(
        'Success',
        'Please check your email for the confirmation link',
        [{ text: 'OK', onPress: () => {} }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Sign Up' }} />
      <View className="flex-1 justify-center w-full px-4">
        <Text className="text-3xl font-bold mb-8 text-center">Create Account</Text>
        
        <TextInput
          className="w-full bg-gray-100 rounded-lg px-4 py-3 mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          className="w-full bg-gray-100 rounded-lg px-4 py-3 mb-4"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          className="w-full bg-gray-100 rounded-lg px-4 py-3 mb-6"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          className="w-full bg-blue-500 rounded-lg py-3 mb-4"
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
        
        <View className="flex-row justify-center">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href="/auth/sign-in" className="text-blue-500">
            Sign In
          </Link>
        </View>
      </View>
    </Container>
  );
} 