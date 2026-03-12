import api from './api';

export interface CenterInfo {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  email?: string;
  provincia: string;
  openingTime: string;
  closingTime: string;
  attendanceDays: string;
  capacidadeAgentos: number;
  active: boolean;
  _count?: {
    schedules: number;
    funcionarios: number;
  };
}

export interface CenterSchedule {
  id: string;
  scheduledDate: string;
  slotNumber?: number;
  description?: string;
  notes?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    cidadao?: {
      nome: string;
      sobrenome: string;
      numeroBIAnterior?: string;
      dataNascimento?: string;
      sexo?: string;
    };
  };
  tipoServico?: {
    id: string;
    descricao: string;
  };
  estadoAgendamento: {
    id: string;
    descricao: string;
    status: string;
  };
}

export interface EstadoAgendamento {
  id: string;
  descricao: string;
  status: string;
}

export const centerService = {
  async getMyCenter(): Promise<CenterInfo> {
    const { data } = await api.get('/centers/me');
    return data;
  },

  async getCenterSchedules(centerId: string): Promise<CenterSchedule[]> {
    const { data } = await api.get(`/schedules?centerId=${centerId}`);
    return data;
  },

  async updateScheduleStatus(
    scheduleId: string,
    estadoAgendamentoId: string,
    notes?: string,
  ): Promise<void> {
    await api.put(`/schedules/${scheduleId}`, { estadoAgendamentoId, ...(notes ? { notes } : {}) });
  },

  async getEstadosAgendamento(): Promise<EstadoAgendamento[]> {
    const { data } = await api.get('/estados-agendamento');
    return data;
  },
};
