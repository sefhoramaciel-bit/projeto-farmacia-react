import { create } from 'zustand';
import api from './api';
import { cryptoService } from './crypto';
import { User, LoginRequest, LoginResponse } from '../models/types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  loadStoredUser: () => void;
  getToken: () => string | null;
}

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'currentUser_enc';
const OLD_USER_KEY = 'currentUser';

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,

  loadStoredUser: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const encryptedUser = localStorage.getItem(USER_KEY);
    
    if (token && encryptedUser) {
      try {
        const user = cryptoService.decryptObject<User>(encryptedUser);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
        } else {
          get().logout();
        }
      } catch (e) {
        console.error('Erro ao carregar usuário do storage:', e);
        get().logout();
      }
    } else if (token) {
      // Migração: Se existe token mas não usuário criptografado
      const oldUserStr = localStorage.getItem(OLD_USER_KEY);
      if (oldUserStr) {
        try {
          const user = JSON.parse(oldUserStr);
          const encryptedUser = cryptoService.encryptObject(user);
          localStorage.setItem(USER_KEY, encryptedUser);
          localStorage.removeItem(OLD_USER_KEY);
          set({ currentUser: user, isAuthenticated: true });
        } catch (e) {
          console.error('Erro ao migrar usuário do storage:', e);
          get().logout();
        }
      }
    }
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const request: LoginRequest = { email, password };
    const response = await api.post<LoginResponse>('/auth/login', request);
    
    const { token, usuario } = response.data;
    localStorage.setItem(TOKEN_KEY, token);
    
    const encryptedUser = cryptoService.encryptObject(usuario);
    localStorage.setItem(USER_KEY, encryptedUser);
    
    set({ currentUser: usuario, isAuthenticated: true });
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ currentUser: null, isAuthenticated: false });
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
}));

// Carrega usuário ao inicializar
if (typeof window !== 'undefined') {
  useAuthStore.getState().loadStoredUser();
}

