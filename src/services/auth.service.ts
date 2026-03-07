import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  cidadao: {
    nome: string;
    sobrenome: string;
    bi?: string;
    dataNascimento?: string;
    sexo?: string;
    provincia?: string;
    municipio?: string;
    bairro?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  user: {
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
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
};
