/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { LoginPayload, RegisterPayload } from '../services/auth.service';

interface User {
  id: string;
  name?: string;
  email: string;
  role: string;
  cidadao?: {
    id: string;
    nome: string;
    sobrenome: string;
    numeroBIAnterior?: string;
    dataNascimento?: string;
    sexo?: string;
    provinciaResidencia?: string;
    municipioResidencia?: string;
    bairroResidencia?: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        localStorage.removeItem('user');
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token'),
  );
  const [isLoading] = useState(false);

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const register = async (payload: RegisterPayload) => {
    await authService.register(payload);
    const loginResponse = await authService.login({
      email: payload.email,
      password: payload.password,
    });
    setToken(loginResponse.access_token);
    setUser(loginResponse.user);
    localStorage.setItem('token', loginResponse.access_token);
    localStorage.setItem('user', JSON.stringify(loginResponse.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
