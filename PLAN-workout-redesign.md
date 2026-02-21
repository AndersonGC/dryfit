# Plano de Desenvolvimento: Redesign da Criação e Visualização de Treinos

## Overview
Redesenhar as telas de criação de treinos (coach) e visualização de treinos (aluno) do aplicativo Dryfit. O objetivo é remover a lista estruturada de exercícios na criação (nome, sets, reps) e substitui-la por um campo de descrição livre (card) que suporte a inserção nativa de vídeos do YouTube via iframe. A visualização do aluno deve ser adaptada para exibir esse novo formato.

## Project Type
**MOBILE / BACKEND** (O projeto envolve o app mobile e o backend da API, mas o agente primário para o app mobile em React Native/Expo deve ser o `mobile-developer` juntamente com o `backend-specialist` para a API).

## Success Criteria
- [ ] O componente de criação de treino na dashboard do Coach possui um campo de texto livre.
- [ ] O professor pode quebrar linhas (Enter) e salvar clicando fora ou no botão OK/Salvar.
- [ ] Adição nativa de vídeos do YouTube no card do treino através do pacote `react-native-youtube-iframe`.
- [ ] O backend e o schema do banco de dados suportam a descrição livre do treino em vez de dezenas de `Exercise` (ou os utilizam de uma maneira adaptada).
- [ ] A tela do aluno renderiza o texto descritivo e, se houver link, o vídeo do YouTube formatado nativamente.
- [ ] Nenhuma regra de negócio existente quebrada (ex: marcar como concluído persiste funcionando).
- [ ] Nenhuma inconsistência visual (respeitar as cores, sombras e formato de card existentes).

## Tech Stack
- **Frontend/Mobile**: React Native (Expo), NativeWind (TailwindCSS v4), `react-native-youtube-iframe`.
- **Backend/API**: Fastify, Prisma (PostgreSQL).
- **Tipagem Compartilhada**: `@dryfit/types`

## File Structure
Mudanças estarão primariamente nos seguintes arquivos:
- `apps/mobile/app/(coach)/dashboard.tsx`
- `apps/mobile/app/(student)/dashboard.tsx`
- `packages/types/src/index.ts`
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/workouts/workouts.service.ts`
- `apps/api/src/modules/workouts/workouts.routes.ts`

## Task Breakdown

### 1. Atualizar o Schema do Banco de Dados e Types
- **Agent**: `backend-specialist`
- **Skills**: `database-design`
- **Por quê**: O conceito de treino não é mais uma lista de múltiplos exercícios (sets, reps), mas um bloco único de texto e um link de vídeo opcional. É necessário adaptar o `model Workout` e ajustar/eliminar o `model Exercise`.
- **INPUT**: `apps/api/prisma/schema.prisma`, `packages/types/src/index.ts`
- **OUTPUT**: Um schema Prisma atualizado com suporte a `description` e `youtubeVideoId` (ou extraível da description). Os types em `@dryfit/types` refletem essa mudança.
- **VERIFY**: `npx prisma format` passa sem erros; schema reflete `description` em vez de exercícios avulsos.

### 2. Atualizar Serviços e Rotas da API
- **Agent**: `backend-specialist`
- **Skills**: `api-patterns`
- **Por quê**: O backend deve aceitar a criação baseada em "title", "description", etc., parando de exigir o array de `exercises`.
- **INPUT**: `workouts.service.ts`, `workouts.routes.ts`
- **OUTPUT**: Endpoints `POST /workouts` recebem a nova estrutura. O método `createWorkout` e as listagens refletem essa estrutura.
- **VERIFY**: API builda localmente (`npm run build` na pasta API).

### 3. Migrar Dados Existentes do Banco (Se Necessário)
- **Agent**: `backend-specialist`
- **Skills**: `database-design`
- **Por quê**: Precisamos de uma migration / prisma migrate dev para atualizar as tabelas do PostgreSQL e garantir que o app não quebre para treinos passados. 
- **INPUT**: Terminal interativo, schema Prisma.
- **OUTPUT**: Script de seed e/ou `npx prisma migrate dev --name simplify-workouts`.
- **VERIFY**: Comando de migration roda com sucesso sem perda crítica inesperada de dados (pode agrupar exercícios antigos em texto, se julgado necessário, ou deletar o model).

### 4. Implementar Youtube Iframe e Componentes de UI
- **Agent**: `mobile-developer`
- **Skills**: `mobile-design`, `app-builder`
- **Por quê**: Exibir o vídeo formatado dentro da descrição do treino tanto para o Coach quanto para o Aluno. Requer a instalação da biblioteca `react-native-youtube-iframe` (e `react-native-webview`).
- **INPUT**: `package.json` do mobile, criação de possível componente `<WorkoutCard>`.
- **OUTPUT**: Pacotes instalados no workspace do expo.
- **VERIFY**: `npm install` roda com sucesso. App continua rodando sem erros de bundler.

### 5. Redesenhar Tela de Criação de Treino (Coach)
- **Agent**: `mobile-developer`
- **Skills**: `mobile-design`
- **Por quê**: O formulário do modal builder precisa perder os campos de exercícios individuais. Em seu lugar, entra um `TextInput` `multiline=true` englobando texto e a mecânica de "adicionar link do YouTube". 
- **INPUT**: `apps/mobile/app/(coach)/dashboard.tsx`
- **OUTPUT**: UI usando apenas título, data, tipo, texto descritivo longo e campo/vídeo de YouTube integrado. Botão salvar atualiza payload para a API.
- **VERIFY**: Estilos de tema (darkmode, borders, NativeWind) aderentes ao padrão existente. O envio funciona visualmente sem errro de prop.

### 6. Redesenhar Tela de Treino do Aluno (Student)
- **Agent**: `mobile-developer`
- **Skills**: `mobile-design`
- **Por quê**: A UI do aluno antes listava repetições por exercício. Agora precisa exibir um markdown-like ou texto com quebra de linhas e renderizar o componente `<YoutubeIframe>` se houver um ID salvo.
- **INPUT**: `apps/mobile/app/(student)/dashboard.tsx`
- **OUTPUT**: O player de vídeo nativo aparece acima ou abaixo do bloco de texto descritivo e se ajusta ao tamanho original.
- **VERIFY**: A rolagem do dashboard do aluno continua funcionando (sem overflow ou vídeo sumindo), renderização da tela fluida.

## ✅ PHASE X COMPLETE
(Para ser preenchido durante a verificação final após a codificação)
- Lint: [ ] Pendente
- Security: [ ] Pendente
- Build: [ ] Pendente
- E2E/Manual: [ ] Pendente
- Date: Pendente
