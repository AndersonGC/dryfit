import '../global.css';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/auth.store';
import AnimatedSplashScreen from '../components/AnimatedSplashScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
    },
  },
});

function AuthGate() {
  const { isAuthenticated, isLoading, user, loadStoredAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return; // Wait until navigation is fully mounted

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      setTimeout(() => router.replace('/(auth)/login'), 1);
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      setTimeout(() => {
        if (user?.role === 'COACH') {
          router.replace('/(coach)/dashboard');
        } else {
          router.replace('/(student)/dashboard');
        }
      }, 1);
    }
  }, [isAuthenticated, isLoading, segments, user, rootNavigationState?.key]);

  return null;
}

export default function RootLayout() {
  const [splashComplete, setSplashComplete] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView className="flex-1">
        <StatusBar style="light" />
        <AuthGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(coach)" />
          <Stack.Screen name="(student)" />
        </Stack>
        {!splashComplete && (
          <AnimatedSplashScreen onFinish={() => setSplashComplete(true)} />
        )}
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
