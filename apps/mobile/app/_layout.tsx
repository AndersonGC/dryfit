import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/auth.store';

import { queryClient } from '../lib/queryClient';

function AuthGate() {
  const { isAuthenticated, isLoading, user, loadStoredAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCoachGroup = segments[0] === '(coach)';
    const inStudentGroup = segments[0] === '(student)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated && inAuthGroup) {
      if (user?.role === 'COACH') {
        router.replace('/(coach)/dashboard');
      } else {
        router.replace('/(student)/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, segments, user]);

  return null;
}

export default function RootLayout() {
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
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
