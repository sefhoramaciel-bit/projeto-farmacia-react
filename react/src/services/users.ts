import api from './api';
import { User, MessageResponse } from '../models/types';

export interface UserRequest {
  nome: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'VENDEDOR';
  avatarUrl?: string;
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/usuarios');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/usuarios/${id}`);
    return response.data;
  },

  create: async (user: UserRequest, avatarFile?: File): Promise<User> => {
    const formData = new FormData();
    formData.append('usuario', JSON.stringify(user));
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    const response = await api.post<User>('/usuarios', formData);
    return response.data;
  },

  update: async (id: string, user: UserRequest, avatarFile?: File): Promise<User> => {
    const formData = new FormData();
    formData.append('usuario', JSON.stringify(user));
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }
    const response = await api.put<User>(`/usuarios/${id}`, formData);
    return response.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/usuarios/${id}`);
    return response.data;
  },

  uploadAvatar: async (id: string, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<User>(`/usuarios/${id}/avatar`, formData);
    return response.data;
  },
};

