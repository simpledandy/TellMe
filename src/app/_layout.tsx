import '../../global.css';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '~/src/contexts/AuthContext';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      // Redirect to the sign-in page if not signed in
      router.replace('/auth/sign-in');
    } else if (user && inAuthGroup) {
      // Redirect to the home page if signed in
      router.replace('/');
    }
  }, [user, loading, segments]);

  return <Stack />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
