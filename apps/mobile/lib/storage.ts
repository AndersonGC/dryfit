import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'dryfit_token';
const USER_KEY = 'dryfit_user';

export const storage = {
  setToken: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  getToken: async (): Promise<string | null> => {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  deleteToken: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  setUser: async (user: object) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  getUser: async () => {
    const data = await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  clear: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
