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
        headerTintColor: colors[isDark ? 'dark' : 'light'].text.primary,
        headerShadowVisible: false,
        headerRight: () => (
          <View className="flex-row items-center gap-4">
            <ThemeToggle />
            <Pressable
              onPress={() => router.push('/feed')}
              className="px-2"
            >
            </Pressable>
            {user && (
              <Pressable
                onPress={signOut}
                className="px-2"
              >
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