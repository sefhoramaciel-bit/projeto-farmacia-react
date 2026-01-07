import api from './api';
import { StockRequest, StockResponse, StockOperationResponse } from '../models/types';

export const stockService = {
  entrada: async (request: StockRequest): Promise<StockOperationResponse> => {
    const response = await api.post<StockOperationResponse>('/estoque/entrada', request);
    return response.data;
  },

  saida: async (request: StockRequest): Promise<StockOperationResponse> => {
    const response = await api.post<StockOperationResponse>('/estoque/saida', request);
    return response.data;
  },

  getByMedicamento: async (medicamentoId: string): Promise<StockResponse> => {
    const response = await api.get<StockResponse>(`/estoque/${medicamentoId}`);
    return response.data;
  },
};

