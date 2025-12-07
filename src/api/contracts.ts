import api from '../lib/api';
import type { Contract, ContractCreate, ContractUpdate, ContractComplete } from '../types/api';

export const contractsApi = {
  // Get all contracts (ADMIN only)
  getAll: async (): Promise<Contract[]> => {
    console.log('contractsApi.getAll - Making request to /contracts');
    try {
      const response = await api.get<Contract[]>('/contracts');
      console.log('contractsApi.getAll - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('contractsApi.getAll - Error:', error);
      throw error;
    }
  },

  // Get current user's contracts (USER endpoint)
  getMy: async (): Promise<Contract[]> => {
    console.log('contractsApi.getMy - Making request to /contracts/my');
    try {
      const response = await api.get<Contract[]>('/contracts/my');
      console.log('contractsApi.getMy - Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('contractsApi.getMy - Error:', error);
      throw error;
    }
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

  // Cancel a contract (USER can cancel their own DRAFT contracts)
  cancel: async (id: number): Promise<Contract> => {
    const response = await api.post<Contract>(`/contracts/${id}/cancel`);
    return response.data;
  },

  // Activate a contract (ADMIN only - changes DRAFT to ACTIVE)
  activate: async (id: number): Promise<Contract> => {
    const response = await api.post<Contract>(`/contracts/${id}/activate`);
    return response.data;
  },
};
