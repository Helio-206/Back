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
    dataNascimento?: string;
    sexo?: 'M' | 'F' | 'Outro' | string;
    email?: string;
    provinciaResidencia?:
      | 'BENGO'
      | 'BENGUELA'
      | 'BIE'
      | 'CABINDA'
      | 'CUANDO_CUBANGO'
      | 'CUANZA_NORTE'
      | 'CUANZA_SUL'
      | 'CUNENE'
      | 'HUAMBO'
      | 'HUILA'
      | 'LUANDA'
      | 'LUNDA_NORTE'
      | 'LUNDA_SUL'
      | 'MALANJE'
      | 'MOXICO'
      | 'NAMIBE'
      | 'UIGE'
      | 'ZAIRE'
      | 'ICOLO_E_BENGO'
      | 'MUXICO_LESTE'
      | 'CASSAI_ZAMBEZE';
    municipioResidencia?: string;
    bairroResidencia?: string;
    numeroBIAnterior?: string;
    bi?: string;
    provincia?: string;
    municipio?: string;
    bairro?: string;
  };
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
    cidadao?: {
      id: string;
      nome: string;
      sobrenome: string;
      bi?: string;
      dataNascimento?: string;
      sexo?: string;
      provincia?: string;
      municipio?: string;
      bairro?: string;
    };
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
};
