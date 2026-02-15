import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SessionTimer } from '@/src/components/ui/SessionTimer';
import { useProgressStore } from '@/src/stores/progressStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const router = useRouter();
  const profile = useProgressStore((s) => s.profile);
  const startSession = useProgressStore((s) => s.startSession);
  const initializeLetterProgress = useProgressStore((s) => s.initializeLetterProgress);
  const letterProgress = useProgressStore((s) => s.letterProgress);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // Oturumu baslat
      startSession();

      // Harf ilerlemesi bos ise baslat (ilk acilis)
      if (Object.keys(letterProgress).length === 0) {
        initializeLetterProgress();
      }

      // Profil yoksa onboarding'e yonlendir
      if (!profile) {
        router.replace('/onboarding');
      }
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{ presentation: 'card', animation: 'fade' }}
        />
        <Stack.Screen
          name="letter/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="trace/[id]"
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="game/[type]"
          options={{ presentation: 'card', animation: 'slide_from_bottom' }}
        />
      </Stack>
      <SessionTimer />
    </GestureHandlerRootView>
  );
}
