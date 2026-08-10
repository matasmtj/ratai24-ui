import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import type { LoginRequest, RegisterRequest, LoginResponse, UserRole } from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  role: UserRole | null;
  needsPhone: boolean;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  loginWithGoogle: (credential: string) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearNeedsPhone: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function applySession(
  response: LoginResponse,
  setIsAuthenticated: (v: boolean) => void,
  setRole: (v: UserRole | null) => void,
  setNeedsPhone: (v: boolean) => void
) {
  localStorage.setItem('accessToken', response.accessToken);
  localStorage.setItem('refreshToken', response.refreshToken);
  localStorage.setItem('role', response.role);
  setIsAuthenticated(true);
  setRole(response.role);
  const needsPhone = response.role === 'USER' && response.needsPhone === true;
  setNeedsPhone(needsPhone);
  if (needsPhone) {
    localStorage.setItem('needsPhone', 'true');
  } else {
    localStorage.removeItem('needsPhone');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [needsPhone, setNeedsPhone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPhoneRequirement = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const storedRole = localStorage.getItem('role') as UserRole | null;
    if (!token || storedRole !== 'USER') {
      setNeedsPhone(false);
      localStorage.removeItem('needsPhone');
      return;
    }
    try {
      const user = await usersApi.getCurrentUser();
      const missing = !user.phoneNumber?.trim();
      setNeedsPhone(missing);
      if (missing) {
        localStorage.setItem('needsPhone', 'true');
      } else {
        localStorage.removeItem('needsPhone');
      }
    } catch {
      setNeedsPhone(localStorage.getItem('needsPhone') === 'true');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedRole = localStorage.getItem('role') as UserRole | null;

    if (token && storedRole) {
      setIsAuthenticated(true);
      setRole(storedRole);
      refreshPhoneRequirement().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [refreshPhoneRequirement]);

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data);
    applySession(response, setIsAuthenticated, setRole, setNeedsPhone);
    return response;
  };

  const loginWithGoogle = async (credential: string) => {
    const response = await authApi.loginWithGoogle({ credential });
    applySession(response, setIsAuthenticated, setRole, setNeedsPhone);
    return response;
  };

  const register = async (data: RegisterRequest) => {
    await authApi.register(data);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      try {
        await authApi.logout({ refreshToken });
      } catch {
        // ignore logout errors
      }
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('needsPhone');

    setIsAuthenticated(false);
    setRole(null);
    setNeedsPhone(false);
  };

  const clearNeedsPhone = () => {
    setNeedsPhone(false);
    localStorage.removeItem('needsPhone');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        needsPhone,
        login,
        loginWithGoogle,
        register,
        logout,
        clearNeedsPhone,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
