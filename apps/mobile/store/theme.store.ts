import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme } from 'nativewind';

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  loadTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // novo padrão é light
      setTheme: (theme) => {
        colorScheme.set(theme);
        set({ theme });
      },
      loadTheme: () => {
        // Dummy function just to trigger initialization/hydration if needed
        // The actual hydration is handled by Zustand persist
      }
    }),
    {
      name: 'dryfit-theme',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          colorScheme.set(state.theme);
        }
      },
    }
  )
);
