import api from './api';
import { Customer, CustomerRequest, MessageResponse } from '../models/types';

export const customersService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/clientes');
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get<Customer>(`/clientes/${id}`);
    return response.data;
  },

  getByCpf: async (cpf: string): Promise<Customer | null> => {
    const cleanCpf = cpf.replace(/\D/g, '');
    const customers = await api.get<Customer[]>('/clientes');
    const customer = customers.data.find(c => c.cpf.replace(/\D/g, '') === cleanCpf);
    return customer || null;
  },

  create: async (customer: CustomerRequest): Promise<Customer> => {
    const response = await api.post<Customer>('/clientes', customer);
    return response.data;
  },

  update: async (id: string, customer: CustomerRequest): Promise<Customer> => {
    const response = await api.put<Customer>(`/clientes/${id}`, customer);
    return response.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const response = await api.delete<MessageResponse>(`/clientes/${id}`);
    return response.data;
  },
};

