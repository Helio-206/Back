import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Seed admin user
  const adminEmail = 'admin@agendamento.pt';
  const hashedPassword = await bcrypt.hash('admin12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      nome: 'Administrador',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  console.log(`Seeded admin user: ${admin.id}`);

  // Seed test centro user
  const centroEmail = 'centro@agendamento.pt';
  const centroHashedPassword = await bcrypt.hash('centro12345', 10);

  const centroUser = await prisma.user.upsert({
    where: { email: centroEmail },
    update: {},
    create: {
      email: centroEmail,
      nome: 'Centro de Saúde Principal',
      role: 'CENTRO',
      password: centroHashedPassword,
    },
  });

  // Create a centro
  const centro = await prisma.centro.upsert({
    where: { userId: centroUser.id },
    update: {},
    create: {
      userId: centroUser.id,
      nome: 'Centro de Saúde Principal',
      tipo: 'SAUDE',
      descricao: 'Centro de saúde principal da instituição',
      endereco: 'Rua Principal, 123',
      telefone: '212345678',
      email: 'centro1@saude.pt',
      horaAbertura: '08:00',
      horaFechamento: '18:00',
      diasAtendimento: 'SEGUNDA,TERCA,QUARTA,QUINTA,SEXTA',
    },
  });

  console.log(`Seeded centro: ${centro.id}`);
  console.log(`Finish seeding ...`);
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
