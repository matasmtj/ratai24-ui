import api from '../lib/api';
import type { Car, CarCreate, CarImage } from '../types/api';

export const carsApi = {
  getAll: async (cityId?: number): Promise<Car[]> => {
    const params = cityId ? { cityId } : {};
    const response = await api.get<Car[]>('/cars', { params });
    console.log('Cars API response:', response.data);
    if (response.data.length > 0) {
      console.log('First car images:', response.data[0].images);
    }
    return response.data;
  },

  getAllForSale: async (cityId?: number): Promise<Car[]> => {
    const params = cityId ? { cityId } : {};
    const response = await api.get<Car[]>('/cars/for-sale', { params });
    return response.data;
  },

  getForSaleById: async (id: number): Promise<Car> => {
    const response = await api.get<Car>(`/cars/for-sale/${id}`);
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

  // Image management
  uploadImages: async (carId: number, files: File[]): Promise<{ message: string; images: CarImage[] }> => {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('images', file);
    });
    
    // Delete Content-Type header to let axios set it with boundary for multipart/form-data
    const response = await api.post(`/cars/${carId}/images`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  getImages: async (carId: number): Promise<{ images: CarImage[] }> => {
    const response = await api.get(`/cars/${carId}/images`);
    return response.data;
  },

  setMainImage: async (carId: number, imageId: number): Promise<{ message: string; image: CarImage }> => {
    const response = await api.put(`/cars/${carId}/images/${imageId}/main`);
    return response.data;
  },

  deleteImage: async (carId: number, imageId: number): Promise<{ message: string; image: CarImage }> => {
    const response = await api.delete(`/cars/${carId}/images/${imageId}`);
    return response.data;
  },

  reorderImages: async (carId: number, imageIds: number[]): Promise<{ message: string; images: CarImage[] }> => {
    const response = await api.put(`/cars/${carId}/images/reorder`, { imageIds });
    return response.data;
  },
};
