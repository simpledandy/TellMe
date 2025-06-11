import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '~/src/contexts/ThemeContext';
import { colors } from '~/src/theme/colors';
import { ThemeToggle } from '~/src/components/ThemeToggle';
import { ProfileIcon } from '~/src/components/ProfileIcon';

export default function AppLayout() {
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];

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
              <ProfileIcon />
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
}); 