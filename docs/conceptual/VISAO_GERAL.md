# Visão Geral do Sistema de Agendamento Institucional

## 1. Objetivo do Sistema

Plataforma centralizada para gerenciamento de agendamentos em instituições públicas e privadas, permitindo cidadãos marcarem appointments em diferentes centros (saúde, administrativos, educação, etc.) de forma eficiente e organizada.

## 2. Escopo Funcional

### 2.1 Módulos Principais

#### **Auth (Autenticação)**
- Registro de novos utilizadores
- Login com JWT
- Refresh tokens
- Logout

#### **Users (Utilizadores)**
- Gestão de perfis de utilizadores
- Visualização de dados pessoais
- Desativação de conta

#### **Centros**
- Cadastro e gestão de centros de atendimento
- Configuração de horários
- Definição de dias de funcionamento
- Visualização de agendamentos

#### **Agendamentos**
- Criar, visualizar, editar e cancelar agendamentos
- Filtrar por centro, data ou status
- Confirmação de agendamentos
- Histórico de agendamentos

## 3. Fluxo de Agendamento

```
Cidadão Login
    ↓
Buscar Centro
    ↓
Ver Disponibilidades
    ↓
Criar Agendamento (Status: PENDENTE)
    ↓
Centro Confirma (Status: CONFIRMADO)
    ↓
Cidadão Comparece (Status: EM_PROGRESSO → CONCLUIDO)
    ↓
Histórico Guardado
```

## 4. Perfis de Utilizador

### 4.1 ADMIN
- Acesso total ao sistema
- Gestão de todos os centros
- Visualização de todos os agendamentos
- Geração de relatórios

### 4.2 CENTRO
- Gestão do seu próprio centro
- Visualização de agendamentos do centro
- Confirmação/rejeição de agendamentos
- Gestão de horários

### 4.3 CIDADAO
- Criação de agendamentos
- Visualização dos seus agendamentos
- Cancelamento de agendamentos
- Atualização de perfil

## 5. Estrutura de Dados

### Entidades Principais

**User**
- ID, Email, Nome, Password, Role, Ativo, Timestamps

**Centro**
- ID, Nome, Tipo, Endereço, Telefone, Email
- Horários de Funcionamento, Dias de Atendimento
- UserId (Relação), Ativo, Timestamps

**Agendamento**
- ID, Data, NumeroVaga, Descrição, Status
- UserId (Cidadão), CentroId, Timestamps

**RefreshToken** (Segurança)
- ID, Token, UserId, ExpiresAt

### Enums

**Role**: ADMIN, CENTRO, CIDADAO

**AgendamentoStatus**: PENDENTE, CONFIRMADO, EM_PROGRESSO, CONCLUIDO, CANCELADO

**TipoCentro**: SAUDE, ADMINISTRATIVO, EDUCACAO, SEGURANCA, OUTRO

## 6. Regras de Negócio

### 6.1 Agendamentos
- Cidadão só pode criar agendamento com data futura
- Não pode ter 2 agendamentos no mesmo centro na mesma data
- Centro pode confirmar/rejeitar agendamentos pendentes
- Cancelamento só possível se status não for CONCLUIDO

### 6.2 Centros
- Cada centro é associado a um utilizador com role CENTRO
- Horários devem estar no formato HH:MM
- Centros podem ter múltiplos agendamentos

### 6.3 Segurança
- Cidadão só vê seus próprios agendamentos (sem ser ADMIN)
- Centro só vê agendamentos do seu centro
- JWT válido por 24h
- Senhas encriptadas com bcrypt

## 7. API Endpoints Principais

- `POST /auth/register` - Registar novo utilizador
- `POST /auth/login` - Autenticação
- `GET /users` - Listar utilizadores
- `GET /centros` - Listar centros
- `POST /centros` - Criar novo centro
- `GET /agendamentos` - Listar agendamentos
- `POST /agendamentos` - Criar agendamento
- `PUT /agendamentos/:id` - Atualizar agendamento
- `DELETE /agendamentos/:id/cancel` - Cancelar agendamento

## 8. Tecnologias Utilizadas

- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT + Passport
- **Validação**: class-validator
- **Segurança**: bcrypt
- **Testing**: Jest
- **Documentation**: Swagger (futuro)
