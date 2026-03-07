import { Test, TestingModule } from '@nestjs/testing';
import { EstadoAgendamentoService } from './estado-agendamento.service';
import { PrismaService } from '@database/prisma.service';

describe('EstadoAgendamentoService', () => {
  let service: EstadoAgendamentoService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoAgendamentoService,
        {
          provide: PrismaService,
          useValue: {
            estadoAgendamento: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EstadoAgendamentoService>(EstadoAgendamentoService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all estado agendamentos ordered by descricao', async () => {
      const mockEstados = [
        { id: 'id1', descricao: 'AGENDADO', status: 'AGENDADO' },
        { id: 'id2', descricao: 'CONFIRMADO', status: 'CONFIRMADO' },
      ];

      prisma.estadoAgendamento.findMany.mockResolvedValue(mockEstados);

      const result = await service.findAll();

      expect(result).toEqual(mockEstados);
      expect(prisma.estadoAgendamento.findMany).toHaveBeenCalledWith({
        orderBy: { descricao: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a estado agendamento by id', async () => {
      const mockEstado = { id: 'id1', descricao: 'AGENDADO', status: 'AGENDADO' };

      prisma.estadoAgendamento.findUnique.mockResolvedValue(mockEstado);

      const result = await service.findById('id1');

      expect(result).toEqual(mockEstado);
      expect(prisma.estadoAgendamento.findUnique).toHaveBeenCalledWith({
        where: { id: 'id1' },
      });
    });

    it('should return null if estado agendamento not found', async () => {
      prisma.estadoAgendamento.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
