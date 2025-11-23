import api from '../lib/api';
import type { Car, CarCreate } from '../types/api';

export const carsApi = {
  getAll: async (cityId?: number): Promise<Car[]> => {
    const params = cityId ? { cityId } : {};
    const response = await api.get<Car[]>('/cars', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Car> => {
    const response = await api.get<Car>(`/cars/${id}`);
    return response.data;
  },

  create: async (data: CarCreate): Promise<Car> => {
    const response = await api.post<Car>('/cars', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CarCreate>): Promise<Car> => {
    const response = await api.put<Car>(`/cars/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<Car> => {
    const response = await api.delete<Car>(`/cars/${id}`);
    return response.data;
  },

  getContracts: async (id: number) => {
    const response = await api.get(`/cars/${id}/contracts`);
    return response.data;
  },
};
