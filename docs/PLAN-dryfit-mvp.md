# DryFit MVP — Plano de Implementação

> App híbrido (iOS/Android) para Personal Trainers e Professores de CrossFit.

## Visão Geral

Construir um MVP completo **ponta-a-ponta** com 3 fluxos essenciais:
1. **Autenticação** — Login e cadastro diferenciado (Professor vs Aluno com invite code)
2. **Dashboard do Professor** — Gerenciar alunos e criar/enviar treinos
3. **Dashboard do Aluno** — Visualizar e concluir o treino do dia

## Tipo de Projeto

> **MOBILE** — Agente principal: `mobile-developer`

---

## Critérios de Sucesso

- [ ] Professor consegue logar e visualizar lista de alunos
- [ ] Professor consegue criar e enviar treino para aluno selecionado
- [ ] Professor consegue copiar invite_code para compartilhar via WhatsApp
- [ ] Aluno consegue se cadastrar usando o invite_code do professor
- [ ] Aluno visualiza o treino do dia e marca como "Concluído"
- [ ] Fluxo sem treino exibe "Aguardando seu coach enviar o WOD"
- [ ] JWT auth funcionando com refresh token
- [ ] TypeScript strict em todos os pacotes

---

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Mobile | React Native + Expo SDK 51 | Cross-platform, OTA updates, DX rápida |
| Estilo | NativeWind v4 (Tailwind CSS) | Consistência com design tokens do HTML mockup |
| Navegação | Expo Router v3 (file-based) | Simplicidade + deep linking nativo |
| Backend | Node.js + Fastify v4 + TypeScript | Performance > Express, schema validation built-in |
| ORM | Prisma v5 | Type-safe queries, migrations gerenciadas |
| Banco | PostgreSQL 16 | Relações fortes Coach→Student→Workout |
| Auth | JWT (access 15min + refresh 7d) | Stateless, seguro |
| Hashing | bcrpyt | Senhas + invite_code geração |
| Mono/Multi | Monorepo com dois pacotes: `apps/mobile` e `apps/api` | Compartilhar types |

---

## Decisões Críticas de Negócio

> [!IMPORTANT]
> **Cadastro de Professores:** Professores NÃO se auto-cadastram. Eles recebem email+senha pré-gerados pelos donos do app (você) após a compra. O endpoint `POST /auth/register` é apenas para **ALUNOS** (requer `invite_code` obrigatório).

> [!NOTE]
> **Invite Code:** É um hash de 6 caracteres (ex: `DRFT3X`) gerado no momento em que o professor é cadastrado no sistema (via seed/admin). Exibido no painel de Settings do professor.

---

## Estrutura de Arquivos

```
dryfit/
├── apps/
│   ├── api/                          # Backend Node.js + Fastify
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── auth.schema.ts
│   │   │   │   ├── workouts/
│   │   │   │   │   ├── workouts.routes.ts
│   │   │   │   │   ├── workouts.service.ts
│   │   │   │   │   └── workouts.schema.ts
│   │   │   │   └── users/
│   │   │   │       ├── users.routes.ts
│   │   │   │       └── users.service.ts
│   │   │   ├── plugins/
│   │   │   │   ├── jwt.ts
│   │   │   │   └── prisma.ts
│   │   │   ├── middleware/
│   │   │   │   └── auth.middleware.ts
│   │   │   └── app.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                       # React Native + Expo
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   ├── (coach)/
│       │   │   ├── _layout.tsx
│       │   │   ├── dashboard.tsx
│       │   │   └── settings.tsx
│       │   ├── (student)/
│       │   │   ├── _layout.tsx
│       │   │   └── dashboard.tsx
│       │   └── _layout.tsx
│       ├── components/
│       │   ├── auth/
│       │   │   ├── RoleToggle.tsx
│       │   │   └── InviteCodeInput.tsx
│       │   ├── coach/
│       │   │   ├── StudentCard.tsx
│       │   │   ├── WorkoutBuilderModal.tsx
│       │   │   └── ExerciseInput.tsx
│       │   └── student/
│       │       ├── WorkoutCard.tsx
│       │       ├── ExerciseItem.tsx
│       │       └── EmptyWorkout.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   └── useWorkouts.ts
│       ├── lib/
│       │   ├── api.ts               # Axios/fetch client
│       │   └── storage.ts           # SecureStore JWT
│       ├── tailwind.config.js
│       ├── app.json
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   └── types/                        # Tipos compartilhados
│       ├── src/
│       │   ├── user.ts
│       │   └── workout.ts
│       └── package.json
│
└── package.json                      # Workspace root
```

---

## Schema do Banco de Dados (Prisma)

```prisma
// prisma/schema.prisma

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String
  name        String
  role        Role     @default(STUDENT)
  inviteCode  String?  @unique   // apenas COACH
  coachId     String?            // apenas STUDENT
  coach       User?    @relation("CoachStudents", fields: [coachId], references: [id])
  students    User[]   @relation("CoachStudents")
  workouts    Workout[] @relation("CoachWorkouts")
  assignedWorkouts Workout[] @relation("StudentWorkouts")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Role {
  COACH
  STUDENT
}

model Workout {
  id          String    @id @default(cuid())
  title       String
  type        WorkoutType @default(STRENGTH)
  status      WorkoutStatus @default(PENDING)
  exercises   Exercise[]
  coachId     String
  coach       User      @relation("CoachWorkouts", fields: [coachId], references: [id])
  studentId   String
  student     User      @relation("StudentWorkouts", fields: [studentId], references: [id])
  scheduledAt DateTime  @default(now())
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum WorkoutType {
  STRENGTH   // Sets/Reps
  WOD        // Time Cap/Rounds (CrossFit)
  HIIT
  CUSTOM
}

enum WorkoutStatus {
  PENDING
  COMPLETED
}

model Exercise {
  id        String   @id @default(cuid())
  name      String
  sets      Int?
  reps      String?  // "12" ou "AMRAP" ou "To Failure"
  weight    String?  // "80kg" ou "bodyweight"
  duration  String?  // para WOD/HIIT (ex: "21min")
  rounds    Int?     // para WOD
  order     Int
  workoutId String
  workout   Workout  @relation(fields: [workoutId], references: [id], onDelete: Cascade)
}
```

---

## Endpoints da API

| Método | Rota | Role | Descrição |
|--------|------|------|-----------|
| `POST` | `/auth/login` | Any | Login com email+senha → JWT |
| `POST` | `/auth/register` | Public | Cadastro de ALUNO (requer `invite_code`) |
| `GET` | `/users/me` | Auth | Dados do usuário logado |
| `GET` | `/users/students` | COACH | Lista alunos vinculados |
| `GET` | `/users/invite-code` | COACH | Retorna o invite_code do coach |
| `POST` | `/workouts` | COACH | Cria e envia treino para aluno |
| `GET` | `/workouts` | STUDENT | Busca treino ativo do aluno |
| `PATCH` | `/workouts/:id/complete` | STUDENT | Marca treino como concluído |

---

## Design System — Tokens

Extraídos dos HTMLs de referência:

```
Cor Primária:  #b30f15  (vermelho DryFit)
Background Dark: #0a0a0a / #0f1115
Card Dark:     #1c1f26
Fonte:         Inter (300, 400, 500, 600, 700, 800)
Border Radius: 12px / 16px / 24px
Glass Effect:  background rgba(255,255,255,0.05) + backdrop-blur
```

---

## Detalhamento das Telas

### Tela 1: Login & Cadastro

**Fluxo Login:**
- Campo Email + Senha
- Botão "Entrar" → `POST /auth/login`
- Redireciona para `/coach/dashboard` (COACH) ou `/student/dashboard` (STUDENT)

**Fluxo Cadastro (apenas STUDENT):**
- Toggle Radio "Sou Professor" / "Sou Aluno" (padrão: Professor)
- Se **Professor** selecionado: Exibir mensagem "Acesso liberado pelos administradores. Use suas credenciais recebidas por email."
- Se **Aluno** selecionado: Campos Email, Senha, Confirmar Senha + **Código do Professor** (obrigatório)
- Validação: invite_code deve existir e estar ativo → `POST /auth/register`

### Tela 2: Dashboard do Professor

**Baseado em:** `professor.html`
- Header: nome do coach + avatar
- Barra de busca de alunos
- Lista de StudentCards (nome, status, streak)
- FAB central "+" → abre `WorkoutBuilderModal`
- Bottom nav: Home | Students | Builder | Stats | Config
- **Settings (aba Config):** Exibe invite_code formatado + botão "Copiar para WhatsApp"

**WorkoutBuilderModal:**
- Multi-select de alunos
- Input título (ex: "WOD Murph")
- Toggle tipo: Strength | WOD | HIIT
- Lista dinâmica de exercícios (+ Adicionar Exercício)
  - Cada exercício: Nome + Sets + Reps + Carga (ou Rounds + Time para WOD)
- Botão "Enviar Treino" → `POST /workouts`

### Tela 3: Dashboard do Aluno

**Baseado em:** `aluno.html`
- Header: saudação + nome do aluno
- Calendário semanal (destaque no dia atual)
- Seção "Workout of the Day":
  - Card grande com foto + título + nome do coach atribuidor
  - Lista de exercícios com sets/reps
  - Botão "START WORKOUT" → expande checkboxes por exercício
- Checkbox "Marcar como Concluído" → `PATCH /workouts/:id/complete`
- Estado Vazio: Card especial com ícone + "Aguardando seu coach enviar o WOD 💪"

---

## Breakdown de Tarefas

### T01 — Setup Monorepo
- **Input:** Pasta `dryfit/` vazia (exceto `mvp/`)
- **Output:** Estrutura de workspaces com `apps/api` e `apps/mobile`
- **Verify:** `npm install` na raiz executa sem erros

### T02 — Prisma Schema + Migrations (P0)
- **Input:** Schema definido acima
- **Output:** `schema.prisma` + migration inicial + seed com 1 coach de teste
- **Verify:** `npx prisma db push` + `npx prisma studio` mostra tabelas

### T03 — Backend Fastify Setup (P1)
- **Input:** `apps/api` inicializado
- **Output:** Server rodando em porta 3333, health check `GET /health → 200`
- **Verify:** `curl http://localhost:3333/health`

### T04 — Auth Module — Login (P1)
- **Input:** T02 concluído (user seed)
- **Output:** `POST /auth/login` retorna JWT válido
- **Verify:** Login com coach seed → token decodificável com role=COACH

### T05 — Auth Module — Register Student (P1)
- **Input:** T04 concluído
- **Output:** `POST /auth/register` com invite_code válido cria user STUDENT com coachId
- **Verify:** invite_code inválido retorna 400; válido retorna 201 com token

### T06 — Workouts Module (P1)
- **Input:** T04 concluído
- **Output:** CRUD de workouts conforme endpoints
- **Verify:** Coach cria workout → GET do aluno retorna o treino

### T07 — Mobile Setup + Navegação (P2)
- **Input:** `apps/mobile` inicializado com Expo
- **Output:** Expo Router funcionando, NativeWind configurado
- **Verify:** `npx expo start` abre app sem erros

### T08 — Tela 1: Login + Cadastro (P2)
- **Input:** T07 + T04/T05 funcionando
- **Output:** Fluxo completo de auth mobile funcionando
- **Verify:** Login como coach → redireciona para dashboard coach

### T09 — Tela 2: Coach Dashboard (P2)
- **Input:** T08 concluído
- **Output:** Dashboard com lista de alunos + FAB + Modal Builder
- **Verify:** Criar treino e ver na lista do aluno

### T10 — Tela 3: Student Dashboard (P2)
- **Input:** T09 concluído
- **Output:** WOD do dia + checkbox concluído + estado vazio
- **Verify:** Marcar como concluído → status muda para COMPLETED

### T11 — Settings Coach (invite code) (P2)
- **Input:** T09 concluído
- **Output:** Aba Config com invite_code + botão copiar
- **Verify:** Botão copiar coloca código no clipboard do dispositivo

---

## Grafo de Dependências

```
T01
 └── T02
      └── T03
           ├── T04
           │    ├── T05
           │    └── T06
           │         └── T07
           │              ├── T08
           │              │    ├── T09
           │              │    │    ├── T10
           │              │    │    └── T11
```

---

## Phase X — Verificação Final

### Checklist Técnico
- [ ] `npm run lint` em `api/` e `mobile/` sem erros
- [ ] `npx tsc --noEmit` em ambos sem erros
- [ ] `npx prisma validate` sem erros
- [ ] `npx expo export` sem warnings críticos

### Testes Manuais de Fluxo
1. **Fluxo Professor:**
   - Logar com credenciais pré-cadastradas
   - Acessar Config → Ver invite_code → Copiar
   - Criar treino para aluno → Confirmar criação

2. **Fluxo Aluno:**
   - Cadastrar com invite_code do professor
   - Ver WOD do dia atribuído
   - Marcar treino como concluído

3. **Casos de Erro:**
   - Login com senha errada → mensagem de erro
   - Cadastro com invite_code inexistente → bloqueio com feedback claro
   - Aluno tenta acessar rota de coach → 403

### Scripts de Verificação
```bash
# Security (rodar da raiz)
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# UX Audit (com servidor rodando)
python .agent/skills/frontend-design/scripts/ux_audit.py .

# Mobile audit
python .agent/skills/mobile-design/scripts/mobile_audit.py .
```

---

## Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|--------------|-----------|
| NativeWind v4 incompatível com Expo SDK | Média | Usar Expo SDK 51 + NativeWind 4.0.1 testado |
| PostgreSQL local não disponível | Baixa | Usar Supabase free tier como fallback |
| Coach usa invite_code de outro coach | N/A | invite_code único por usuário, validado no register |
| Token expirado em uso offline | Baixa | Refresh token silencioso + redirect para login |

---

*Plano criado em: 2026-02-18 | Versão: 1.0*
