# DryFit — Sprint 1: Bugs & Features (req.md)

> Plano de implementação baseado nos problemas e funcionalidades levantados em `docs/req.md`.
> Projeto **MOBILE** — Agente principal: `mobile-developer` | Stack: React Native + Expo + Node.js + Prisma

---

## Visão Geral

Este sprint corrige 2 bugs críticos no fluxo principal e implementa 7 novas features que cobrem:
- Melhorias na experiência do Coach (lista de alunos priorizada, sinalizador visual, convites seguros)
- Melhorias na experiência do Aluno (datas futuras de treinos, calendário refinado)
- Refatoração visual completa (tema padrão vermelho/creme + suporte a tema escuro)
- Ajustes pontuais de UI (tela de login, footer, calendário)

---

## Critérios de Sucesso

- [ ] Aluno consegue marcar treino como concluído sem erros
- [ ] Treinos cadastrados para datas futuras aparecem corretamente no app do Aluno
- [ ] Coach visualiza lista de alunos ordenada (sem treino primeiro, com treino depois)
- [ ] Coach possui sinalizador visual distinguindo alunos com/sem treino cadastrado
- [ ] Tela de login exibe apenas os elementos definidos (sem "Ou acesse com")
- [ ] Calendário do Aluno com números menores, sem label "Calendário", com espaçamento adequado
- [ ] Footer padronizado em todas as telas
- [ ] App tem tema padrão vermelho (#b30f15) + branco creme, com opção de alternar para tema escuro nas Configurações
- [ ] Invite code é de uso único (invalidado após cadastro)
- [ ] Coach consegue gerar invite codes aleatórios via botão dedicado

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Mobile | React Native + Expo SDK 51 |
| Estilo | NativeWind v4 (Tailwind CSS) |
| Navegação | Expo Router v3 |
| Backend | Node.js + Fastify v4 + TypeScript |
| ORM | Prisma v5 |
| Banco | PostgreSQL 16 |
| Auth | JWT (access 15min + refresh 7d) |

---

## Arquivos com Impacto Esperado

```
dryfit/
├── apps/
│   ├── api/
│   │   ├── src/modules/workouts/
│   │   │   ├── workouts.routes.ts       ← Bug 1 (PATCH complete), Bug 2 (query datas)
│   │   │   └── workouts.service.ts      ← Bug 2 (filtro scheduledAt), Feature 8 (invite único)
│   │   ├── src/modules/auth/
│   │   │   ├── auth.service.ts          ← Feature 8 (invalidar invite), Feature 9 (gerar invite)
│   │   │   └── auth.routes.ts           ← Feature 9 (novo endpoint)
│   │   └── prisma/
│   │       └── schema.prisma            ← Feature 8 (campo usedAt no InviteCode)
│   │
│   └── mobile/
│       ├── app/
│       │   ├── (auth)/login.tsx         ← Feature 3 (remover "Ou acesse com")
│       │   ├── (coach)/dashboard.tsx    ← Feature 1 (lista ordenada + sinalizador)
│       │   └── (student)/dashboard.tsx  ← Bug 2 (exibir treinos futuros)
│       ├── components/
│       │   ├── coach/StudentCard.tsx    ← Feature 2 (sinalizador visual)
│       │   ├── shared/Footer.tsx        ← Feature 5 (padronização footer)
│       │   └── student/Calendar.tsx     ← Feature 4 (ajustes visuais calendário)
│       ├── constants/
│       │   └── theme.ts                 ← Feature 6 (tokens de cor, tema claro/escuro)
│       └── app/(coach)/settings.tsx     ← Feature 6 (toggle de tema), Feature 9 (botão invite)
```

---

## Breakdown de Tarefas

### 🔴 P0 — Bugs Críticos

---

#### T01 — Bug: Marcar treino como concluído
- **Agente:** `mobile-developer`
- **Skill:** `systematic-debugging`
- **Prioridade:** P0 — bloqueante para fluxo do Aluno
- **Dependências:** nenhuma

**INPUT:**
- Aluno toca em "Marcar como Concluído"
- Nenhuma resposta / erro silencioso

**OUTPUT:**
- `PATCH /workouts/:id/complete` é chamado com sucesso
- Status muda para `COMPLETED` na UI sem necessidade de reload

**VERIFY:**
1. Logar como Aluno
2. Selecionar o treino do dia
3. Tocar em "Concluído"
4. Confirmar que o status muda visualmente e persiste após fechar/abrir o app

**Checklist de debug:**
- [ ] Verificar se o handler do botão está conectado ao hook correto
- [ ] Verificar se a chamada de API inclui o token JWT no header
- [ ] Verificar logs do backend para erros 401/403/500
- [ ] Verificar se o `workoutId` está sendo passado corretamente

---

#### T02 — Bug: Treinos de datas futuras não aparecem para o Aluno
- **Agente:** `mobile-developer` (backend + mobile)
- **Skill:** `systematic-debugging`
- **Prioridade:** P0 — bloqueante para fluxo de agendamento
- **Dependências:** nenhuma

**INPUT:**
- Coach agenda treino para data 23/02/2026
- Aluno abre o calendário e seleciona 23/02 → treino não aparece

**OUTPUT:**
- `GET /workouts?date=2026-02-23` retorna o treino agendado
- Calendário do Aluno exibe treinos para qualquer data com workout cadastrado

**VERIFY:**
1. Coach cria treino para data futura (ex: +3 dias)
2. Aluno abre app → seleciona a data no calendário
3. Treino aparece corretamente naquela data

**Checklist de debug:**
- [ ] Verificar query no `workouts.service.ts`: filtro por `scheduledAt` está comparando com timezone correto?
- [ ] Verificar se o front está enviando a data no formato ISO 8601 (`YYYY-MM-DD`)
- [ ] Checar se o calendário do Aluno está buscando treinos para a data selecionada ou apenas para "hoje"
- [ ] Verificar se há diferença de timezone entre backend e mobile (usar UTC como padrão)

---

### 🟠 P1 — Features Core do Produto

---

#### T03 — Feature: Lista de Alunos do Coach com Prioridade e Sinalizador Visual
- **Agente:** `mobile-developer` + `frontend-specialist` (sinalizador visual)
- **Skill:** `mobile-design`
- **Prioridade:** P1 — diferencial do produto para o Coach
- **Dependências:** T02 (lógica de datas deve estar correta)

**INPUT:**
- Coach seleciona uma data no seu calendário
- Lista de alunos é carregada

**OUTPUT:**
- Alunos **sem** treino na data selecionada → topo da lista
- Alunos **com** treino já cadastrado → final da lista
- Sinalizador visual: checkmark (✅) ou badge verde no card do aluno que já tem treino
- Comportamento idêntico para data atual (Cenário 1) e data futura (Cenário 2)

**VERIFY:**
1. Coach seleciona data com 2 alunos: 1 com treino, 1 sem
2. Aluno sem treino aparece primeiro
3. Adicionar treino para o aluno do topo → ele desce para o final com sinalizador

**Subtarefas:**
- [ ] Adicionar endpoint `GET /workouts/coach/by-date?date=YYYY-MM-DD` retornando alunos + flag `hasWorkout`
- [ ] Atualizar `coach/dashboard.tsx` para ordenar lista por `hasWorkout`
- [ ] Atualizar `StudentCard.tsx` para exibir sinalizador quando `hasWorkout = true`

---

#### T04 — Feature: Invite Code de Uso Único
- **Agente:** `mobile-developer` (backend)
- **Skill:** `api-patterns`
- **Prioridade:** P1 — segurança e integridade do produto
- **Dependências:** T01, T02 (estabilizar o core antes)

**INPUT:**
- Coach gera um invite code (ex: `DRFT3X`)
- Aluno A usa o código e se cadastra
- Aluno B tenta usar o mesmo código

**OUTPUT:**
- Aluno B recebe erro `400 - Invite code já utilizado`
- No banco: campo `usedAt: DateTime?` é preenchido no momento do uso

**VERIFY:**
1. Usar invite code → cadastro bem-sucedido
2. Tentar reusar o mesmo código → erro claro retornado
3. Verificar no banco que `usedAt` foi preenchido

**Mudanças no Schema Prisma:**
```prisma
model InviteCode {
  id        String    @id @default(cuid())
  code      String    @unique
  coachId   String
  coach     User      @relation(fields: [coachId], references: [id])
  usedAt    DateTime?          // null = disponível, preenchido = invalidado
  usedBy    String?            // userId de quem usou (auditoria)
  createdAt DateTime  @default(now())
}
```

---

#### T05 — Feature: Botão de Geração de Invite Aleatório
- **Agente:** `mobile-developer`
- **Skill:** `api-patterns`
- **Prioridade:** P1 — segurança
- **Dependências:** T04 (schema de InviteCode deve existir)

**INPUT:**
- Coach acessa a tela de Configurações
- Toca no botão "Gerar Novo Invite"

**OUTPUT:**
- Backend gera código usando `crypto.randomBytes` (ex: 8 chars, formato `DRFT-XXXX`)
- Código exibido na tela + botão de copiar
- Cada toque no botão gera um novo código (o anterior permanece válido até ser usado)

**VERIFY:**
1. Tocar em "Gerar Novo Invite" → código único aparece
2. Tocar novamente → código diferente aparece
3. Compartilhar com aluno → aluno consegue se cadastrar com sucesso

---

### 🟡 P2 — Melhorias de UX e Interface

---

#### T06 — Feature: Limpeza da Tela de Login
- **Agente:** `frontend-specialist` (via `mobile-developer`)
- **Skill:** `mobile-design`
- **Prioridade:** P2 — polish de UI
- **Dependências:** nenhuma (tela independente)

**INPUT:**
- Tela de login atual com string "Ou acesse com" e layout desalinhado

**OUTPUT:**
- String "Ou acesse com" removida
- Layout sutilmente deslocado para baixo
- Ordem dos elementos: Ícone → "dryfit" → Frase → Login → Senha → Botão Entrar → Criar conta → "Sou professor"

**VERIFY:**
- [ ] Abrir tela de login no simulador
- [ ] Confirmar ausência de "Ou acesse com"
- [ ] Confirmar hierarquia visual correta dos elementos

---

#### T07 — Feature: Ajustes Visuais no Calendário do Aluno
- **Agente:** `frontend-specialist` (via `mobile-developer`)
- **Skill:** `mobile-design`
- **Prioridade:** P2 — polish de UI
- **Dependências:** T02 (calendário deve estar funcionando corretamente)

**INPUT:**
- Calendário com números grandes, label "Calendário" e botões de dias sem espaçamento

**OUTPUT:**
- Números dos dias levemente menores (reduzir 2–4pt)
- Label "Calendário" removida (ganho de espaço vertical)
- Espaçamento sutil (`gap` ou `margin`) entre os botões dos dias

**VERIFY:**
- [ ] Ver calendário no simulador — números visivelmente menores
- [ ] Sem texto "Calendário" na tela
- [ ] Dias separados com espaçamento visível mas discreto

---

### 🟢 P3 — Refatoração de Tema

---

#### T09 — Feature: Refatoração de Cores (Tema Claro Padrão + Toggle Escuro)
- **Agente:** `frontend-specialist` (via `mobile-developer`) — **usar `frontend-specialist` para o UI**
- **Skill:** `frontend-design`, `mobile-design`
- **Prioridade:** P3 — cosmético, maior esforço e risco de regressão visual
- **Dependências:** T06, T07, T08 (estabilizar UI antes de refatorar cores)

> [!WARNING]
> **NENHUMA REGRA DE NEGÓCIO deve ser alterada.** Esta tarefa é puramente de estilo CSS/NativeWind.

**INPUT:**
- Tema atual: fundo escuro (#0a0a0a), vermelho (#b30f15) como acento

**OUTPUT:**
- **Tema Claro (PADRÃO):** fundo branco creme (`#FAF8F5`), primário `#b30f15`, textos escuros
- **Tema Escuro:** cores atuais do app (mantidas intactas como "black theme")
- Toggle "Tema" na tela de Configurações do Coach (e Aluno)
- Preferência salva em `AsyncStorage` / `SecureStore`

**Tokens de Cor:**
```
LIGHT THEME:
  background: #FAF8F5
  surface:    #FFFFFF
  primary:    #b30f15
  text:       #1A1A1A
  subtext:    #6B6B6B

DARK THEME (atual):
  background: #0a0a0a
  surface:    #1c1f26
  primary:    #b30f15
  text:       #FFFFFF
  subtext:    #A0A0A0
```

**VERIFY:**
- [ ] Abrir app → tema claro vermelho/creme por padrão
- [ ] Ir em Configurações → alternar para tema escuro → cores mudam imediatamente
- [ ] Fechar e reabrir o app → preferência de tema persiste
- [ ] Nenhuma regra de negócio foi alterada (testar fluxo completo de treino)
- [ ] `npm run lint` sem erros após a refatoração

---

## Grafo de Dependências

```
T01 (Bug: Concluir treino) ─────────────────────────┐
T02 (Bug: Datas futuras) ──────────────────────────┐ │
                                                    ↓ ↓
                                              T03 (Lista Coach + Sinalizador)
                                                    ↓
                                              T04 (Invite Único)
                                                    ↓
                                              T05 (Gerar Invite Aleatório)

T06 (Login UI)  ──┐
T07 (Calendário)  ├──→ T09 (Refatoração de Tema)
T08 (Footer)    ──┘
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| Timezone mismatch datas (Bug 2) | Alta | Padronizar tudo em UTC no backend, converter no front |
| Refatoração de tema quebrando regras de negócio | Média | Branch separado + teste de fluxo completo antes do merge |
| Invite único quebrando cadastros existentes | Média | Migração cuidadosa: criar tabela `InviteCode` sem deletar campo legado |
| Performance da lista ordenada do Coach | Baixa | Ordenação no backend (SQL ORDER BY), não no frontend |

---

## Phase X — Verificação Final

### Checklist de Fluxo Completo

**Fluxo Coach:**
- [ ] Login como Coach → dashboard carrega
- [ ] Selecionar data → lista ordenada (sem treino primeiro)
- [ ] Criar treino para aluno → sinalizador aparece no card
- [ ] Ir em Config → gerar invite code aleatório → copiar
- [ ] Ir em Config → alternar tema → tema persiste

**Fluxo Aluno:**
- [ ] Cadastrar com invite code de uso único
- [ ] Tentar reusar o mesmo código → erro claro
- [ ] Logar → calendário sem label, com espaçamento
- [ ] Selecionar data futura com treino → treino aparece
- [ ] Marcar treino como concluído → status muda
- [ ] Tema padrão é vermelho/creme (claro)

### Scripts de Verificação
```bash
# Lint
npm run lint

# TypeScript
npx tsc --noEmit

# Security
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# Mobile audit
python .agent/skills/mobile-design/scripts/mobile_audit.py .

# UX audit
python .agent/skills/frontend-design/scripts/ux_audit.py .
```

---

## 📊 Tabela de Prioridades — Guia de Prompts

> Use esta tabela para estruturar seus prompts na ordem de implementação. Sempre inicie pelo P0 antes de avançar.

| # | Prioridade | Tarefa | Agente Recomendado | Arquivo(s) Principal(is) | Prompt Sugerido |
|---|-----------|--------|---------------------|--------------------------|-----------------|
| 1 | 🔴 **P0** | Bug: Marcar treino como concluído | `mobile-developer` + `debugger` | `workouts.routes.ts`, `(student)/dashboard.tsx` | "Corrija o bug onde o aluno não consegue marcar o treino como concluído. Verifique o handler do botão, a chamada PATCH /workouts/:id/complete e a autenticação JWT." |
| 2 | 🔴 **P0** | Bug: Treinos futuros não aparecem | `mobile-developer` + `debugger` | `workouts.service.ts`, `Calendar.tsx` | "Corrija o bug onde treinos agendados para datas futuras não aparecem no app do Aluno. Verifique o filtro de `scheduledAt` no backend e se o calendário busca pela data selecionada (não apenas hoje). Padronize timezone em UTC." |
| 3 | 🟠 **P1** | Lista Coach ordenada + sinalizador | `mobile-developer` + `frontend-specialist` | `coach/dashboard.tsx`, `StudentCard.tsx` | "Implemente a lógica de lista do Coach: alunos sem treino na data selecionada ficam no topo, alunos com treino ficam no final com um sinalizador visual (checkmark verde). Crie endpoint GET /workouts/coach/by-date." |
| 4 | 🟠 **P1** | Invite code de uso único | `mobile-developer` | `auth.service.ts`, `schema.prisma` | "Implemente invite code de uso único: após cadastro bem-sucedido, grave `usedAt` e `usedBy` no modelo `InviteCode`. Tentativas de reuso devem retornar 400 com mensagem clara." |
| 5 | 🟠 **P1** | Botão gerar invite aleatório | `mobile-developer` | `auth.routes.ts`, `(coach)/settings.tsx` | "Adicione botão 'Gerar Novo Invite' na tela de Configurações do Coach. O backend gera código único com crypto.randomBytes (8 chars). Exibir código gerado com botão de copiar." |
| 6 | 🟡 **P2** | Limpeza da tela de login | `frontend-specialist` | `(auth)/login.tsx` | "Remova a string 'Ou acesse com' da tela de login e ajuste o layout sutilmente para baixo. Elementos na ordem: Ícone → dryfit → Frase → Login → Senha → Entrar → Criar conta → Sou professor." |
| 7 | 🟡 **P2** | Ajustes visuais do calendário | `frontend-specialist` | `Calendar.tsx` | "Ajuste o calendário do Aluno: reduza levemente o tamanho dos números dos dias, remova o texto 'Calendário' para ganhar espaço, adicione espaçamento sutil entre os botões de dias." |
| 8 | 🟡 **P2** | Padronizar footer | `frontend-specialist` | `Footer.tsx` (novo/existente) | "Padronize o componente de footer em todas as telas do app (Coach e Aluno). Crie um componente Footer.tsx unificado com altura, cores e ícones consistentes." |
| 9 | 🟢 **P3** | Refatoração de tema claro + toggle | `frontend-specialist` | `theme.ts`, `settings.tsx`, todos os componentes | "Refatore o tema do app SEM ALTERAR REGRAS DE NEGÓCIO: tema padrão vermelho (#b30f15) + branco creme (#FAF8F5). Tema escuro = cores atuais. Adicione toggle na tela de Configurações com persistência via AsyncStorage." |

---

*Plano criado em: 2026-02-21 | Sprint: 1 | Baseado em: `docs/req.md`*
