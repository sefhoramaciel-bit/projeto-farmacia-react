import api from './api';
import { Sale, SaleRequest, MessageResponse } from '../models/types';

export const salesService = {
  getAll: async (): Promise<Sale[]> => {
    const response = await api.get<Sale[]>('/vendas');
    return response.data;
  },

  getById: async (id: string): Promise<Sale> => {
    const response = await api.get<Sale>(`/vendas/${id}`);
    return response.data;
  },

  getByCliente: async (clienteId: string): Promise<Sale[]> => {
    const response = await api.get<Sale[]>(`/vendas/cliente/${clienteId}`);
    return response.data;
  },

  create: async (sale: SaleRequest): Promise<Sale> => {
    const response = await api.post<Sale>('/vendas', sale);
    return response.data;
  },

  cancelar: async (id: string): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>(`/vendas/${id}/cancelar`, {});
    return response.data;
  },

  createCancelada: async (sale: SaleRequest): Promise<Sale> => {
    const response = await api.post<Sale>('/vendas/cancelada', sale);
    return response.data;
  },
};

