import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scheduleService } from '../services/schedule.service';
import api from '../services/api';

vi.mock('../services/api');

describe('Schedule Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMySchedules', () => {
    it('should fetch user schedules', async () => {
      const mockSchedules = [
        {
          id: 'sch-1',
          scheduledDate: '2026-03-15',
          estadoAgendamento: {
            id: 'est-1',
            descricao: 'Agendado',
            status: 'AGENDADO',
          },
          tipoServico: {
            id: 'tipo-1',
            descricao: 'Renovação',
          },
          center: {
            id: 'center-1',
            name: 'Posto Central',
            provincia: 'Luanda',
          },
          createdAt: '2026-03-10',
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockSchedules });

      const result = await scheduleService.getMySchedules();

      expect(result).toEqual(mockSchedules);
      expect(api.get).toHaveBeenCalledWith('/schedules/user/me');
    });

    it('should handle empty schedules', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

      const result = await scheduleService.getMySchedules();

      expect(result).toEqual([]);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Unauthorized');
      vi.mocked(api.get).mockRejectedValueOnce(error);

      await expect(scheduleService.getMySchedules()).rejects.toThrow('Unauthorized');
    });
  });

  describe('createSchedule', () => {
    it('should create schedule with valid data', async () => {
      const mockSchedule = {
        id: 'sch-2',
        scheduledDate: '2026-04-20',
        estadoAgendamento: {
          id: 'est-1',
          descricao: 'Agendado',
          status: 'AGENDADO',
        },
        tipoServico: {
          id: 'tipo-1',
          descricao: 'Renovação',
        },
        center: {
          id: 'center-1',
          name: 'Posto Central',
          provincia: 'Luanda',
        },
        createdAt: '2026-03-10',
      };

      vi.mocked(api.post).mockResolvedValueOnce({ data: mockSchedule });

      const result = await scheduleService.createSchedule({
        centerId: 'center-1',
        scheduledDate: '2026-04-20T00:00:00.000Z',
        estadoAgendamentoId: 'est-1',
        tipoServicoId: 'tipo-1',
      });

      expect(result.id).toBe('sch-2');
      expect(api.post).toHaveBeenCalledWith('/schedules', {
        centerId: 'center-1',
        scheduledDate: '2026-04-20T00:00:00.000Z',
        estadoAgendamentoId: 'est-1',
        tipoServicoId: 'tipo-1',
      });
    });

    it('should handle create error', async () => {
      const error = new Error('Invalid center');
      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(
        scheduleService.createSchedule({
          centerId: 'invalid-id',
          scheduledDate: '2026-04-20T00:00:00.000Z',
          estadoAgendamentoId: 'est-1',
        })
      ).rejects.toThrow('Invalid center');
    });
  });

  describe('getTiposServico', () => {
    it('should fetch service types', async () => {
      const mockTipos = [
        { id: 'tipo-1', descricao: 'Renovação' },
        { id: 'tipo-2', descricao: '2ª Via' },
        { id: 'tipo-3', descricao: 'Atualização' },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockTipos });

      const result = await scheduleService.getTiposServico();

      expect(result).toEqual(mockTipos);
      expect(api.get).toHaveBeenCalledWith('/tipos-servico');
    });
  });

  describe('getEstadosAgendamento', () => {
    it('should fetch scheduling states', async () => {
      const mockEstados = [
        { id: 'est-1', descricao: 'Agendado', status: 'AGENDADO' },
        { id: 'est-2', descricao: 'Cancelado', status: 'CANCELADO' },
        { id: 'est-3', descricao: 'Confirmado', status: 'CONFIRMADO' },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockEstados });

      const result = await scheduleService.getEstadosAgendamento();

      expect(result).toEqual(mockEstados);
      expect(api.get).toHaveBeenCalledWith('/estados-agendamento');
    });
  });

  describe('getCenters', () => {
    it('should fetch centers', async () => {
      const mockCenters = [
        {
          id: 'center-1',
          name: 'Posto Central de Luanda',
          provincia: 'Luanda',
          address: 'Avenida 4 de Fevereiro',
          openingTime: '08:00',
          closingTime: '17:00',
        },
        {
          id: 'center-2',
          name: 'Posto de Huila',
          provincia: 'Huila',
          address: 'Rua da República',
          openingTime: '09:00',
          closingTime: '16:00',
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockCenters });

      const result = await scheduleService.getCenters();

      expect(result).toEqual(mockCenters);
      expect(api.get).toHaveBeenCalledWith('/centers');
    });
  });

  describe('cancelSchedule', () => {
    it('should cancel a schedule', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({ data: {} });

      await scheduleService.cancelSchedule('sch-1');

      expect(api.patch).toHaveBeenCalledWith('/schedules/sch-1/cancel');
    });

    it('should handle cancel error', async () => {
      const error = new Error('Schedule not found');
      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await expect(scheduleService.cancelSchedule('invalid-id')).rejects.toThrow(
        'Schedule not found'
      );
    });
  });
});
