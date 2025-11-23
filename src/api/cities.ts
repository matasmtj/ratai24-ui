import api from '../lib/api';
import type { City, CityCreate } from '../types/api';

export const citiesApi = {
  getAll: async (): Promise<City[]> => {
    const response = await api.get<City[]>('/cities');
    return response.data;
  },

  getById: async (id: number): Promise<City> => {
    const response = await api.get<City>(`/cities/${id}`);
    return response.data;
  },

  create: async (data: CityCreate): Promise<City> => {
    const response = await api.post<City>('/cities', data);
    return response.data;
  },

  update: async (id: number, data: CityCreate): Promise<City> => {
    const response = await api.put<City>(`/cities/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<City> => {
    const response = await api.delete<City>(`/cities/${id}`);
    return response.data;
  },

  getCars: async (id: number) => {
    const response = await api.get(`/cities/${id}/cars`);
    return response.data;
  },
};
