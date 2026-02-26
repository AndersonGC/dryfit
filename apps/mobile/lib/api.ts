import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.15:3333';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('dryfit_token');
}

async function buildHeaders(extra?: Record<string, string>): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
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

  delete: async <T = void>(path: string): Promise<{ data: T }> => {
    const headers = await buildHeaders();
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers,
    });
    if (res.status === 401) await SecureStore.deleteItemAsync('dryfit_token');
    // If 204 No Content, return empty object
    if (res.status === 204) return { data: {} as T };
    const data = await handleResponse<T>(res);
    return { data };
  },
};
