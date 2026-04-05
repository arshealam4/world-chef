import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const setupAxiosInterceptor = (token) => {
  axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
};

// Eagerly restore auth header from localStorage before any API calls fire
try {
  const stored = JSON.parse(localStorage.getItem('world-chef-auth') || '{}');
  if (stored?.state?.token) setupAxiosInterceptor(stored.state.token);
} catch { /* ignore parse errors */ }

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,

      login: async (username, password) => {
        const res = await axios.post('/api/auth/login', { username, password });
        setupAxiosInterceptor(res.data.token);
        set({ token: res.data.token, user: res.data.user, isLoggedIn: true });
        return res.data;
      },

      register: async (username, password) => {
        const res = await axios.post('/api/auth/register', { username, password });
        setupAxiosInterceptor(res.data.token);
        set({ token: res.data.token, user: res.data.user, isLoggedIn: true });
        return res.data;
      },

      logout: () => {
        setupAxiosInterceptor(null);
        set({ token: null, user: null, isLoggedIn: false });
      },

      init: () => {
        const { token } = get();
        if (token) setupAxiosInterceptor(token);
      }
    }),
    {
      name: 'world-chef-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) setupAxiosInterceptor(state.token);
      }
    }
  )
);
