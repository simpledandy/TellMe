import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useAuth } from '~/src/contexts/AuthContext';
import { Container } from '~/src/components/Container';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Stack.Screen options={{ title: 'Sign In' }} />
      <View className="flex-1 justify-center w-full px-4">
        <Text className="text-3xl font-bold mb-8 text-center">Welcome Back</Text>
        
        <TextInput
          className="w-full bg-gray-100 rounded-lg px-4 py-3 mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          className="w-full bg-gray-100 rounded-lg px-4 py-3 mb-6"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          className="w-full bg-blue-500 rounded-lg py-3 mb-4"
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? 'Signing in...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <View className="flex-row justify-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <Link href="/auth/sign-up" className="text-blue-500">
            Sign Up
          </Link>
        </View>
      </View>
    </Container>
  );
} 