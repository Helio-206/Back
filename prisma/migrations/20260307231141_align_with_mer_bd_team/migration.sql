-- CreateTable
CREATE TABLE "Cidadao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "sexo" TEXT NOT NULL,
    "email" TEXT,
    "provinciaResidencia" "Provincia" NOT NULL,
    "municipioResidencia" TEXT,
    "bairroResidencia" TEXT,
    "ruaResidencia" TEXT,
    "numeroCasa" TEXT,
    "provinciaNascimento" "Provincia",
    "municipioNascimento" TEXT,
    "estadoCivil" TEXT,
    "nomePai" TEXT,
    "sobrenomePai" TEXT,
    "nomeMae" TEXT,
    "sobrenomeMae" TEXT,
    "altura" DECIMAL(5,2),
    "numeroBIAnterior" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Cidadao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoBI" (
    "id" TEXT NOT NULL,
    "numeroBI" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataValidade" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cidadaoId" TEXT NOT NULL,

    CONSTRAINT "DocumentoBI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoServico" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstadoAgendamento" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstadoAgendamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "sobrenome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postoId" TEXT NOT NULL,

    CONSTRAINT "Funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atendimento" (
    "id" TEXT NOT NULL,
    "dataAtendimento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,

    CONSTRAINT "Atendimento_pkey" PRIMARY KEY ("id")
);

-- AlterTable Schedule: Add new FK columns (nullable initially for data migration)
ALTER TABLE "Schedule" ADD COLUMN "tipoServicoId" TEXT;
ALTER TABLE "Schedule" ADD COLUMN "estadoAgendamentoId" TEXT;

-- Insert initial data for EstadoAgendamento
INSERT INTO "EstadoAgendamento" ("id", "descricao", "status", "createdAt", "updatedAt") VALUES
('clx1', 'Agendado', 'AGENDADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx2', 'Confirmado', 'CONFIRMADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx3', 'Biometria Recolhida', 'BIOMETRIA_RECOLHIDA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx4', 'Em Processamento', 'EM_PROCESSAMENTO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx5', 'Pronto para Retirada', 'PRONTO_RETIRADA', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx6', 'Retirado', 'RETIRADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx7', 'Rejeitado', 'REJEITADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx8', 'Cancelado', 'CANCELADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert initial data for TipoServico
INSERT INTO "TipoServico" ("id", "descricao", "createdAt", "updatedAt") VALUES
('clx10', 'Bilhete de Identidade - Novo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx11', 'Bilhete de Identidade - Renovação', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx12', 'Bilhete de Identidade - Perda', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx13', 'Bilhete de Identidade - Extravio', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('clx14', 'Bilhete de Identidade - Atualização de Dados', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Migrate existing Schedule data: map biStatus enum to EstadoAgendamento FK
UPDATE "Schedule" 
SET "estadoAgendamentoId" = CASE 
    WHEN "biStatus" = 'AGENDADO' THEN 'clx1'
    WHEN "biStatus" = 'CONFIRMADO' THEN 'clx2'
    WHEN "biStatus" = 'BIOMETRIA_RECOLHIDA' THEN 'clx3'
    WHEN "biStatus" = 'EM_PROCESSAMENTO' THEN 'clx4'
    WHEN "biStatus" = 'PRONTO_RETIRADA' THEN 'clx5'
    WHEN "biStatus" = 'RETIRADO' THEN 'clx6'
    WHEN "biStatus" = 'REJEITADO' THEN 'clx7'
    WHEN "biStatus" = 'CANCELADO' THEN 'clx8'
    ELSE 'clx1'
END
WHERE "biStatus" IS NOT NULL;

-- Migrate existing Schedule data: map tipoBI enum to TipoServico FK
UPDATE "Schedule" 
SET "tipoServicoId" = CASE 
    WHEN "tipoBI" = 'NOVO' THEN 'clx10'
    WHEN "tipoBI" = 'RENOVACAO' THEN 'clx11'
    WHEN "tipoBI" = 'PERDA' THEN 'clx12'
    WHEN "tipoBI" = 'EXTRAVIO' THEN 'clx13'
    WHEN "tipoBI" = 'ATUALIZACAO_DADOS' THEN 'clx14'
    ELSE NULL
END
WHERE "tipoBI" IS NOT NULL;

-- Set default estado for records without biStatus (shouldn't exist, but safe)
UPDATE "Schedule" 
SET "estadoAgendamentoId" = 'clx1'
WHERE "estadoAgendamentoId" IS NULL;

-- Drop old enum columns from Schedule
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "status";
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "tipoBI";
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "biStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Cidadao_userId_key" ON "Cidadao"("userId");

-- CreateIndex
CREATE INDEX "Cidadao_userId_idx" ON "Cidadao"("userId");

-- CreateIndex
CREATE INDEX "Cidadao_provinciaResidencia_idx" ON "Cidadao"("provinciaResidencia");

-- CreateIndex
CREATE INDEX "Cidadao_dataNascimento_idx" ON "Cidadao"("dataNascimento");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoBI_numeroBI_key" ON "DocumentoBI"("numeroBI");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoBI_cidadaoId_key" ON "DocumentoBI"("cidadaoId");

-- CreateIndex
CREATE INDEX "DocumentoBI_numeroBI_idx" ON "DocumentoBI"("numeroBI");

-- CreateIndex
CREATE INDEX "DocumentoBI_dataValidade_idx" ON "DocumentoBI"("dataValidade");

-- CreateIndex
CREATE UNIQUE INDEX "TipoServico_descricao_key" ON "TipoServico"("descricao");

-- CreateIndex
CREATE INDEX "TipoServico_descricao_idx" ON "TipoServico"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "EstadoAgendamento_descricao_key" ON "EstadoAgendamento"("descricao");

-- CreateIndex
CREATE INDEX "EstadoAgendamento_status_idx" ON "EstadoAgendamento"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Funcionario_email_key" ON "Funcionario"("email");

-- CreateIndex
CREATE INDEX "Funcionario_postoId_idx" ON "Funcionario"("postoId");

-- CreateIndex
CREATE INDEX "Funcionario_email_idx" ON "Funcionario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Atendimento_agendamentoId_key" ON "Atendimento"("agendamentoId");

-- CreateIndex
CREATE INDEX "Atendimento_agendamentoId_idx" ON "Atendimento"("agendamentoId");

-- CreateIndex
CREATE INDEX "Atendimento_funcionarioId_idx" ON "Atendimento"("funcionarioId");

-- CreateIndex
CREATE INDEX "Atendimento_dataAtendimento_idx" ON "Atendimento"("dataAtendimento");

-- CreateIndex Schedule new FK indexes
CREATE INDEX "Schedule_tipoServicoId_idx" ON "Schedule"("tipoServicoId");

CREATE INDEX "Schedule_estadoAgendamentoId_idx" ON "Schedule"("estadoAgendamentoId");

-- AddForeignKey
ALTER TABLE "Cidadao" ADD CONSTRAINT "Cidadao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoBI" ADD CONSTRAINT "DocumentoBI_cidadaoId_fkey" FOREIGN KEY ("cidadaoId") REFERENCES "Cidadao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funcionario" ADD CONSTRAINT "Funcionario_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "Funcionario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_tipoServicoId_fkey" FOREIGN KEY ("tipoServicoId") REFERENCES "TipoServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_estadoAgendamentoId_fkey" FOREIGN KEY ("estadoAgendamentoId") REFERENCES "EstadoAgendamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

