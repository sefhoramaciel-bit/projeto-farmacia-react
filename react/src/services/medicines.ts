import api from './api';
import { Medicine, MedicineRequest, MessageResponse } from '../models/types';

export const medicinesService = {
  getAll: async (): Promise<Medicine[]> => {
    const response = await api.get<Medicine[]>('/medicamentos');
    return response.data;
  },

  getActive: async (): Promise<Medicine[]> => {
    const response = await api.get<Medicine[]>('/medicamentos/ativos');
    return response.data;
  },

  getById: async (id: string): Promise<Medicine> => {
    const response = await api.get<Medicine>(`/medicamentos/${id}`);
    return response.data;
  },

  create: async (medicine: MedicineRequest, files: File[]): Promise<Medicine> => {
    const formData = new FormData();
    formData.append('medicamento', JSON.stringify(medicine));
    if (files && files.length > 0) {
      files.forEach(file => formData.append('files', file));
    }
    const response = await api.post<Medicine>('/medicamentos', formData);
    return response.data;
  },

  update: async (id: string, medicine: MedicineRequest, files: File[] | null): Promise<Medicine> => {
    const formData = new FormData();
    formData.append('medicamento', JSON.stringify(medicine));
    if (files && files.length > 0) {
      files.forEach(file => formData.append('files', file));
    }
    const response = await api.put<Medicine>(`/medicamentos/${id}`, formData);
    return response.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/medicamentos/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, ativo: boolean): Promise<Medicine> => {
    const response = await api.patch<Medicine>(`/medicamentos/${id}/status`, null, {
      params: { ativo: ativo.toString() }
    });
    return response.data;
  },

  uploadImages: async (id: string, files: File[]): Promise<Medicine> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await api.post<Medicine>(`/medicamentos/${id}/imagens`, formData);
    return response.data;
  },

  removeImages: async (id: string): Promise<Medicine> => {
    const response = await api.delete<Medicine>(`/medicamentos/${id}/imagens`);
    return response.data;
  },
};

