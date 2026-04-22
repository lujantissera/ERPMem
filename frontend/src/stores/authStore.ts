import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const storedUser = localStorage.getItem('mem_user');
const storedToken = localStorage.getItem('mem_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,

  login: (user, token) => {
    localStorage.setItem('mem_user', JSON.stringify(user));
    localStorage.setItem('mem_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('mem_user');
    localStorage.removeItem('mem_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    localStorage.setItem('mem_user', JSON.stringify(user));
    set({ user });
  },
}));
