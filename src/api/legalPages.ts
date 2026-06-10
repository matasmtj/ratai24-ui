import api from '../lib/api';
import type { LegalPageContent, LegalPageContentData } from '../types/api';

export const legalPagesApi = {
  get: async (pageKey: string, lang: string): Promise<LegalPageContent> => {
    const response = await api.get<LegalPageContent>(`/legal-pages/${pageKey}?lang=${lang}`);
    return response.data;
  },

  getAll: async (): Promise<LegalPageContent[]> => {
    const response = await api.get<LegalPageContent[]>('/legal-pages');
    return response.data;
  },

  upsert: async (pageKey: string, language: string, content: LegalPageContentData): Promise<LegalPageContent> => {
    const response = await api.put<LegalPageContent>(`/legal-pages/${pageKey}`, { language, content });
    return response.data;
  },
};
