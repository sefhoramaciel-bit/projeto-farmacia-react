import api from './api';
import { Log } from '../models/types';

export const logsService = {
  getUltimos100: async (): Promise<Log[]> => {
    const response = await api.get<Log[]>('/logs');
    return response.data;
  },

  exportCsv: async (): Promise<Blob> => {
    const response = await api.get('/logs/export', {
      responseType: 'blob'
    });
    return response.data;
  },
};

