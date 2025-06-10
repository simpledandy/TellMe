import { Stack } from 'expo-router';
import { ProblemFeed } from '~/src/components/ProblemFeed';

export default function Feed() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Problem Feed',
          headerLargeTitle: true,
        }} 
      />
      <ProblemFeed />
    </>
  );
} 