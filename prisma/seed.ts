import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const adminsToSeed = [
    { name: 'Cleusio Hari', email: 'cleusio.hari@sge.admin.ao', password: 'Cleusio@2026' },
    { name: 'Ester Gonçalves', email: 'ester.goncalves@sge.admin.ao', password: 'Ester@2026' },
    { name: 'Luís Gonçalves', email: 'luis.goncalves@sge.admin.ao', password: 'Luis@2026' },
    { name: 'Luzia Barros', email: 'luzia.barros@sge.admin.ao', password: 'Luzia@2026' },
    { name: 'Rildo Francisco', email: 'rildo.francisco@sge.admin.ao', password: 'Rildo@2026' },
    { name: 'José Kinanvuidi', email: 'jose.kinanvuidi@sge.admin.ao', password: 'Jose@2026' },
    { name: 'Nataniel Matondo', email: 'nataniel.matondo@sge.admin.ao', password: 'Nataniel@2026' },
  ];

  for (const adminUser of adminsToSeed) {
    const passwordHash = await bcrypt.hash(adminUser.password, 10);
    const [nome, ...sobrenomeParts] = adminUser.name.split(' ');
    const sobrenome = sobrenomeParts.join(' ') || 'Admin';
    const sexo = ['Ester', 'Luzia'].includes(nome) ? 'F' : 'M';

    const seeded = await prisma.user.upsert({
      where: { email: adminUser.email },
      update: {
        role: 'ADMIN',
        password: passwordHash,
      },
      create: {
        email: adminUser.email,
        role: 'ADMIN',
        password: passwordHash,
      },
    });

    await prisma.cidadao.upsert({
      where: { userId: seeded.id },
      update: {
        nome,
        sobrenome,
        dataNascimento: new Date('1990-01-01'),
        sexo,
        provinciaResidencia: 'LUANDA',
        municipioResidencia: 'Luanda',
        bairroResidencia: 'Maculusso',
        estadoCivil: 'Solteiro(a)',
      },
      create: {
        userId: seeded.id,
        nome,
        sobrenome,
        dataNascimento: new Date('1990-01-01'),
        sexo,
        provinciaResidencia: 'LUANDA',
        municipioResidencia: 'Luanda',
        bairroResidencia: 'Maculusso',
        estadoCivil: 'Solteiro(a)',
      },
    });

    console.log(`Seeded admin user: ${seeded.id} (${adminUser.name})`);
  }

  const centerEmail = 'center@schedule.local';
  const centerPasswordHash = await bcrypt.hash('center12345', 10);

  const centerUser = await prisma.user.upsert({
    where: { email: centerEmail },
    update: {},
    create: {
      email: centerEmail,
      role: 'CENTER',
      password: centerPasswordHash,
    },
  });

  const center = await prisma.center.upsert({
    where: { userId: centerUser.id },
    update: {},
    create: {
      userId: centerUser.id,
      name: 'Centro de Identificação Civil de Luanda',
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

  // ── Additional centers ────────────────────────────────────────
  const additionalCenters = [
    { name: 'Centro de Identificação Civil do Cazenga', email: 'center.cazenga@sge.ao', address: 'Rua do Comércio, Cazenga, Luanda', provincia: 'LUANDA', phone: '+244 923 456 789' },
    { name: 'Centro de Identificação Civil de Benguela', email: 'center.benguela@sge.ao', address: 'Av. 4 de Fevereiro, Benguela', provincia: 'BENGUELA', phone: '+244 934 567 890' },
    { name: 'Centro de Identificação Civil do Huambo', email: 'center.huambo@sge.ao', address: 'Rua Norton de Matos, Huambo', provincia: 'HUAMBO', phone: '+244 945 678 901' },
    { name: 'Centro de Identificação Civil de Cabinda', email: 'center.cabinda@sge.ao', address: 'Av. Comandante Gika, Cabinda', provincia: 'CABINDA', phone: '+244 956 789 012' },
  ];

  for (const c of additionalCenters) {
    const cUser = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { email: c.email, role: 'CENTER', password: centerPasswordHash },
    });
    await prisma.center.upsert({
      where: { userId: cUser.id },
      update: {},
      create: {
        userId: cUser.id,
        name: c.name,
        type: 'ADMINISTRATIVE',
        description: `Centro de emissão e regularização do BI em ${c.provincia.charAt(0) + c.provincia.slice(1).toLowerCase()}.`,
        address: c.address,
        phone: c.phone,
        email: c.email,
        provincia: c.provincia as 'LUANDA' | 'BENGUELA' | 'HUAMBO' | 'CABINDA',
        openingTime: '08:00',
        closingTime: '17:00',
        attendanceDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
      },
    });
    console.log(`Seeded center: ${c.name}`);
  }

  // ── Tipos de Serviço ──────────────────────────────────────────
  const tiposServico = [
    'Primeira Via do BI',
    'Segunda Via do BI',
    'Renovação do BI',
    'Actualização de Dados',
  ];

  const tipoIds: Record<string, string> = {};
  for (const desc of tiposServico) {
    const ts = await prisma.tipoServico.upsert({
      where: { descricao: desc },
      update: {},
      create: { descricao: desc },
    });
    tipoIds[desc] = ts.id;
    console.log(`Seeded tipo serviço: ${desc}`);
  }

  // ── Estados de Agendamento ────────────────────────────────────
  const estados = [
    { descricao: 'Agendado', status: 'AGENDADO' },
    { descricao: 'Confirmado', status: 'CONFIRMADO' },
    { descricao: 'Em Processamento', status: 'EM_PROCESSAMENTO' },
    { descricao: 'Concluído', status: 'CONCLUIDO' },
    { descricao: 'Cancelado', status: 'CANCELADO' },
     { descricao: 'Rejeitado', status: 'REJEITADO' },
  ];

  const estadoIds: Record<string, string> = {};
  for (const e of estados) {
    const ea = await prisma.estadoAgendamento.upsert({
      where: { descricao: e.descricao },
      update: {},
      create: { descricao: e.descricao, status: e.status },
    });
    estadoIds[e.status] = ea.id;
    console.log(`Seeded estado: ${e.descricao}`);
  }

  // ── Cidadãos fictícios ────────────────────────────────────────
  const citizenPassword = await bcrypt.hash('Cidadao@2026', 10);

  const citizens = [
    { nome: 'Ana', sobrenome: 'Silva', email: 'ana.silva@mail.ao', sexo: 'F', provincia: 'LUANDA', municipio: 'Viana', bairro: 'Zango' },
    { nome: 'Pedro', sobrenome: 'Santos', email: 'pedro.santos@mail.ao', sexo: 'M', provincia: 'LUANDA', municipio: 'Cazenga', bairro: 'Hoji ya Henda' },
    { nome: 'Maria', sobrenome: 'Fernandes', email: 'maria.fernandes@mail.ao', sexo: 'F', provincia: 'BENGUELA', municipio: 'Lobito', bairro: 'Centro' },
    { nome: 'João', sobrenome: 'Domingos', email: 'joao.domingos@mail.ao', sexo: 'M', provincia: 'HUAMBO', municipio: 'Huambo', bairro: 'Bairro Académico' },
    { nome: 'Teresa', sobrenome: 'Manuel', email: 'teresa.manuel@mail.ao', sexo: 'F', provincia: 'LUANDA', municipio: 'Kilamba Kiaxi', bairro: 'Palanca' },
    { nome: 'Carlos', sobrenome: 'Mbemba', email: 'carlos.mbemba@mail.ao', sexo: 'M', provincia: 'CABINDA', municipio: 'Cabinda', bairro: 'Centro' },
    { nome: 'Francisca', sobrenome: 'Lopes', email: 'francisca.lopes@mail.ao', sexo: 'F', provincia: 'LUANDA', municipio: 'Belas', bairro: 'Talatona' },
    { nome: 'Miguel', sobrenome: 'Tchissola', email: 'miguel.tchissola@mail.ao', sexo: 'M', provincia: 'BENGUELA', municipio: 'Benguela', bairro: 'Bairro da Luz' },
    { nome: 'Isabel', sobrenome: 'Machado', email: 'isabel.machado@mail.ao', sexo: 'F', provincia: 'HUAMBO', municipio: 'Caála', bairro: 'Centro' },
    { nome: 'António', sobrenome: 'Gaspar', email: 'antonio.gaspar@mail.ao', sexo: 'M', provincia: 'LUANDA', municipio: 'Luanda', bairro: 'Maianga' },
    { nome: 'Beatriz', sobrenome: 'Neto', email: 'beatriz.neto@mail.ao', sexo: 'F', provincia: 'LUANDA', municipio: 'Viana', bairro: 'Estalagem' },
    { nome: 'Manuel', sobrenome: 'Kalunguila', email: 'manuel.kalunguila@mail.ao', sexo: 'M', provincia: 'BENGUELA', municipio: 'Catumbela', bairro: 'Centro' },
  ];

  const citizenUserIds: string[] = [];
  for (const c of citizens) {
    const u = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { email: c.email, role: 'CITIZEN', password: citizenPassword },
    });
    citizenUserIds.push(u.id);

    await prisma.cidadao.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        nome: c.nome,
        sobrenome: c.sobrenome,
        dataNascimento: new Date(`199${Math.floor(Math.random() * 9)}-0${(Math.floor(Math.random() * 9) + 1)}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`),
        sexo: c.sexo,
        provinciaResidencia: c.provincia as 'LUANDA' | 'BENGUELA' | 'HUAMBO' | 'CABINDA',
        municipioResidencia: c.municipio,
        bairroResidencia: c.bairro,
        estadoCivil: ['Solteiro(a)', 'Casado(a)', 'Solteiro(a)', 'Casado(a)'][Math.floor(Math.random() * 4)],
      },
    });

    console.log(`Seeded citizen: ${c.nome} ${c.sobrenome}`);
  }

  // ── Agendamentos fictícios ────────────────────────────────────
  // Get all centers for scheduling
  const allCenters = await prisma.center.findMany({ select: { id: true } });
  const tipoKeys = Object.keys(tipoIds);
  const estadoKeys = ['AGENDADO', 'CONFIRMADO', 'EM_PROCESSAMENTO', 'CONCLUIDO', 'CANCELADO'];

  const baseDate = new Date('2026-03-01');
  for (let i = 0; i < citizenUserIds.length; i++) {
    const userId = citizenUserIds[i];
    const centerId = allCenters[i % allCenters.length].id;
    const tipoKey = tipoKeys[i % tipoKeys.length];
    const estadoKey = estadoKeys[i % estadoKeys.length];

    const scheduledDate = new Date(baseDate);
    scheduledDate.setDate(scheduledDate.getDate() + i * 2);

    try {
      await prisma.schedule.create({
        data: {
          userId,
          centerId,
          tipoServicoId: tipoIds[tipoKey],
          estadoAgendamentoId: estadoIds[estadoKey],
          scheduledDate,
          slotNumber: (i % 8) + 1,
          description: `Agendamento de ${tipoKey} para cidadão ${i + 1}`,
        },
      });
      console.log(`Seeded schedule for citizen ${i + 1}: ${tipoKey} - ${estadoKey}`);
    } catch {
      console.log(`Schedule for citizen ${i + 1} already exists, skipping.`);
    }
  }

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
