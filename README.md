<h1 align="center">
  <br>
  🏋️ DryFit
  <br>
</h1>

<p align="center">
  <strong>Plataforma de acompanhamento de treinos entre coaches e alunos</strong>
</p>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Fastify" src="https://img.shields.io/badge/Fastify-4.x-000000?style=flat-square&logo=fastify&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-5.x-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo&logoColor=white" />
  <img alt="React Native" src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
</p>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tech Stack](#-tech-stack)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Rodando o Projeto](#-rodando-o-projeto)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [API Reference](#-api-reference)
- [Banco de Dados](#-banco-de-dados)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

**DryFit** é uma plataforma mobile que conecta **coaches** e **alunos** para o gerenciamento inteligente de treinos. Coaches criam e agendam treinos personalizados para seus alunos, que acompanham o progresso em tempo real diretamente pelo aplicativo.

O projeto é um **monorepo** composto por:
- `apps/api` — API REST construída com Fastify + Prisma + PostgreSQL
- `apps/mobile` — Aplicativo móvel em Expo (React Native) para iOS e Android
- `packages/types` — Tipos TypeScript compartilhados entre API e mobile

---

## ✨ Funcionalidades

### 👨‍💼 Coach
- Cadastro e login com autenticação JWT
- Gerenciamento de alunos via código de convite único
- Criação de treinos (Strength, WOD, HIIT, Custom) com exercícios detalhados
- Agendamento de treinos por data
- Visualização do progresso e histórico dos alunos

### 🏃 Aluno
- Cadastro com código de convite do coach
- Calendário semanal de treinos
- Visualização detalhada de cada treino e exercício (séries, reps, carga, duração)
- Marcação de treinos como concluídos
- Perfil com foto personalizada

---

## 🏗️ Arquitetura

```
dryfit/                          ← Monorepo raiz (npm workspaces)
├── apps/
│   ├── api/                     ← Servidor Fastify (REST API)
│   │   ├── prisma/              ← Schema e seeds do PostgreSQL
│   │   └── src/
│   │       ├── modules/         ← Auth, Users, Workouts (feature-based)
│   │       ├── plugins/         ← Plugins Fastify (Prisma, JWT, CORS)
│   │       └── app.ts           ← Entry point da API
│   └── mobile/                  ← App Expo / React Native
│       ├── app/                 ← Rotas via expo-router (file-based)
│       ├── hooks/               ← Custom hooks (queries, mutations)
│       ├── lib/                 ← API client e utilitários
│       └── store/               ← Estado global com Zustand
└── packages/
    └── types/                   ← DTOs e tipos compartilhados
```

---

## 🛠️ Tech Stack

### API (`apps/api`)
| Tecnologia | Versão | Descrição |
|---|---|---|
| [Node.js](https://nodejs.org) | 20+ | Runtime JavaScript |
| [TypeScript](https://typescriptlang.org) | 5.4 | Tipagem estática |
| [Fastify](https://fastify.dev) | 4.x | Framework HTTP performático |
| [Prisma](https://prisma.io) | 5.x | ORM para TypeScript |
| [PostgreSQL](https://postgresql.org) | 14+ | Banco de dados relacional |
| [JWT](https://jwt.io) | — | Autenticação stateless via `@fastify/jwt` |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 2.x | Hash de senhas |
| [tsx](https://github.com/privatenumber/tsx) | 4.x | Execução de TypeScript em desenvolvimento |

### Mobile (`apps/mobile`)
| Tecnologia | Versão | Descrição |
|---|---|---|
| [Expo](https://expo.dev) | 54 | Plataforma React Native gerenciada |
| [React Native](https://reactnative.dev) | 0.81 | Framework mobile cross-platform |
| [Expo Router](https://expo.github.io/router) | 6.x | Navegação file-based |
| [NativeWind](https://nativewind.dev) | 4.x | Tailwind CSS para React Native |
| [TanStack Query](https://tanstack.com/query) | 5.x | Gerenciamento de estado assíncrono / cache |
| [Zustand](https://zustand-demo.pmnd.rs) | 4.x | Estado global leve |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated) | 4.x | Animações performáticas |
| [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore) | — | Armazenamento seguro do token JWT |

---

## 📦 Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org) `>= 20`
- [npm](https://npmjs.com) `>= 10` (vem com Node.js)
- [PostgreSQL](https://postgresql.org) `>= 14` rodando localmente ou em nuvem
- [Expo Go](https://expo.dev/client) no celular **ou** um emulador Android/iOS configurado

---

## 🚀 Instalação

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/dryfit.git
cd dryfit
```

2. **Instale todas as dependências** (instala API, mobile e packages de uma vez):

```bash
npm install
```

> O `postinstall` do workspace `api` executa `prisma generate` automaticamente.

---

## ⚙️ Configuração

### Variáveis de ambiente da API

```bash
cp apps/api/.env.example apps/api/.env
```

Edite `apps/api/.env` com suas credenciais:

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/dryfit?schema=public"

# Chave secreta para assinatura dos tokens JWT
JWT_SECRET="sua-chave-secreta-muito-forte"

# Porta da API (padrão: 3333)
PORT=3333
```

### Banco de dados

```bash
# Aplicar o schema ao banco de dados
npm run db:push --workspace=apps/api

# (Opcional) Popular o banco com dados de exemplo
npm run db:seed --workspace=apps/api
```

### IP da API no mobile

No arquivo `apps/mobile/lib/api.ts` (ou equivalente), atualize a `baseURL` com o IP da sua máquina na rede local para testar no dispositivo físico:

```ts
const api = axios.create({
  baseURL: 'http://SEU_IP_LOCAL:3333',
});
```

---

## ▶️ Rodando o Projeto

### Desenvolvimento (modo completo)

Abra **dois terminais** na raiz do projeto:

**Terminal 1 — API:**
```bash
npm run dev:api
```
A API estará disponível em `http://localhost:3333`

**Terminal 2 — Mobile:**
```bash
npm run dev:mobile
```
Escaneie o QR Code com o app **Expo Go** ou pressione `a` para Android / `i` para iOS.

### Scripts disponíveis (raiz)

| Comando | Descrição |
|---|---|
| `npm run dev:api` | Inicia a API em modo watch com `tsx` |
| `npm run dev:mobile` | Inicia o Expo dev server |
| `npm run build:api` | Compila a API para produção (`dist/`) |
| `npm run lint` | Executa ESLint em todos os workspaces |
| `npm run typecheck` | Checagem de tipos TypeScript em todos os workspaces |

### Scripts adicionais da API

| Comando | Descrição |
|---|---|
| `npm run db:push --workspace=apps/api` | Sincroniza o schema Prisma com o banco |
| `npm run db:seed --workspace=apps/api` | Popula o banco com dados de seed |
| `npm run db:studio --workspace=apps/api` | Abre o Prisma Studio no browser |

---

## 📁 Estrutura de Pastas

```
dryfit/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma       ← Modelos do banco de dados
│   │   │   └── seed.ts             ← Script de seed
│   │   ├── src/
│   │   │   ├── middleware/         ← Middlewares (auth guard)
│   │   │   ├── modules/
│   │   │   │   ├── auth/           ← Login, registro, convite
│   │   │   │   ├── users/          ← Perfil, alunos do coach
│   │   │   │   └── workouts/       ← CRUD de treinos e exercícios
│   │   │   ├── plugins/            ← Prisma, JWT, CORS como plugins Fastify
│   │   │   └── app.ts              ← Bootstrap da aplicação
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── mobile/
│       ├── app/
│       │   ├── (auth)/             ← Telas de login e registro
│       │   ├── (coach)/            ← Telas do coach (alunos, treinos)
│       │   └── (student)/          ← Telas do aluno (calendário, treinos)
│       ├── assets/                 ← Ícones, fontes e imagens
│       ├── hooks/                  ← Custom React hooks
│       ├── lib/                    ← Cliente HTTP e helpers
│       ├── store/                  ← Auth store (Zustand)
│       ├── app.json                ← Configuração Expo
│       ├── babel.config.js
│       ├── global.css              ← Diretivas Tailwind (NativeWind)
│       ├── metro.config.js
│       ├── tailwind.config.js
│       └── tsconfig.json
└── packages/
    └── types/
        └── src/                    ← Interfaces e DTOs TypeScript compartilhados
```

---

## 📡 API Reference

A API segue o padrão **REST** com autenticação Bearer (JWT).

Base URL: `http://localhost:3333`

### Auth
| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Registrar novo usuário |
| `POST` | `/auth/login` | ❌ | Login e obtenção do token |

### Usuários
| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/me` | ✅ | Retorna o perfil do usuário autenticado |
| `PATCH` | `/me` | ✅ | Atualiza o perfil |
| `GET` | `/coach/students` | ✅ Coach | Lista alunos do coach |
| `POST` | `/coach/invite` | ✅ Coach | Gera código de convite |

### Treinos
| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/workouts` | ✅ | Lista treinos (coach vê os que criou, aluno vê os seus) |
| `POST` | `/workouts` | ✅ Coach | Cria novo treino |
| `GET` | `/workouts/:id` | ✅ | Detalhes de um treino |
| `PATCH` | `/workouts/:id` | ✅ | Atualiza treino |
| `DELETE` | `/workouts/:id` | ✅ Coach | Remove treino |
| `PATCH` | `/workouts/:id/complete` | ✅ Student | Marca treino como concluído |

---

## 🗄️ Banco de Dados

O diagrama simplificado do schema Prisma:

```
User
 ├── role: COACH | STUDENT
 ├── inviteCode (único, gerado para coaches)
 ├── coach → User (self-relation)
 ├── students → User[]
 ├── coachWorkouts → Workout[]
 └── studentWorkouts → Workout[]

Workout
 ├── type: STRENGTH | WOD | HIIT | CUSTOM
 ├── status: PENDING | COMPLETED
 ├── scheduledAt: DateTime
 ├── coach → User
 ├── student → User
 └── exercises → Exercise[]

Exercise
 ├── name, sets, reps, weight, duration, rounds
 └── workout → Workout
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

1. Fork o projeto
2. Crie uma branch para sua feature: `git checkout -b feat/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um **Pull Request**

> Por favor, siga o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/) nas mensagens de commit.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para mais informações.

---

<p align="center">
  Feito com ❤️ para quem leva o treino a sério.
</p>
