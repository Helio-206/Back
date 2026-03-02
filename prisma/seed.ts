import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const adminEmail = 'QuartelPolitico@gmail.com';
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
      name: 'Centro de Identificação Fiscal',
      role: 'CENTER',
      password: centerPasswordHash,
    },
  });

  const center = await prisma.center.upsert({
    where: { userId: centerUser.id },
    update: {},
    create: {
      userId: centerUser.id,
      name: 'Centro de Identificação Fiscal',
      type: 'ADMINISTRATIVE',
      description: 'O Serviço de Identificação Civil é o órgão responsável pela emissão e controlo do Bilhete de Identidade (BI), garantindo a identificação oficial dos cidadãos.',
      address: 'Mutamba, Luanda, Angola',
      phone: '+244 912 345 678',
      email: 'ser@identificacao.gov.ao',
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
