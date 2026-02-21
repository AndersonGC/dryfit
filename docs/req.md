# Problemas encontrados:
- Não está sendo possível marcar o treino como concluído
- Ainda não estão aparecendo os treinos de dias futuros. Ex.: Se eu seleciono na versão Coach que o treino para o aluno é na data 23/02/2026. Quando eu retorno ao app do Aluno, não aparece o treino nessa data

# Features a serem implementadas:
- Adicionar uma logica similar ao calendário do Aluno, porém para o coach, vai funcionar da seguinte maneira:
	- Cenário 1:
			Dado que eu, Coach, estou na data 21/02/2026  e seleciono a data  21/02/2026
			Irá ser exibido uma lista, na seguinte ordem: Os alunos que eu já cadastrei o treino na data ficarão por ultimo, e os que faltam cadastrar ficaram em cima, a partir do momento que eu continuo cadastrando esses alunos a lista vai mudando
	- Cenário 2:
			Dado que eu, Coach, estou na data 21/02/2026  e seleciono a data  23/02/2026
			Irá ser exibido uma lista, na seguinte ordem: Os alunos que eu já cadastrei o treino na data ficarão por ultimo, e os que faltam cadastrar ficaram em cima, a partir do momento que eu continuo cadastrando esses alunos a lista vai mudando
- Implemente algum tipo de "sinalizador" para que fique claro para o usuário que ele já cadastrou o treino para aquele aluno, utilize o agente frontend-specialist para essa tarefa
- Retirar a string "Ou acesse com" e descer o layout da tela inicial levente pra baixo. A ideia é que fique somente: O ícone, a string dryfit, a frase, as labels de login e senha, o botão de login, a opção de criar conta, e a parte informando caso seja o professor.
- Tornar os números do calendário levemente menor, estão bem grandes, retire o escrito "calendário" para ganhar mais espaço na tela, também de um leve espaçamento entre os botões dos dias
- Padronizar o footer
- O design atual do aplicativo está bonito, mas por padrão deverá ser vermelho (b30f15) e branco (utilize um branco que não ofusque tanto, algo mais puxado para o creme), faça uma refatoração SEM ALTERAR NENHUMA REGRA DE NEGOCIO para essas cores. E utilize a cor que está atualmente para ser o tema black do aplicativo, você deve adicionar a opção de alterar o tema de escuro para claro na tela de configuração,  utilize o agente frontend-specialist para essa tarefa
- O inviteCode gerado pelos coachs não deve ser único, porque permitiria que o usuário que recebesse o invite, compartilhasse o codigo. Então a regra deve ser: O invite code deverá permitir que seja cadastrado apenas uma conta, quando ela for cadastrado, aquele invite code deverá ficar invalidado
- Deverá ter um botão para gerar invites aleatórios, para aumentar a segurança e impedir a pirataria.