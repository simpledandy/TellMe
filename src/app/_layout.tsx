import '../../global.css';
import { Stack } from 'expo-router';
import { ThemeProvider } from '~/src/contexts/ThemeContext';
import { AuthProvider } from '~/src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
