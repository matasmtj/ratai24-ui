import api from '../lib/api';
import type { Part, PartCreate, PartUpdate, PartCategory, PartCategoryCreate, PartCategoryUpdate, PartImage } from '../types/api';

export const partsApi = {
  // Parts
  getAll: async (filters?: {
    make?: string;
    model?: string;
    year?: number;
    categoryId?: number;
    condition?: string;
    search?: string;
  }): Promise<Part[]> => {
    const params = new URLSearchParams();
    if (filters?.make) params.append('make', filters.make);
    if (filters?.model) params.append('model', filters.model);
    if (filters?.year) params.append('year', filters.year.toString());
    if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
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

  // Part Images
  getImages: async (partId: number): Promise<PartImage[]> => {
    const response = await api.get<PartImage[]>(`/parts/${partId}/images`);
    return response.data;
  },

  uploadImage: async (partId: number, file: File): Promise<PartImage> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<PartImage>(`/parts/${partId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
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

  // Categories
  getAllCategories: async (): Promise<PartCategory[]> => {
    const response = await api.get<PartCategory[]>('/parts/categories');
    return response.data;
  },

  getCategoryById: async (id: number): Promise<PartCategory> => {
    const response = await api.get<PartCategory>(`/parts/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: PartCategoryCreate): Promise<PartCategory> => {
    const response = await api.post<PartCategory>('/admin/parts/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: PartCategoryUpdate): Promise<PartCategory> => {
    const response = await api.put<PartCategory>(`/admin/parts/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/admin/parts/categories/${id}`);
  },
};
