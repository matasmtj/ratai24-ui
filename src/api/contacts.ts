import api from '../lib/api';
import type { Contact, ContactUpdate } from '../types/api';

export const contactsApi = {
  // Get contact information (public)
  get: async (): Promise<Contact | null> => {
    try {
      const response = await api.get<Contact>('/contacts');
      return response.data;
    } catch (error) {
      // Return null if contacts endpoint doesn't exist yet
      console.warn('Contacts endpoint not available:', error);
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
};
