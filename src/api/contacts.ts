import api from '../lib/api';
import type { Contact, ContactUpdate } from '../types/api';

export const contactsApi = {
  // Get contact information (public)
  get: async (): Promise<Contact | null> => {
    try {
      const response = await api.get<Contact>('/contacts');
      return response.data;
    } catch {
      return null;
    }
  },

  // Update contact information (admin only)
  update: async (data: ContactUpdate): Promise<Contact> => {
    const response = await api.put<Contact>('/contacts', data);
    return response.data;
  },

  // Create contact information (admin only)
  create: async (data: ContactUpdate): Promise<Contact> => {
    const response = await api.post<Contact>('/contacts', data);
    return response.data;
  },

  // Upload landing hero background image (admin only)
  uploadHeroImage: async (file: File): Promise<Contact> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<Contact>('/contacts/hero-image', formData, {
      headers: { 'Content-Type': undefined as unknown as string },
    });
    return response.data;
  },

  // Remove the landing hero background image (admin only)
  deleteHeroImage: async (): Promise<Contact> => {
    const response = await api.delete<Contact>('/contacts/hero-image');
    return response.data;
  },
};
