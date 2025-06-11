import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { colors } from '../theme/colors';
import { ROUTES } from '../lib/routes';

export function ProfileIcon() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const theme = colors[isDark ? 'dark' : 'light'];

  const handlePress = () => {
    if (user) {
      router.push(ROUTES.PROFILE.VIEW(user.id));
    } else {
      router.push(ROUTES.AUTH.SIGN_IN);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          padding: 8,
          borderRadius: 20,
        },
      ]}
    >
      <Ionicons 
        name={user ? "person-circle-outline" : "log-in-outline"} 
        size={24} 
        color={theme.text.primary} 
      />
    </Pressable>
  );
} 