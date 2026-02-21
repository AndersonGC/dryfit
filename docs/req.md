# Features a serem implementadas:

- Vamos redesenhar a tela de criação de treino e de treino do aluno. Começando pela tela de criação de treino, utilize o agente frontend-specialist para essa tarefa:
	- iremos manter o header
	- iremos manter o nome do treino
	- iremos manter a data
	- Onde estão as tags "Força" "Wod" e etc. Iremos substituir para "WOD", "EMOM", "AMRAP", "FOR TIME"
	- Iremos retirar totalmente o campo de nome do exercicio, botão de add exercicio. Ali terá um card para colocar a descrição do treino que deverá funcionar da seguinte maneira:
		- Professor vai clicar em editar, similar como é hoje no campo de "nome do exercio". Com isso ele poderá escrever livremente o treino que deseja, quando ele der enter no teclado dele, ira quebra a linha, mas não irá finalizar o card, ele só irá finalizar o card quando clicar em "OK" no teclado ou clicar fora do card.
		- Dentro desse card, uma nova funcionalidade será implementada, onde o professor poderá adicionar links de vídeos do youtube, e o vídeo deverá aparecer de forma nativa dentro do card, utiliznado a react-native-youtube-iframe

- Na sessão de treino do aluno, faça todos os ajustes necessários para que possa receber essa atualização.
- Atualize também o banco de dados caso seja necessários, removendo colunas que não serão mais utilizadas ou adicionando caso seja necessário

- Cuidado para não quebrar nenhuma regra de negocio que ja exista e mantenha a consistência visual do aplicativo.