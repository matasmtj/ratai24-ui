import api from '../lib/api';
import type { User, UserCreate, UserUpdate, UserAdminUpdate } from '../types/api';

export const usersApi = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  // Update current user profile
  updateCurrentUser: async (data: UserUpdate): Promise<User> => {
    const response = await api.put<User>('/users/me', data);
    return response.data;
  },

  // Admin: Get all users with optional filters
  getAllUsers: async (params?: { role?: string; search?: string }): Promise<User[]> => {
    const response = await api.get<User[]>('/users', { params });
    return response.data;
  },

  // Admin: Get user by ID
  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Admin: Create new user
  createUser: async (data: UserCreate): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  // Admin: Update user
  updateUser: async (id: number, data: UserAdminUpdate): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  // Admin: Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

