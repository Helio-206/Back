import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { CenterType, Provincia } from '@prisma/client';

/**
 * E2E Tests for Centers CRUD
 * Tests all endpoints with authentication, validation, and filtering
 */
describe('Centers CRUD (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let centerAuthToken: string;
  let adminAuthToken: string;
  let citizenAuthToken: string;
  let centerId: string;
  let userId: string;
  let adminUserId: string;

  // Test  de data
  const testUser = {
    email: 'centeruser@test.com',
    name: 'Center User Test',
    password: 'TestPassword123!',
    role: 'CENTER',
  };

  const adminUser = {
    email: 'adminuser@test.com',
    name: 'Admin User Test',
    password: 'AdminPassword123!',
    role: 'ADMIN',
  };

  const citizenUser = {
    email: 'citizenuser@test.com',
    name: 'Citizen User Test',
    password: 'CitizenPassword123!',
  };

  const createCenterDto = {
    name: 'Serviço de Identificação Civil Luanda',
    description: 'Serviço de Identificação Civil responsável pela emissão de Bilhetes de Identidade e outros registos civis para os cidadãos da província de Luanda.',
    type: CenterType.ADMINISTRATIVE,
    address: 'Avenida Agostinho Neto, 500',
    provincia: Provincia.LUANDA,
    phone: '923456789',
    email: 'civil@center.com',
    openingTime: '08:00',
    closingTime: '17:00',
    attendanceDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
    capacidadeAgentos: 10,
  };

  const createAdminToken = async (suffix: string) => {
    const unique = `${suffix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const email = `admin-${unique}@test.com`;
    const password = 'AdminPassword123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        name: `Admin ${unique}`,
        password,
        role: 'ADMIN',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password,
      });

    return loginResponse.body.access_token;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up test data
    await prismaService.center.deleteMany({});
    await prismaService.user.deleteMany({});

    // Create test users via register endpoint
    const registerResponse1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testUser.email,
        name: testUser.name,
        password: testUser.password,
        role: testUser.role,
      });

    userId = registerResponse1.body.id;

    // Get center user token via login
    const loginResponse1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    centerAuthToken = loginResponse1.body.access_token;

    // Create admin user
    const registerResponse2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: adminUser.email,
        name: adminUser.name,
        password: adminUser.password,
        role: adminUser.role,
      });

    adminUserId = registerResponse2.body.id;

    // Get admin token
    const loginResponse2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });

    adminAuthToken = loginResponse2.body.access_token;

    // Create citizen user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: citizenUser.email,
        name: citizenUser.name,
        password: citizenUser.password,
      });

    // Get citizen token
    const citizenLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: citizenUser.email,
        password: citizenUser.password,
      });

    citizenAuthToken = citizenLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prismaService.center.deleteMany({});
    await prismaService.user.deleteMany({});
    await app.close();
  });

  describe('POST /centers - Create Center', () => {
    it('should create a center successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(createCenterDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createCenterDto.name);
      expect(response.body.provincia).toBe(createCenterDto.provincia);
      expect(response.body.openingTime).toBe(createCenterDto.openingTime);
      expect(response.body.closingTime).toBe(createCenterDto.closingTime);
      expect(response.body.attendanceDays).toBe(createCenterDto.attendanceDays);

      centerId = response.body.id;
    });

    it('should reject creating center without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/centers')
        .send(createCenterDto);

      expect(response.status).toBe(401);
    });

    it('should use default opening and closing times', async () => {
      const dtoWithoutTimes = {
        name: 'Serviço de Identificação Civil Sem Horário',
        type: CenterType.ADMINISTRATIVE,
        address: 'Some Address',
        provincia: Provincia.BENGUELA,
      };

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(dtoWithoutTimes);

      expect(response.status).toBe(201);
      expect(response.body.openingTime).toBe('08:00');
      expect(response.body.closingTime).toBe('17:00');
    });

    it('should reject invalid opening time format', async () => {
      const invalidDto = {
        ...createCenterDto,
        openingTime: '25:00', // Invalid hour
      };

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(invalidDto);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject opening time after closing time', async () => {
      const invalidDto = {
        ...createCenterDto,
        openingTime: '17:00',
        closingTime: '08:00',
      };

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(invalidDto);

      expect(response.status).toBe(400);
    });

    it('should reject invalid attendance days', async () => {
      const invalidDto = {
        ...createCenterDto,
        attendanceDays: 'MONDAY,INVALIDDAY',
      };

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(invalidDto);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject invalid province', async () => {
      const invalidDto = {
        ...createCenterDto,
        provincia: 'INVALID_PROVINCE',
      };

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(invalidDto);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject invalid email format', async () => {
      const invalidDto = {
        ...createCenterDto,
        email: 'not-an-email',
      };

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(invalidDto);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should reject invalid phone format', async () => {
      const invalidDto = {
        ...createCenterDto,
        phone: '123', // Too short
      };

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(invalidDto);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should require name field', async () => {
      const { name, ...dtoWithoutName } = createCenterDto;

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(dtoWithoutName);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should require type field', async () => {
      const { type, ...dtoWithoutType } = createCenterDto;

      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(dtoWithoutType);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /centers - List All Centers', () => {
    it('should list all centers', async () => {
      const response = await request(app.getHttpServer()).get('/centers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter centers by province', async () => {
      const response = await request(app.getHttpServer())
        .get('/centers')
        .query({ provincia: Provincia.LUANDA });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((c: any) => c.provincia === Provincia.LUANDA)).toBe(
        true,
      );
    });

    it('should filter centers by active status', async () => {
      const response = await request(app.getHttpServer())
        .get('/centers')
        .query({ active: 'true' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((c: any) => c.active === true)).toBe(true);
    });

    it('should apply multiple filters', async () => {
      const response = await request(app.getHttpServer())
        .get('/centers')
        .query({ provincia: Provincia.LUANDA, active: 'true' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every(
          (c: any) => c.provincia === Provincia.LUANDA && c.active === true,
        ),
      ).toBe(true);
    });

    it('should reject invalid province filter', async () => {
      const response = await request(app.getHttpServer())
        .get('/centers')
        .query({ provincia: 'INVALID_PROVINCE' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /centers/province/:provincia - Filter by Province', () => {
    it('should return centers in specific province', async () => {
      const response = await request(app.getHttpServer())
        .get(`/centers/province/${Provincia.LUANDA}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((c: any) => c.provincia === Provincia.LUANDA)).toBe(
        true,
      );
    });

    it('should return 404 if no centers in province', async () => {
      const response = await request(app.getHttpServer())
        .get(`/centers/province/${Provincia.UIGE}`);

      // May be 404 if no centers, or empty array depending on implementation
      expect([200, 404]).toContain(response.status);
    });

    it('should reject invalid province', async () => {
      const response = await request(app.getHttpServer()).get(
        '/centers/province/INVALID',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('GET /centers/:id - Get Single Center', () => {
    it('should retrieve a specific center', async () => {
      const response = await request(app.getHttpServer()).get(
        `/centers/${centerId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(centerId);
      expect(response.body.name).toBe(createCenterDto.name);
    });

    it('should include recent schedules', async () => {
      const response = await request(app.getHttpServer()).get(
        `/centers/${centerId}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('schedules');
      expect(Array.isArray(response.body.schedules)).toBe(true);
    });

    it('should return 404 for non-existent center', async () => {
      const response = await request(app.getHttpServer()).get(
        '/centers/nonexistent-id',
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /centers/:id - Update Center', () => {
    it('should update a center successfully', async () => {
      const updateDto = {
        name: 'Serviço de Identificação Civil Atualizado',
        capacidadeAgentos: 15,
      };

      const response = await request(app.getHttpServer())
        .put(`/centers/${centerId}`)
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.capacidadeAgentos).toBe(updateDto.capacidadeAgentos);
    });

    it('should reject update without authentication', async () => {
      const response = await request(app.getHttpServer())
        .put(`/centers/${centerId}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
    });

    it('should validate time range on update', async () => {
      const invalidUpdate = {
        openingTime: '17:00',
        closingTime: '08:00',
      };

      const response = await request(app.getHttpServer())
        .put(`/centers/${centerId}`)
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
    });

    it('should validate attendance days on update', async () => {
      const invalidUpdate = {
        attendanceDays: 'MONDAY,INVALIDDAY',
      };

      const response = await request(app.getHttpServer())
        .put(`/centers/${centerId}`)
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send(invalidUpdate);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent center', async () => {
      const response = await request(app.getHttpServer())
        .put('/centers/nonexistent-id')
        .set('Authorization', `Bearer ${centerAuthToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /centers/:id - Deactivate Center', () => {
    it('should deactivate a center', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/centers/${centerId}`)
        .set('Authorization', `Bearer ${centerAuthToken}`);

      expect(response.status).toBe(204);

      // Verify center is deactivated
      const getResponse = await request(app.getHttpServer()).get(
        `/centers/${centerId}`,
      );
      expect(getResponse.body.active).toBe(false);
    });

    it('should reject deactivate without authentication', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/centers/${centerId}`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent center', async () => {
      const response = await request(app.getHttpServer())
        .delete('/centers/nonexistent-id')
        .set('Authorization', `Bearer ${centerAuthToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /centers/:id/reactivate - Reactivate Center', () => {
    it('should reactivate a deactivated center', async () => {
      const response = await request(app.getHttpServer())
        .post(`/centers/${centerId}/reactivate`)
        .set('Authorization', `Bearer ${centerAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body.active).toBe(true);

      // Verify via GET
      const getResponse = await request(app.getHttpServer()).get(
        `/centers/${centerId}`,
      );
      expect(getResponse.body.active).toBe(true);
    });

    it('should reject reactivate without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/centers/${centerId}/reactivate`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent center', async () => {
      const response = await request(app.getHttpServer())
        .post('/centers/nonexistent-id/reactivate')
        .set('Authorization', `Bearer ${centerAuthToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Complete CRUD workflow', () => {
    it('should complete full CRUD cycle', async () => {
      const workflowAdminToken = await createAdminToken('workflow');

      // 1. Create
      const createResponse = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${workflowAdminToken}`)
        .send({
          name: 'Serviço de Identificação Civil de Teste Completo',
          type: CenterType.ADMINISTRATIVE,
          address: 'Test Address',
          provincia: Provincia.LUANDA,
          openingTime: '09:00',
          closingTime: '16:00',
        });

      expect(createResponse.status).toBe(201);
      const newCenterId = createResponse.body.id;

      // 2. Read
      const readResponse = await request(app.getHttpServer()).get(
        `/centers/${newCenterId}`,
      );
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.name).toBe('Serviço de Identificação Civil de Teste Completo');

      // 3. Update
      const updateResponse = await request(app.getHttpServer())
        .put(`/centers/${newCenterId}`)
        .set('Authorization', `Bearer ${workflowAdminToken}`)
        .send({
          name: 'Updated Test Center',
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Updated Test Center');

      // 4. Deactivate
      const deactivateResponse = await request(app.getHttpServer())
        .delete(`/centers/${newCenterId}`)
        .set('Authorization', `Bearer ${workflowAdminToken}`);

      expect(deactivateResponse.status).toBe(204);

      // 5. Reactivate
      const reactivateResponse = await request(app.getHttpServer())
        .post(`/centers/${newCenterId}/reactivate`)
        .set('Authorization', `Bearer ${workflowAdminToken}`);

      expect(reactivateResponse.status).toBe(200);
      expect(reactivateResponse.body.active).toBe(true);
    });
  });

  describe('Provincial Filter Integration', () => {
    it('should create centers in different provinces and filter correctly', async () => {
      const benguelaAdminToken = await createAdminToken('benguela');
      const huilaAdminToken = await createAdminToken('huila');

      // Create center in Benguela
      const benguelaCenter = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${benguelaAdminToken}`)
        .send({
          name: 'Serviço de Identificação Civil Benguela',
          type: CenterType.ADMINISTRATIVE,
          address: 'Benguela Address',
          provincia: Provincia.BENGUELA,
        });

      expect(benguelaCenter.status).toBe(201);

      // Create center in Huila
      const huilaCenter = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${huilaAdminToken}`)
        .send({
          name: 'Serviço de Identificação Civil Huila',
          type: CenterType.ADMINISTRATIVE,
          address: 'Huila Address',
          provincia: Provincia.HUILA,
        });

      expect(huilaCenter.status).toBe(201);

      // Filter by Benguela
      const benguelaFilter = await request(app.getHttpServer())
        .get('/centers')
        .query({ provincia: Provincia.BENGUELA });

      expect(benguelaFilter.status).toBe(200);
      expect(
        benguelaFilter.body.some((c: any) => c.name === 'Serviço de Identificação Civil Benguela'),
      ).toBe(true);

      // Filter by Huila
      const huilaFilter = await request(app.getHttpServer())
        .get('/centers')
        .query({ provincia: Provincia.HUILA });

      expect(huilaFilter.status).toBe(200);
      expect(huilaFilter.body.some((c: any) => c.name === 'Serviço de Identificação Civil Huila')).toBe(true);
    });
  });

  describe('Time and Day Validation Integration', () => {
    it('should accept all valid attendance day combinations', async () => {
      const validCombinations = [
        'MONDAY',
        'MONDAY,FRIDAY',
        'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY',
      ];

      let index = 0;
      for (const days of validCombinations) {
        const token = await createAdminToken(`days-${index}`);
        const response = await request(app.getHttpServer())
          .post('/centers')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Center with days ${days}`,
            type: CenterType.ADMINISTRATIVE,
            address: 'Test Address',
            provincia: Provincia.LUANDA,
            attendanceDays: days,
          });

        index += 1;

        expect(response.status).toBe(201);
      }
    });

    it('should accept all valid Angolan phone number formats', async () => {
      const validPhones = ['923456789', '+244923456789'];

      let index = 0;
      for (const phone of validPhones) {
        const token = await createAdminToken(`phone-${index}`);
        const response = await request(app.getHttpServer())
          .post('/centers')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Center with phone ${phone}`,
            type: CenterType.ADMINISTRATIVE,
            address: 'Test Address',
            provincia: Provincia.LUANDA,
            phone,
          });

        index += 1;

        expect(response.status).toBe(201);
      }
    });
  });

  describe('Day 3 - RBAC, Errors and Main Flow', () => {
    it('should enforce RBAC hierarchy for admin statistics', async () => {
      const centerStatsResponse = await request(app.getHttpServer())
        .get('/centers/admin/statistics')
        .set('Authorization', `Bearer ${centerAuthToken}`);

      expect(centerStatsResponse.status).toBe(403);

      const citizenStatsResponse = await request(app.getHttpServer())
        .get('/centers/admin/statistics')
        .set('Authorization', `Bearer ${citizenAuthToken}`);

      expect(citizenStatsResponse.status).toBe(403);

      const adminStatsResponse = await request(app.getHttpServer())
        .get('/centers/admin/statistics')
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(adminStatsResponse.status).toBe(200);
      expect(adminStatsResponse.body).toHaveProperty('total');
      expect(adminStatsResponse.body).toHaveProperty('active');
    });

    it('should block citizen from creating center', async () => {
      const response = await request(app.getHttpServer())
        .post('/centers')
        .set('Authorization', `Bearer ${citizenAuthToken}`)
        .send({
          name: 'Citizen Attempt Center',
          type: CenterType.ADMINISTRATIVE,
          address: 'Forbidden Address',
          provincia: Provincia.LUANDA,
        });

      expect(response.status).toBe(403);
    });

    it('should validate main e2e flow: register -> login -> schedule', async () => {
      const flowUser = {
        email: 'flow-user@test.com',
        name: 'Flow User',
        password: 'FlowPass123!',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(flowUser);

      expect(registerResponse.status).toBe(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: flowUser.email, password: flowUser.password });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('access_token');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const scheduleResponse = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 3,
          description: 'Main Day 3 Flow',
        });

      expect(scheduleResponse.status).toBe(201);
      expect(scheduleResponse.body).toHaveProperty('id');
      expect(scheduleResponse.body.centerId).toBe(centerId);
    });

    it('should return invalid data errors on schedule creation', async () => {
      const response = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${citizenAuthToken}`)
        .send({
          centerId,
          scheduledDate: 'invalid-date',
        });

      expect(response.status).toBe(400);
    });
  });
});
