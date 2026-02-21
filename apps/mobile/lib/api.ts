import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.11:3333';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('dryfit_token');
}

async function buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw { response: { status: res.status, data } };
  }
  return data as T;
}

export const api = {
  get: async <T>(path: string): Promise<{ data: T }> => {
    const headers = await buildHeaders();
    const res = await fetch(`${BASE_URL}${path}`, { method: 'GET', headers });
    if (res.status === 401) await SecureStore.deleteItemAsync('dryfit_token');
    const data = await handleResponse<T>(res);
    return { data };
  },

  post: async <T>(path: string, body?: unknown): Promise<{ data: T }> => {
    const headers = await buildHeaders();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) await SecureStore.deleteItemAsync('dryfit_token');
    const data = await handleResponse<T>(res);
    return { data };
  },

  patch: async <T>(path: string, body?: unknown): Promise<{ data: T }> => {
    const headers = await buildHeaders();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) await SecureStore.deleteItemAsync('dryfit_token');
    const data = await handleResponse<T>(res);
    return { data };
  },
};
