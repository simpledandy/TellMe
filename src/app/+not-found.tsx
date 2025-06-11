import { Link } from 'expo-router';
import { Text, View, Pressable } from 'react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 justify-center items-center px-4">
      <Text className="text-2xl font-bold mb-4">This screen doesn't exist.</Text>
      <Link href="/" asChild>
        <Pressable>
          <Text className="text-blue-500">Go to home screen!</Text>
        </Pressable>
      </Link>
    </View>
  );
}
