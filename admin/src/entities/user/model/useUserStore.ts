import { create } from 'zustand';
import { apiClient } from '@/shared/api/axios';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'student' | 'admin';
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setToken: (token: string) => {
    localStorage.setItem('token', token);
    const decoded: any = jwtDecode(token);
    
    // В админке пускаем только админов
    if (decoded.role !== 'admin') {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
      throw new Error('Access denied. Admin role required.');
    }

    set({
      user: {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
      },
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: () => {
    set({ isLoading: true });
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Проверяем срок действия токена (exp в секундах)
        if (decoded.exp * 1000 < Date.now() || decoded.role !== 'admin') {
          localStorage.removeItem('token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        } else {
          set({
            user: {
              id: decoded.sub,
              email: decoded.email,
              username: decoded.username,
              role: decoded.role,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch (e) {
        localStorage.removeItem('token');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
