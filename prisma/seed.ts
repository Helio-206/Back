import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const adminEmail = 'admin@schedule.local';
  const adminPasswordHash = await bcrypt.hash('admin12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Administrator',
      role: 'ADMIN',
      password: adminPasswordHash,
    },
  });

  console.log(`Seeded admin user: ${admin.id}`);

  const centerEmail = 'center@schedule.local';
  const centerPasswordHash = await bcrypt.hash('center12345', 10);

  const centerUser = await prisma.user.upsert({
    where: { email: centerEmail },
    update: {},
    create: {
      email: centerEmail,
      name: 'Primary Health Center',
      role: 'CENTER',
      password: centerPasswordHash,
    },
  });

  const center = await prisma.center.upsert({
    where: { userId: centerUser.id },
    update: {},
    create: {
      userId: centerUser.id,
      name: 'Primary Health Center',
      type: 'HEALTH',
      description: 'Primary institutional health center',
      address: 'Main Street, 123',
      phone: '212345678',
      email: 'center1@health.local',
      provincia: 'LUANDA',
      openingTime: '08:00',
      closingTime: '18:00',
      attendanceDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
    },
  });

  console.log(`Seeded center: ${center.id}`);
  console.log('Finish seeding...');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
