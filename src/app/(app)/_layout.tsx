import { Stack, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { useAuth } from '~/src/contexts/AuthContext';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';
import { ThemeToggle } from '~/src/components/ThemeToggle';

export default function AppLayout() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors[isDark ? 'dark' : 'light'].background.primary,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors[isDark ? 'dark' : 'light'].text.primary,
        },
        headerRight: () => (
          <View className="flex-row items-center">
            <ThemeToggle />
            <Pressable 
              onPress={() => router.push('/feed')}
              className="mx-4"
            >
              <Text style={{ color: colors[isDark ? 'dark' : 'light'].accent.primary }}>
                View Feed
              </Text>
            </Pressable>
            {user && (
              <Pressable onPress={signOut} className="mr-4">
                <Text style={{ color: colors[isDark ? 'dark' : 'light'].accent.primary }}>
                  Sign Out
                </Text>
              </Pressable>
            )}
          </View>
        ),
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="feed"
        options={{
          title: 'Feed',
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
} 