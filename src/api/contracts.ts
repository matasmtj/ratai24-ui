import api from '../lib/api';
import type { Contract, ContractCreate, ContractUpdate, ContractComplete } from '../types/api';

export const contractsApi = {
  getAll: async (): Promise<Contract[]> => {
    const response = await api.get<Contract[]>('/contracts');
    return response.data;
  },

  getById: async (id: number): Promise<Contract> => {
    const response = await api.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  create: async (data: ContractCreate): Promise<Contract> => {
    const response = await api.post<Contract>('/contracts', data);
    return response.data;
  },

  update: async (id: number, data: ContractUpdate): Promise<Contract> => {
    const response = await api.put<Contract>(`/contracts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<Contract> => {
    const response = await api.delete<Contract>(`/contracts/${id}`);
    return response.data;
  },

  complete: async (id: number, data: ContractComplete): Promise<Contract> => {
    const response = await api.post<Contract>(`/contracts/${id}/complete`, data);
    return response.data;
  },
};
