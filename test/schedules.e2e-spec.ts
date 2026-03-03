import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Schedules E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let centerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Clean up test data
    await prisma.schedule.deleteMany({});
    await prisma.center.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    const hashPassword = require('bcryptjs').hashSync('Password123!', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashPassword,
        numeroBi: '123456789LA123',
      },
    });
    userId = user.id;

    // Create test center
    const center = await prisma.center.create({
      data: {
        name: 'Test Center',
        address: 'Test Address',
        provincia: 'LUANDA',
        type: 'IDENTIFICATION',
      },
    });
    centerId = center.id;

    // Login and get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.schedule.deleteMany({});
    await prisma.center.deleteMany({});
    await prisma.user.deleteMany({});
    await app.close();
  });

  describe('POST /schedules - Create Schedule', () => {
    it('should create a schedule with valid data', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 1,
          description: 'BI Renewal',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.centerId).toBe(centerId);
      expect(response.body.userId).toBe(userId);
      expect(response.body.status).toBe('PENDING');
    });

    it('should reject schedule with past date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId,
          scheduledDate: pastDate.toISOString(),
          slotNumber: 1,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('future');
    });

    it('should reject schedule with non-existent center', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId: 'non-existent-center',
          scheduledDate: futureDate.toISOString(),
          slotNumber: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('not found');
    });

    it('should reject duplicate schedule for same user, center, and date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      // Create first schedule
      await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 1,
        });

      // Try to create duplicate
      const response = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 2,
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('already have a schedule');
    });

    it('should require authentication', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 1,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /schedules - List Schedules', () => {
    it('should get all schedules', async () => {
      const response = await request(app.getHttpServer())
        .get('/schedules')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get schedules by center', async () => {
      const response = await request(app.getHttpServer())
        .get(`/schedules?centerId=${centerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((s: any) => s.centerId === centerId)).toBe(true);
    });

    it('should get user schedules', async () => {
      const response = await request(app.getHttpServer())
        .get('/schedules/user/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every((s: any) => s.userId === userId)).toBe(true);
    });
  });

  describe('GET /schedules/:id - Get Schedule', () => {
    let scheduleId: string;

    beforeAll(async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 1,
        });

      scheduleId = response.body.id;
    });

    it('should get schedule by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(scheduleId);
    });

    it('should return 404 for non-existent schedule', async () => {
      const response = await request(app.getHttpServer())
        .get('/schedules/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /schedules/:id - Update Schedule Status', () => {
    let scheduleId: string;

    beforeAll(async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 1,
        });

      scheduleId = response.body.id;
    });

    it('should update schedule status from PENDING to CONFIRMED', async () => {
      const response = await request(app.getHttpServer())
        .put(`/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'CONFIRMED',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CONFIRMED');
    });

    it('should not allow invalid status transitions', async () => {
      const response = await request(app.getHttpServer())
        .put(`/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'PENDING',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid status transition');
    });

    it('should allow transition from CONFIRMED to IN_PROGRESS', async () => {
      const response = await request(app.getHttpServer())
        .put(`/schedules/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('IN_PROGRESS');
    });
  });

  describe('DELETE /schedules/:id/cancel - Cancel Schedule', () => {
    let scheduleId: string;

    beforeAll(async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 25);

      const response = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 1,
        });

      scheduleId = response.body.id;
    });

    it('should cancel a PENDING schedule', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/schedules/${scheduleId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('CANCELLED');
    });

    it('should not allow cancelling a COMPLETED schedule', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      // Create a new schedule
      const createResponse = await request(app.getHttpServer())
        .post('/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          centerId,
          scheduledDate: futureDate.toISOString(),
          slotNumber: 1,
        });

      const newScheduleId = createResponse.body.id;

      // Complete it
      await request(app.getHttpServer())
        .put(`/schedules/${newScheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'CONFIRMED',
        });

      await request(app.getHttpServer())
        .put(`/schedules/${newScheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS',
        });

      await request(app.getHttpServer())
        .put(`/schedules/${newScheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'COMPLETED',
        });

      // Try to cancel
      const response = await request(app.getHttpServer())
        .delete(`/schedules/${newScheduleId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cannot cancel a completed schedule');
    });
  });
});
