import { create } from 'zustand';
import { userApi, type User } from '../api/userApi';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, // Изначально грузимся, пока не проверим токен

  login: (token: string) => {
    localStorage.setItem('token', token);
    set({ isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isAuthenticated: false, user: null, isLoading: false });
        return;
      }
      const user = await userApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
