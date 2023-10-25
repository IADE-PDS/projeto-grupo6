class Match{
/*

stickfight:
    colunas globais:
        items_picked

    estatistica do player:
        deaths:
        kills: 
        Id do player

    estatistica da partida: [10 partidas] 
        kills_log[player_1, player_2, arma,time_stamp]
        Points[player, points]
        Played_matches_id

quiz:
    estatistica do player:
        id
        respostas_certas:
        respostas_dadas:
    
    estatistica da partida:
        perguntas:[respostas[],resposta_certa, players_acertaram]
        points[player, points]
        Played_matches_id

russian roulette:
    estatistica do player:
        id
        matou_alguem
        morreu
        suicidou-se
    
    estatistica da partida:
    Points[player, points]

labirinto:
    estatistica do player:
        tempo
    
    estatistica da partida:
        Points[player, points]
        tempo

atiro ao alvo:
    estatistica do player:
    
    estatistica da partida:
        Points[player, points]

adivinha o traço:
    estatistica do player:
        adivinhou_desenho
        nmr_de_jogadores_que_adivinharam_desenho_do_jogador

    estatistica da partida:
        Points[player, points]
        objetos_a_desenhar

corda:
    estatistica do player:
    
    estatistica da partida:
        Points[player, points]

corrida/estafeta:
    estatistica do player:
        saltos
        passou_a_estafeta_sucesso

    estatistica da partida:
        Points[player, points]
        tempos

prop_hunt:
    estatistica do player:
    
    estatistica da partida:
        Points[player, points]
    

tecla aleatoria:        
    estatistica da partida:
        Points[player, points]
        teclas


user{

    inventory:[]
    stats:{
        game:[
            stickfight:{
                wins:
                played:

            },russian_roulette{
                wins:
                played:

            },prop_hunt{
                wins:
                played:

            },maze{
                wins:
                played:

            },lightning_round{
                wins:
                played:
                fastest_click:

            },rope{
                wins:
                played:

            },shooting{
                wins:
                played:

            },race{
                wins:
                played:

            },quiz{
                wins:
                played:

            },gartic{
                wins:
                played:

            }
            
        ]}
}
qd inicia:
{   

}




match = {
    server_unity_id:
    player: [
        id_player: 0
    ],
    jogos[],
    log:[]
}

qd acaba uma partida:
match = {
    server_unity_id:
    duration:12
    player: [
        id_player: 0
    ],
    jogos[
        stickfight:{
            duration:10
            items_picked
            kills_log[id_player, id_player1, arma,time_stamp]
            Points[player, points]
        }
    ],
    log:[]
}
qd acabao jogo:
jogo = {
    duration: 20 min
    player: [
        id_player: 23,
        id_player1: 10,
    ],
    jogos[
        stickfight:{
            duration:
            items_picked
            kills_log[id_player, id_player1, arma,time_stamp]
            Points[player, points]
        },
        quiz:{

        }, mais jogos
    ],
    log:[
        acontecimente, timestamp
    ]

}

*/
};
module.exports = Match;


//? dividimos cada jogo para o seu model especifico e chamamos aqui só funções dos models para formatar a informação

/*
prop_hunt_player(vai ter a estatistica toda do player no jogo prophunt, nunca é apagado)
prop_hunt_match()

played_Matches:
    Jogos[]
    Players[player, points]


stickfight:
    colunas globais:
        items_picked

    estatistica do player:
        deaths:
        kills: 
        Id do player

    estatistica da partida: [10 partidas] 
        kills_log[player_1, player_2, arma,time_stamp]
        Points[player, points]
        Played_matches_id

quiz:
    estatistica do player:
        id
        respostas_certas:
        respostas_dadas:
    
    estatistica da partida:
        perguntas:[respostas[],resposta_certa, players_acertaram]
        points[player, points]
        Played_matches_id

russian roulette:
    estatistica do player:
        id
        matou_alguem
        morreu
        suicidou-se
    
    estatistica da partida:
    Points[player, points]

labirinto:
    estatistica do player:
        tempo
    
    estatistica da partida:
        Points[player, points]
        tempo

atiro ao alvo:
    estatistica do player:
    
    estatistica da partida:
        Points[player, points]

adivinha o traço:
    estatistica do player:
        adivinhou_desenho
        nmr_de_jogadores_que_adivinharam_desenho_do_jogador

    estatistica da partida:
        Points[player, points]
        objetos_a_desenhar

corda:
    estatistica do player:
    
    estatistica da partida:
        Points[player, points]

corrida/estafeta:
    estatistica do player:
        saltos
        passou_a_estafeta_sucesso

    estatistica da partida:
        Points[player, points]
        tempos

prop_hunt:
    estatistica do player:
    
    estatistica da partida:
        Points[player, points]
    

tecla aleatoria:
    estatistica do player:
        click_mais_rapido
    
    estatistica da partida:
        Points[player, points]
        teclas

*/