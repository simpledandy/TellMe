import { Stack, Link } from 'expo-router';

import { Button } from '~/src/components/Button';
import { Container } from '~/src/components/Container';
import { ScreenContent } from '~/src/components/ScreenContent';
import Main from './main';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Home',
        headerShown: false,
      }} />
      {/**<Container>*/}
        <Main />
      {/**</Container>*/}
    </>
  );
}
