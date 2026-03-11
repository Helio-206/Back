import api from './api';

export interface AdminSchedule {
  id: string;
  data: string;
  identificacao: string;
  cidadao: string;
  tipologia: string;
  local: string;
  estado?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  nome: string;
  sobrenome: string;
  bi: string;
  dataNascimento: string;
  sexo: string;
  provincia: string;
  municipio: string;
  bairro: string;
  createdAt: string;
  active?: boolean;
}

export interface AdminCenter {
  id: string;
  name: string;
  province: string;
  municipality: string;
  address: string;
  email: string;
  openTime: string;
  closeTime: string;
  active?: boolean;
  type?: string;
  phone?: string;
  description?: string;
  capacidade?: number;
  attendanceDays?: string;
}

export interface AdminTipoServico {
  id: string;
  descricao: string;
  active?: boolean;
}

export interface CreateCenterPayload {
  name: string;
  type: string;
  address: string;
  provincia: string;
  description?: string;
  phone?: string;
  email?: string;
  userPassword?: string;
  openingTime?: string;
  closingTime?: string;
  attendanceDays?: string;
  capacidadeAgentos?: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
    cidadao?: {
      nome: string;
      sobrenome: string;
    };
  };
}

export interface ActivityLogStats {
  totalToday: number;
  totalWeek: number;
  totalAll: number;
  byAction: { action: string; _count: number }[];
}

export interface CenterStatistics {
  total: number;
  active: number;
  byProvince: { provincia: string; _count: number }[];
}

export const adminService = {
  async getAllSchedules(): Promise<AdminSchedule[]> {
    const { data } = await api.get('/schedules');

    if (Array.isArray(data)) {
      return data.map((s: Record<string, unknown>) => {
        const cidadaoObj = s.cidadao as Record<string, string> | undefined;
        const userObj = s.user as Record<string, unknown> | undefined;
        const userCidadao = userObj?.cidadao as Record<string, string> | undefined;
        const tipoObj = s.tipoServico as Record<string, string> | undefined;
        const centerObj = s.center as Record<string, string> | undefined;
        const estadoObj = s.estadoAgendamento as Record<string, string> | undefined;

        const actualCidadao = cidadaoObj || userCidadao;

        const scheduledDate = (s.scheduledDate || s.data || s.createdAt || '') as string;
        let formattedDate = scheduledDate;
        try {
          if (scheduledDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(scheduledDate)) {
            const d = new Date(scheduledDate);
            formattedDate = d.toLocaleDateString('pt-AO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
          }
        } catch {
          /* keep raw */
        }

        return {
          id: (s.id || '') as string,
          data: formattedDate,
          identificacao:
            actualCidadao?.numeroBIAnterior ||
            actualCidadao?.bi ||
            (s.identificacao as string) ||
            '',
          cidadao:
            actualCidadao
              ? `${actualCidadao.nome || ''} ${actualCidadao.sobrenome || ''}`.trim()
              : (s.cidadao as string) || '',
          tipologia: tipoObj?.descricao || (s.tipologia as string) || '',
          local:
            centerObj
              ? centerObj.name || `${centerObj.provincia || ''}`
              : (s.local as string) || '',
          estado: estadoObj?.descricao || estadoObj?.status || '',
        };
      });
    }

    return [];
  },

  async searchSchedules(query: string): Promise<AdminSchedule[]> {
    try {
      const { data } = await api.get('/schedules/search', { params: { q: query } });
      if (Array.isArray(data)) {
        return data.map((s: Record<string, unknown>) => ({
          id: (s.id || '') as string,
          data: (s.data || '') as string,
          identificacao: (s.identificacao || '') as string,
          cidadao: (s.cidadao || '') as string,
          tipologia: (s.tipologia || '') as string,
          local: (s.local || '') as string,
        }));
      }
      return [];
    } catch {
      const all = await this.getAllSchedules();
      const q = query.toLowerCase();
      return all.filter(
        (s) =>
          s.cidadao.toLowerCase().includes(q) ||
          s.identificacao.toLowerCase().includes(q)
      );
    }
  },

  async getAllUsers(): Promise<AdminUser[]> {
    const { data } = await api.get('/users');
    if (Array.isArray(data)) {
      return data.map((u: Record<string, unknown>) => {
        const cidadao = u.cidadao as Record<string, string> | undefined;
        return {
          id: (u.id || '') as string,
          email: (u.email || '') as string,
          role: (u.role || 'USER') as string,
          nome: cidadao?.nome || '',
          sobrenome: cidadao?.sobrenome || '',
          bi: cidadao?.numeroBIAnterior || cidadao?.bi || '',
          dataNascimento: cidadao?.dataNascimento || '',
          sexo: cidadao?.sexo || '',
          provincia: cidadao?.provinciaResidencia || cidadao?.provincia || '',
          municipio: cidadao?.municipioResidencia || cidadao?.municipio || '',
          bairro: cidadao?.bairroResidencia || cidadao?.bairro || '',
          createdAt: (u.createdAt || '') as string,
        };
      });
    }
    return [];
  },

  async getUserById(id: string): Promise<AdminUser | null> {
    try {
      const { data: u } = await api.get(`/users/${id}`);
      const cidadao = (u as Record<string, unknown>).cidadao as Record<string, string> | undefined;
      return {
        id: (u.id || '') as string,
        email: (u.email || '') as string,
        role: (u.role || 'USER') as string,
        nome: cidadao?.nome || '',
        sobrenome: cidadao?.sobrenome || '',
        bi: cidadao?.numeroBIAnterior || cidadao?.bi || '',
        dataNascimento: cidadao?.dataNascimento || '',
        sexo: cidadao?.sexo || '',
        provincia: cidadao?.provinciaResidencia || cidadao?.provincia || '',
        municipio: cidadao?.municipioResidencia || cidadao?.municipio || '',
        bairro: cidadao?.bairroResidencia || cidadao?.bairro || '',
        createdAt: (u.createdAt || '') as string,
      };
    } catch {
      return null;
    }
  },

  async getAllCenters(): Promise<AdminCenter[]> {
    const { data } = await api.get('/centers');
    if (Array.isArray(data)) {
      return data.map((c: Record<string, unknown>) => ({
        id: (c.id || '') as string,
        name: (c.name || '') as string,
        province: (c.provincia || c.province || '') as string,
        municipality: (c.municipio || c.municipality || '') as string,
        address: (c.address || '') as string,
        email: ((c.user as Record<string, unknown> | undefined)?.email || c.email || '') as string,
        openTime: (c.openingTime || c.openTime || '') as string,
        closeTime: (c.closingTime || c.closeTime || '') as string,
        active: c.active !== false,
        type: (c.type || '') as string,
        phone: (c.phone || '') as string,
        description: (c.description || '') as string,
        capacidade: (c.capacidadeAgentos || 5) as number,
        attendanceDays: (c.attendanceDays || '') as string,
      }));
    }
    return [];
  },

  async createCenter(payload: CreateCenterPayload): Promise<AdminCenter> {
    const { data: c } = await api.post('/centers', payload);
    return {
      id: c.id,
      name: c.name,
      province: c.provincia,
      municipality: '',
      address: c.address,
      email: c.user?.email || c.email || '',
      openTime: c.openingTime || '',
      closeTime: c.closingTime || '',
      active: c.active !== false,
      type: c.type || '',
      phone: c.phone || '',
      description: c.description || '',
      capacidade: c.capacidadeAgentos || 5,
      attendanceDays: c.attendanceDays || '',
    };
  },

  async updateCenter(id: string, payload: Partial<CreateCenterPayload>): Promise<void> {
    await api.put(`/centers/${id}`, payload);
  },

  async deactivateCenter(id: string): Promise<void> {
    await api.delete(`/centers/${id}`);
  },

  async reactivateCenter(id: string): Promise<void> {
    await api.post(`/centers/${id}/reactivate`);
  },

  async getCenterStatistics(): Promise<CenterStatistics> {
    try {
      const { data } = await api.get('/centers/admin/statistics');
      return data as CenterStatistics;
    } catch {
      return { total: 0, active: 0, byProvince: [] };
    }
  },

  async deactivateUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async getAllTiposServico(): Promise<AdminTipoServico[]> {
    const { data } = await api.get('/tipos-servico');
    if (Array.isArray(data)) {
      return data.map((t: Record<string, unknown>) => ({
        id: (t.id || '') as string,
        descricao: (t.descricao || '') as string,
        active: t.active !== false,
      }));
    }
    return [];
  },

  async createTipoServico(descricao: string): Promise<AdminTipoServico> {
    const { data } = await api.post('/tipos-servico', { descricao });
    return { id: data.id, descricao: data.descricao, active: data.active !== false };
  },

  async updateTipoServico(id: string, descricao: string): Promise<void> {
    await api.put(`/tipos-servico/${id}`, { descricao });
  },

  async toggleTipoServico(id: string): Promise<void> {
    await api.patch(`/tipos-servico/${id}/toggle`);
  },

  async updateMyProfile(data: {
    email?: string;
    nome?: string;
    sobrenome?: string;
    sexo?: string;
    provinciaResidencia?: string;
    municipioResidencia?: string;
    bairroResidencia?: string;
    ruaResidencia?: string;
    numeroCasa?: string;
    estadoCivil?: string;
  }): Promise<Record<string, unknown>> {
    const { data: result } = await api.patch('/users/me/profile', data);
    return result;
  },

  // Activity Logs
  async getActivityLogs(params?: {
    action?: string;
    entity?: string;
    userId?: string;
    limit?: number;
  }): Promise<ActivityLog[]> {
    const { data } = await api.get('/activity-logs', { params });
    return data;
  },

  async getActivityLogStats(): Promise<ActivityLogStats> {
    const { data } = await api.get('/activity-logs/stats');
    return data;
  },
};
