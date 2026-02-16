import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
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
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Nunito-Bold': require('../assets/fonts/Nunito-Bold.ttf'),
    'Nunito-ExtraBold': require('../assets/fonts/Nunito-ExtraBold.ttf'),
    'Nunito-Black': require('../assets/fonts/Nunito-Black.ttf'),
    ...FontAwesome.font,
  });

  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  // Store hydration'ini bekle
  useEffect(() => {
    const unsub = useProgressStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // Zaten hydrate olmussa hemen set et
    if (useProgressStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Font + hydration hazir oldugunda baslatma islemleri
  useEffect(() => {
    if (loaded && hydrated) {
      const state = useProgressStore.getState();

      SplashScreen.hideAsync();
      state.startSession();

      // Harf ilerlemesi bos ise baslat (ilk acilis)
      if (Object.keys(state.letterProgress).length === 0) {
        state.initializeLetterProgress();
      }

      // Profil yoksa onboarding'e yonlendir
      if (!state.profile) {
        router.replace('/onboarding');
      }
    }
  }, [loaded, hydrated, router]);

  if (!loaded || !hydrated) {
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
