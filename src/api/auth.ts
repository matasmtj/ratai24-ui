import api from '../lib/api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshRequest,
  LogoutRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ResendVerificationResponse,
} from '../types/api';

export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
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

  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<void> => {
    await api.post('/auth/verify-email', data);
  },

  resendVerification: async (
    data: ResendVerificationRequest
  ): Promise<ResendVerificationResponse> => {
    const response = await api.post<ResendVerificationResponse>(
      '/auth/resend-verification',
      data
    );
    return response.data;
  },
};
