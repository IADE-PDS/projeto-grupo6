# MongoDB 
Como funciona?
MongoDB não funciona da forma tradicional como estamos habituados, em vez de utilizar tabelas e colunas, este utiliza coleções e documentos. Uma coleção consiste num conjunto de documentos, o que é equivalente às tabelas numa base de dados relacional. Um documento consiste em vários “valor-chave”, que é a unidade básica dos dados em MongoDB.

# Porquê?
Neste projeto vamos utilizar a MongoDB pois está a tornar-se numa tendência no mercado hoje em dia. Havendo muitas empresas a converterem a base de dados para MongoDB, e também está cada vez mais comum fazerem-se jogos com essa base de dados como, “Faceit”, “SEGA”, “Pony Town”,”Pet Simulator” (Roblox).

# Base de Dados MiniGamerino
A nossa base de dados é constituída por 4 coleções
### Player
A coleção player vai conter o username, email, password e tokens. 
Também irá conter dois arrays, um que será um array de objetos, sendo cada objeto relacionado à um mini-jogo com a estatísticas relacionadas com o player, e outro array que irá conter os itens do inventário do jogador.
### Match
Na coleção Match, vai conter os jogadores já dentro do jogo, os mini-jogos já jogados, com a respetiva informação de cada um, e um array que será os logs(a informação específica ainda não se sabe) da partida.
 
### Unity Server	
O Unity Server irá conter a porta do servidor e um ID do slave que o criou. Sobre a informação do jogo em si irá conter basicamente as definições todas que o utilizador escolher meter no servidor, como por exemplo, o número de jogadores limite, os jogos permitidos, etc. Quando um servidor é criado pelo servidor matchmaking, as definição são predefinidas, a coleção terá um parâmetro a indicar se é “oficial” ou não.
Esta tabela também terá o ID da Match associada.
### Slaves
Isto será uma coleção apenas para guardar uma lista dos slaves disponíveis para criação dos unity servers. Para o nosso projeto, os slaves serão máquinas virtuais que contém uma app node.js para gerir os servidores e um docker, com uma versão do jogo para se poder criar o servidor.
