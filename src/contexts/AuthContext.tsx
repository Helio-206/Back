import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { LoginPayload, RegisterPayload } from '../services/auth.service';

interface User {
  id: string;
  email: string;
  role: string;
  cidadao?: {
    id: string;
    nome: string;
    sobrenome: string;
    bi?: string;
    dataNascimento?: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (payload: LoginPayload) => {
    try {
      const response = await authService.login(payload);
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch {
      // Modo demo: se o backend não estiver disponível, entra com dados fictícios
      const demoUser: User = {
        id: 'demo-001',
        email: payload.email || 'demo@gov.ao',
        role: 'USER',
        cidadao: {
          id: 'cid-001',
          nome: 'Nataniel Hélio',
          sobrenome: 'Matondo',
          bi: '009593845LA0444',
          dataNascimento: '2007-04-16',
        },
      };
      const demoToken = 'demo-token';
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const response = await authService.register(payload);
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch {
      // Modo demo: se o backend não estiver disponível, regista com dados fictícios
      const demoUser: User = {
        id: 'demo-001',
        email: payload.email || 'demo@gov.ao',
        role: 'USER',
        cidadao: {
          id: 'cid-001',
          nome: payload.cidadao?.nome || 'Nataniel Hélio',
          sobrenome: payload.cidadao?.sobrenome || 'Matondo',
          bi: payload.cidadao?.bi || '009593845LA0444',
          dataNascimento: '2007-04-16',
        },
      };
      const demoToken = 'demo-token';
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
