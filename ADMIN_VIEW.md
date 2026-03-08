# Visão do Administrador - Sistema de Agendamento de BI

## Resumo Executivo

A **Visão do Administrador** é o painel de gestão completo do sistema que permite aos administradores supervisionar, configurar e gerir todas as operações relacionadas ao agendamento de regularização de Bilhetes de Identidade.

---

## Funcionalidades Core

### 1. Dashboard Principal
**Objetivo:** Visão geral em tempo real do sistema

**Componentes:**
- **Métricas em Destaque:**
  - Total de agendamentos (hoje, semana, mês)
  - Agendamentos pendentes vs. concluídos
  - Taxa de cancelamento
  - Centros mais requisitados
  - Tipos de serviço mais solicitados

- **Gráficos e Visualizações:**
  - Gráfico de linha: evolução de agendamentos ao longo do tempo
  - Gráfico de barras: distribuição por tipo de serviço
  - Mapa de calor: agendamentos por centro e horário
  - Status atual: distribuição por estado (Agendado, Confirmado, Cancelado, Concluído)

- **Alertas e Notificações:**
  - Centros com capacidade esgotada
  - Agendamentos atrasados
  - Aumento anormal de cancelamentos

---

### 2. Gestão de Agendamentos
**Objetivo:** Controle total sobre todos os agendamentos

**Funcionalidades:**
- **Listagem Completa:**
  - Tabela com todos os agendamentos do sistema
  - Filtros avançados: data, centro, tipo de serviço, estado, cidadão
  - Pesquisa por BI ou nome do cidadão
  - Ordenação por múltiplos critérios
  - Exportação para Excel/PDF

- **Ações Individuais:**
  - Visualizar detalhes completos do agendamento
  - Editar data/centro/tipo de serviço
  - Confirmar agendamento manualmente
  - Cancelar agendamento (com motivo obrigatório)
  - Marcar como concluído
  - Adicionar notas/observações internas
  - Histórico completo de mudanças

- **Ações em Lote:**
  - Confirmar múltiplos agendamentos
  - Cancelar agendamentos em massa
  - Reatribuir agendamentos para outro centro
  - Notificar cidadãos via SMS/email

---

### 3. Gestão de Centros de Atendimento
**Objetivo:** Configurar e monitorizar centros de atendimento

**Funcionalidades:**
- **CRUD Completo:**
  - Criar novo centro
  - Editar informações: nome, morada, província, telefone, email
  - Desativar/ativar centro
  - Eliminar centro (apenas se sem agendamentos ativos)

- **Configuração de Capacidade:**
  - Definir horário de funcionamento (dias da semana, horas)
  - Estabelecer limite de agendamentos por dia/hora
  - Configurar dias de feriado/encerramento
  - Definir tempo médio de atendimento por tipo de serviço

- **Monitorização:**
  - Taxa de ocupação em tempo real
  - Histórico de agendamentos por centro
  - Avaliação de desempenho (tempo médio de atendimento)
  - Feedback dos cidadãos (se implementado)

---

### 4. Gestão de Tipos de Serviço
**Objetivo:** Configurar serviços disponíveis

**Funcionalidades:**
- **CRUD:**
  - Criar tipo de serviço (ex: Renovação, 2ª Via, Atualização de Dados)
  - Editar descrição e requisitos
  - Definir tempo estimado de atendimento
  - Definir documentos necessários
  - Desativar/ativar tipo de serviço

- **Configuração Avançada:**
  - Associar tipos de serviço a centros específicos
  - Definir prioridade/urgência
  - Estabelecer taxas ou custos (se aplicável)

---

### 5. Gestão de Estados de Agendamento
**Objetivo:** Configurar fluxo de estados

**Funcionalidades:**
- **Estados do Sistema:**
  - AGENDADO (inicial, criado pelo cidadão)
  - CONFIRMADO (validado pelo admin/centro)
  - EM_ATENDIMENTO (cidadão chegou ao centro)
  - CONCLUÍDO (serviço foi prestado)
  - CANCELADO (cancelado pelo cidadão ou admin)
  - FALTOU (cidadão não compareceu)

- **Configuração:**
  - Adicionar novos estados personalizados
  - Definir transições permitidas entre estados
  - Configurar notificações automáticas por estado
  - Personalizar cores e ícones para cada estado

---

### 6. Gestão de Utilizadores
**Objetivo:** Controlar acessos e permissões

**Funcionalidades:**
- **Administradores:**
  - Criar/editar/desativar contas de admin
  - Definir níveis de permissão (super-admin, admin de centro, operador)
  - Atribuir administradores a centros específicos
  - Histórico de ações de cada admin (audit log)

- **Cidadãos:**
  - Visualizar todos os cidadãos registados
  - Pesquisar por BI, nome, email
  - Ver histórico completo de agendamentos de um cidadão
  - Desativar contas suspeitas ou duplicadas
  - Redefinir senha de cidadão (com validação)

---

### 7. Relatórios e Análises
**Objetivo:** Gerar insights e relatórios para tomada de decisão

**Relatórios Disponíveis:**
- **Operacionais:**
  - Relatório diário de agendamentos por centro
  - Relatório semanal/mensal de atendimentos
  - Taxa de comparecimento vs. falta
  - Tempo médio de espera e atendimento

- **Estatísticos:**
  - Distribuição demográfica dos cidadãos (idade, província)
  - Sazonalidade: períodos de maior procura
  - Análise de cancelamentos (motivos, padrões)
  - Eficiência por centro e por operador

- **Exportação:**
  - PDF formatado para impressão
  - Excel para análise adicional
  - CSV para integração com outras ferramentas

---

### 8. Configurações do Sistema
**Objetivo:** Personalizar comportamento do sistema

**Configurações:**
- **Notificações:**
  - Ativar/desativar email/SMS para cidadãos
  - Templates de email personalizados
  - Lembretes automáticos (1 dia antes, 1 hora antes)

- **Regras de Negócio:**
  - Tempo mínimo de antecedência para agendamento
  - Número máximo de reagendamentos por cidadão
  - Política de cancelamento (prazo, penalidades)
  - Limite de agendamentos simultâneos por cidadão

- **Interface:**
  - Logotipo do sistema
  - Cores do tema (manter identidade visual do governo)
  - Textos de ajuda e instruções

---

## Arquitetura Proposta

### Frontend (Admin Panel)
- **Framework:** React + TypeScript + Vite
- **UI Library:** Shadcn/UI ou Material-UI (para tabelas e gráficos robustos)
- **Gráficos:** Recharts ou Chart.js
- **Tabelas:** TanStack Table (react-table v8)
- **Datas:** date-fns ou Day.js
- **Estado Global:** Zustand ou Redux Toolkit

### Backend (APIs)
- **Autenticação:** JWT com role-based access control (RBAC)
- **Endpoints Novos:**
  ```
  POST   /auth/admin/login
  GET    /admin/dashboard/metrics
  GET    /admin/schedules?filters=...
  PATCH  /admin/schedules/:id/confirm
  PATCH  /admin/schedules/:id/cancel
  GET    /admin/centers/statistics
  POST   /admin/centers
  PUT    /admin/centers/:id
  GET    /admin/reports/daily
  GET    /admin/users?role=cidadao
  ```

### Segurança
- **Permissões por Role:**
  - `SUPER_ADMIN`: acesso total
  - `ADMIN`: gestão de agendamentos e centros
  - `OPERADOR`: apenas visualização e confirmação de agendamentos
- **Audit Log:** registar todas as ações críticas (quem fez o quê e quando)
- **Rate Limiting:** prevenir abuso de APIs de relatórios

---

## Priorização de Desenvolvimento

### Fase 1 (MVP)
1. Dashboard principal com métricas básicas
2. Listagem e gestão de agendamentos
3. Confirmação/cancelamento manual de agendamentos
4. Gestão básica de centros (CRUD)

### Fase 2 (Expansão)
5. Gestão de utilizadores e permissões
6. Relatórios operacionais básicos
7. Notificações automáticas aos cidadãos
8. Gestão de tipos de serviço e estados

### Fase 3 (Avançado)
9. Gráficos e análises avançadas
10. Configurações do sistema (templates, regras de negócio)
11. Audit log completo
12. Exportação de relatórios em múltiplos formatos

---

## Considerações de UX/UI

### Design System
- **Manter identidade visual:** Emblema de Angola, cores oficiais (vermelho, azul)
- **Sidebar fixa:** navegação rápida entre funcionalidades
- **Breadcrumbs:** orientação clara da localização no sistema
- **Responsive:** funcional em tablet e desktop (mobile opcional)

### Acessibilidade
- Contraste adequado (WCAG AA)
- Navegação por teclado
- Textos alternativos em ícones

### Performance
- Paginação em tabelas (não carregar todos os registos de uma vez)
- Cache de métricas do dashboard (atualizar a cada 5 minutos)
- Lazy loading de componentes pesados

---

## Conclusão

A **Visão do Administrador** é essencial para garantir a operação eficiente do sistema de agendamento. Com ferramentas de gestão, monitorização e análise robustas, os administradores poderão otimizar recursos, melhorar a experiência dos cidadãos e tomar decisões baseadas em dados.

**Próximos Passos:**
1. Validação deste documento com stakeholders (equipa de design, gestão)
2. Definição de wireframes/mockups para as telas principais
3. Priorização de features para desenvolvimento iterativo
4. Estimativas de tempo e recursos necessários

---

**Documento preparado por:** Equipa Técnica  
**Data:** 08/03/2026  
**Versão:** 1.0
