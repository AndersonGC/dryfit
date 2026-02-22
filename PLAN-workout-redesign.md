# 🛠️ PLAN: Workout Redesign (Aluno & Professor)

**Goal:** Remodelar a tela de alunos do app do professor e adicionar fluxo de observação na conclusão do treino do aluno, seguindo o design fornecido.

## ✅ Decisões e Escopo Validado
- **Modelagem de Dados:** O campo `observation` (ou `studentFeedback`) será adicionado na tabela apropriada de conclusão de treino (provavelmente `WorkoutSession` ou `WorkoutHistory`).
- **Comportamento do Alerta:** O ícone persistirá enquanto houver um feedback não lido (ou simplesmente existirá para registrar o feedback daquele envio em específico). Ao clicar no card com o ícone, o app exibirá um **Modal Personalizado** flutuante estilo *Tooltip* escuro, conforme design de referência ("Student Feedback").
- **Navegação (Aluno):** Não será criada uma tela cheia para a observação. Podemos usar um Modal simples com um campo de texto no momento de "Concluir Treino".

## 📱 Project Type
**MOBILE** (React Native/Expo) & **BACKEND** (Node.js API)

## ✅ Success Criteria
- [ ] Cards de alunos no app do professor exibem 4 estados baseados no status do treino.
- [ ] "Aguardando treino" (texto cinza).
- [ ] "Treino enviado" (Check Verde).
- [ ] "Treino concluído" (Check Verde, texto indicativo verde).
- [ ] "Treino concluído" com observação (Warning Amarelo, texto verde).
- [ ] O botão "build" foi removido; clicar em qualquer parte do card agora redireciona para a tela do treino do aluno.
- [ ] No app do aluno, o fluxo de conclusão exibe a nova tela de comentários.
- [ ] Envio vazio não gera alerta pro professor; envio com texto gera o ícone de exclamação.
- [ ] Componentização de código duplicado para garantir código limpo e reutilizável (`StudentCard`).

## 🏗️ File Structure (Expected changes)
- `apps/mobile/src/components/StudentCard/...` (Criação/Refatoração do card reutilizável)
- `apps/mobile/src/screens/Teacher/StudentsScreen/...` (Uso do novo card, remoção do botão antigo, ajuste de navegação)
- `apps/mobile/src/screens/Student/WorkoutScreen/...` (Ajustes para abrir fluxo de conclusão)
- `apps/mobile/src/screens/Student/WorkoutObservationScreen/...` (Sugerida nova tela/modal)
- `apps/api/...` (Possíveis ajustes em Controllers/Schemas para incluir `observation` no payload de listagem)

## 📋 Task Breakdown

| ID | Task | Agent | Skills | State |
|----|------|-------|--------|-------|
| 1 | [Backend] Verificar/Criar campo de `observation` na tabela de Workout Session e interligar na listagem de alunos para o professor | `backend-specialist` | `database-design`, `api-patterns` | [ ] |
| 2 | [Mobile] Criar componente base `StudentCard` reutilizável, tipando as "variants" para cobrir os 4 estados visuais requeridos | `mobile-developer` | `mobile-design`, `clean-code` | [ ] |
| 3 | [Mobile] Atualizar a "Tela de alunos" do prof para consumir a API (status, conclusão, obs) renderizando o `StudentCard`. Remover botão 'build'. | `mobile-developer` | `clean-code` | [ ] |
| 4 | [Mobile] Implementar a tela de "Observações" ou modal no app do Aluno. Ao clicar em terminar, abrir modal de texto e enviar payload final ao backend. | `mobile-developer` | `mobile-design` | [ ] |

## 🧪 Phase X Verification
- [ ] Executar script de testes da API para endpoints afetados
- [ ] Linting final para remover código obsoleto no front
- [ ] Mobile UX Audit (tamanho de toques no card, contraste)
