import api from './api';
import { Category, CategoryRequest, MessageResponse } from '../models/types';

export const categoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categorias');
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categorias/${id}`);
    return response.data;
  },

  create: async (category: CategoryRequest): Promise<Category> => {
    const response = await api.post<Category>('/categorias', category);
    return response.data;
  },

  update: async (id: string, category: CategoryRequest): Promise<Category> => {
    const response = await api.put<Category>(`/categorias/${id}`, category);
    return response.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/categorias/${id}`);
    return response.data;
  },
};

