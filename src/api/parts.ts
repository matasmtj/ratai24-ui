import api from '../lib/api';
import type { Part, PartCreate, PartUpdate, PartImage } from '../types/api';

export const partsApi = {
  getAll: async (filters?: {
    make?: string;
    model?: string;
    year?: number;
    condition?: string;
    search?: string;
  }): Promise<Part[]> => {
    const params = new URLSearchParams();
    if (filters?.make) params.append('make', filters.make);
    if (filters?.model) params.append('model', filters.model);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const response = await api.get<Part[]>(`/parts${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  getById: async (id: number): Promise<Part> => {
    const response = await api.get<Part>(`/parts/${id}`);
    return response.data;
  },

  create: async (data: PartCreate): Promise<Part> => {
    const response = await api.post<Part>('/parts', data);
    return response.data;
  },

  update: async (id: number, data: PartUpdate): Promise<Part> => {
    const response = await api.put<Part>(`/parts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/parts/${id}`);
  },

  getImages: async (partId: number): Promise<{ images: PartImage[] }> => {
    const response = await api.get<{ images: PartImage[] }>(`/parts/${partId}/images`);
    return response.data;
  },

  uploadImages: async (partId: number, files: File[]): Promise<void> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    await api.post(`/parts/${partId}/images`, formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  deleteImage: async (partId: number, imageId: number): Promise<void> => {
    await api.delete(`/parts/${partId}/images/${imageId}`);
  },

  setMainImage: async (partId: number, imageId: number): Promise<void> => {
    await api.put(`/parts/${partId}/images/${imageId}/main`);
  },

  reorderImages: async (partId: number, imageIds: number[]): Promise<void> => {
    await api.put(`/parts/${partId}/images/reorder`, { imageIds });
  },
};
