import api from '../lib/api';
import type { User } from '../types/api';

export const usersApi = {
  // Get user by ID (admin only)
  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
};
