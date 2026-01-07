import api from './api';
import { Alert } from '../models/types';

export const alertsService = {
  getAll: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alertas');
    return response.data;
  },

  getNaoLidos: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alertas/nao-lidos');
    return response.data;
  },

  getEstoqueBaixo: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alertas/estoque-baixo');
    return response.data;
  },

  getValidadeProxima: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alertas/validade-proxima');
    return response.data;
  },

  getValidadeVencida: async (): Promise<Alert[]> => {
    const response = await api.get<Alert[]>('/alertas/validade-vencida');
    return response.data;
  },

  gerarAlertas: async (): Promise<string> => {
    const response = await api.post('/alertas/gerar', {}, { responseType: 'text' });
    return response.data;
  },

  marcarComoLido: async (id: string): Promise<Alert> => {
    const response = await api.put<Alert>(`/alertas/${id}/ler`, {});
    return response.data;
  },
};

