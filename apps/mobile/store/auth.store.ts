import { create } from 'zustand';
import { api } from '../lib/api';
import { storage } from '../lib/storage';
import { queryClient } from '../lib/queryClient';
import type { User } from '@dryfit/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    inviteCode: string;
    verificationToken: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    const { token, user } = response.data;
    await storage.setToken(token);
    await storage.setUser(user);
    set({ user, token, isAuthenticated: true, isLoading: false });
    return user;
  },

  register: async (data) => {
    const response = await api.post<{ token: string; user: User }>('/auth/register', data);
    const { token, user } = response.data;
    await storage.setToken(token);
    await storage.setUser(user);
    set({ user, token, isAuthenticated: true });
    return user;
  },

  logout: async () => {
    await storage.clear();
    queryClient.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadStoredAuth: async () => {
    try {
      const [token, user] = await Promise.all([storage.getToken(), storage.getUser()]);
      if (token && user) {
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
