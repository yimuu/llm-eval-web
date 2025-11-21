import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/auth';
import { authApi } from '@/api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
      },

      setUser: (user: User) => {
        set({ user });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const user = await authApi.getCurrentUser();
          set({ user });
        } catch (error) {
          set({ token: null, user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);