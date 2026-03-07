import { Test, TestingModule } from '@nestjs/testing';
import { TipoServicoService } from './tipo-servico.service';
import { PrismaService } from '@database/prisma.service';

describe('TipoServicoService', () => {
  let service: TipoServicoService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipoServicoService,
        {
          provide: PrismaService,
          useValue: {
            tipoServico: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TipoServicoService>(TipoServicoService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tipo servicos ordered by descricao', async () => {
      const mockTipos = [
        { id: 'id1', descricao: 'BI NOVO' },
        { id: 'id2', descricao: 'BI RENOVACAO' },
      ];

      prisma.tipoServico.findMany.mockResolvedValue(mockTipos);

      const result = await service.findAll();

      expect(result).toEqual(mockTipos);
      expect(prisma.tipoServico.findMany).toHaveBeenCalledWith({
        orderBy: { descricao: 'asc' },
      });
    });
  });

  describe('findById', () => {
    it('should return a tipo servico by id', async () => {
      const mockTipo = { id: 'id1', descricao: 'BI NOVO' };

      prisma.tipoServico.findUnique.mockResolvedValue(mockTipo);

      const result = await service.findById('id1');

      expect(result).toEqual(mockTipo);
      expect(prisma.tipoServico.findUnique).toHaveBeenCalledWith({
        where: { id: 'id1' },
      });
    });

    it('should return null if tipo servico not found', async () => {
      prisma.tipoServico.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
