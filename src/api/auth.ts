import api from '../lib/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshRequest,
  LogoutRequest,
} from '../types/api';

export const authApi = {
  register: async (data: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  refresh: async (data: RefreshRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/refresh', data);
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<void> => {
    await api.post('/auth/logout', data);
  },
};
