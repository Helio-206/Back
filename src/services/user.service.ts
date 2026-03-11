import api from './api';

export interface UpdateBiPayload {
  numeroBIAnterior: string;
}

export interface UpdateBiResponse {
  id: string;
  numeroBIAnterior: string;
  nome: string;
  sobrenome: string;
}

export const userService = {
  async updateMyBi(payload: UpdateBiPayload): Promise<UpdateBiResponse> {
    const { data } = await api.patch('/users/me/bi', payload);
    return data;
  },
};
