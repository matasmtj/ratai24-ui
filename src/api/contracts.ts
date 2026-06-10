import api from '../lib/api';
import type { Contract, ContractCreate, ContractUpdate, ContractComplete } from '../types/api';

export const contractsApi = {
  // Get all contracts (ADMIN only)
  getAll: async (): Promise<Contract[]> => {
    const response = await api.get<Contract[]>('/contracts');
    return response.data;
  },

  // Get current user's contracts (USER endpoint)
  getMy: async (): Promise<Contract[]> => {
    const response = await api.get<Contract[]>('/contracts/my');
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

  confirmDeposit: async (id: number): Promise<Contract> => {
    const response = await api.post<Contract>(`/contracts/${id}/confirm-deposit`);
    return response.data;
  },

  acquireLock: async (id: number): Promise<Contract> => {
    const response = await api.post<Contract>(`/contracts/${id}/lock`);
    return response.data;
  },

  releaseLock: async (id: number): Promise<Contract> => {
    const response = await api.delete<Contract>(`/contracts/${id}/lock`);
    return response.data;
  },
};
