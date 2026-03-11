import api from './api';

export interface Schedule {
  id: string;
  scheduledDate: string;
  slotNumber?: number;
  estadoAgendamento?: {
    id: string;
    descricao: string;
    status: string;
  };
  tipoServico?: {
    id: string;
    descricao: string;
  };
  center?: {
    id: string;
    name: string;
    provincia: string;
  };
  createdAt: string;
}

export interface CreateSchedulePayload {
  centerId: string;
  scheduledDate: string;
  estadoAgendamentoId: string;
  tipoServicoId?: string;
  slotNumber?: number;
}

export interface TipoServico {
  id: string;
  descricao: string;
}

export interface EstadoAgendamento {
  id: string;
  descricao: string;
  status: string;
}

export interface Center {
  id: string;
  name: string;
  provincia: string;
  address?: string;
  openingTime?: string;
  closingTime?: string;
  active?: boolean;
}

export const scheduleService = {
  async getMySchedules(): Promise<Schedule[]> {
    const { data } = await api.get('/schedules/user/me');
    return data;
  },

  async createSchedule(payload: CreateSchedulePayload): Promise<Schedule> {
    const { data } = await api.post('/schedules', payload);
    return data;
  },

  async cancelSchedule(id: string): Promise<void> {
    await api.patch(`/schedules/${id}/cancel`);
  },

  async getTiposServico(): Promise<TipoServico[]> {
    const { data } = await api.get('/tipos-servico');
    return data;
  },

  async getEstadosAgendamento(): Promise<EstadoAgendamento[]> {
    const { data } = await api.get('/estados-agendamento');
    return data;
  },

  async getCenters(): Promise<Center[]> {
    const { data } = await api.get('/centers');
    return data;
  },
};
