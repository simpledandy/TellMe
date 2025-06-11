import { Stack, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAuth } from '~/src/contexts/AuthContext';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';
import { ThemeToggle } from '~/src/components/ThemeToggle';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '~/src/lib/routes';

export default function AppLayout() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];

  const handleProfilePress = () => {
    if (user) {
      router.push(ROUTES.PROFILE.VIEW(user.id));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background.secondary,
          },
          headerTintColor: theme.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerRight: () => (
            <View className="flex-row items-center gap-4">
              <ThemeToggle />
              <Pressable
                onPress={handleProfilePress}
                style={({ pressed }) => [
                  styles.profileButton,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Ionicons name="person-circle-outline" size={24} color={theme.text.primary} />
              </Pressable>
            </View>
          ),
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'TellMe',
          }}
        />
        <Stack.Screen
          name="problem/[id]"
          options={{
            title: 'Problem Details',
          }}
        />
        <Stack.Screen
          name="profile/[id]"
          options={{
            title: 'Profile',
          }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{
            title: 'Edit Profile',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileButton: {
    padding: 8,
    marginRight: 8,
  },
}); 