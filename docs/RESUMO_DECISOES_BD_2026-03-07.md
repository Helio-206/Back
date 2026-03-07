# Resumo Executivo — Decisões BD Aprovadas (07/03/2026)

**Para:** Time Administrativo + Técnico  
**Assunto:** Alinhamento MER/DER completo — Go-ahead para implementação

---

## ✅ DECISÕES APROVADAS (implementação nesta sprint)

### 1. CIDADAO — Tabela dedicada
- **Separar `User` (auth) de `Cidadao` (dados civis)**
- Relação 1:1 entre User e Cidadao
- Campos completos: nome, sobrenome, endereço, filiação, estado civil, altura

### 2. TIPO_SERVICO e ESTADO_AGENDAMENTO — Tabelas de referência
- **Migrar de enums para tabelas**
- Justificativa: sistema de agendamento precisa tipos dinâmicos
- Permite adicionar/editar tipos sem deploy de código

### 3. DOCUMENTO_BI — Nova tabela
- **Implementar nesta sprint**
- Campos: numero_bi (único), data_emissao, data_validade, FK cidadao
- Justificativa: fornecer dados previamente para acelerar emissão presencial

### 4. FUNCIONARIO e ATENDIMENTO — Fluxo operacional
- **Implementar nesta sprint**
- Funcionario vinculado a Posto (Centro)
- Agendamento → atribuição automática de funcionário → Atendimento
- Permite rastreabilidade completa do processo

### 5. PROVÍNCIAS — Lista oficial
- ⏳ **Aguardando** (entrega do time BD em ~1h)
- Atualizar enum/tabela com 24 províncias de Angola (nomenclatura canônica)

---

## 📊 IMPACTO NO PROJETO

### Escopo técnico
- **6 novas tabelas**: Cidadao, DocumentoBI, Funcionario, Atendimento, TipoServico, EstadoAgendamento
- **Refatoração**: Schedule (remover enums, adicionar FKs)
- **Breaking changes**: endpoints de registro, perfil e agendamento

### Cronograma
- **Estimativa:** 17-18 dias (~3.5 semanas)
- **Paralelização:** possível com 2 devs (reduz para ~12-14 dias)

### Fases de trabalho
1. **Migrations Prisma** (6 dias)
2. **DTOs + Endpoints** (3.5 dias)
3. **Testes** (3.5 dias)
4. **Documentação + Seeds** (1.5 dias)
5. **Validação final** (1.5 dias)

---

## 🚦 PRÓXIMOS PASSOS IMEDIATOS

### Blocker (antes de iniciar)
- [ ] Receber lista oficial de 24 províncias (~1h)
- [ ] Aprovação final do schema expandido (anexo com os 6 models)

### Ação técnica (após go-ahead)
1. Criar branch `feature/mer-alignment` a partir de `develop`
2. Implementar migrations Prisma incrementais
3. Atualizar DTOs e services conforme novo contrato
4. Reescrever testes (25 unit + 41 E2E + novos cenários)
5. Publicar changelog para frontend

### Comunicação
- Avisar time de frontend sobre breaking changes com 48h de antecedência
- Congelar contrato de payloads após aprovação (evitar mudanças mid-sprint)

---

## 📋 DOCUMENTOS DE REFERÊNCIA

1. [Relatório MER vs Backend](./RELATORIO_MER_BD_VS_BACKEND_2026-03-07.md)
2. [Plano Técnico de Migração](./PLANO_MIGRACAO_CIDADAO_2026-03-07.md)
3. MER/DER original enviado pelo time de BD

---

## 🎯 BENEFÍCIOS ESPERADOS

✅ Alinhamento total com visão de domínio do time de BD  
✅ Separação clara: autenticação vs. dados civis vs. documentação  
✅ Fluxo operacional completo (agendamento → funcionário → atendimento)  
✅ Tipos e estados dinâmicos (sem necessidade de deploy para adicionar)  
✅ Rastreabilidade completa do processo de emissão de BI  
✅ Preparação para integração com sistemas externos (se aplicável)

---

## ⚠️ RISCOS MITIGADOS

### Risco 1: Breaking changes
- **Mitigação:** Publicar changelog 48h antes + versionamento temporário de endpoints

### Risco 2: Complexidade aumentada
- **Mitigação:** Dividir em fases incrementais + testes contínuos

### Risco 3: Prazo estendido
- **Mitigação:** Paralelizar trabalho com 2 devs (se viável)

---

**Aguardando go-ahead administrativo para iniciar implementação.**
