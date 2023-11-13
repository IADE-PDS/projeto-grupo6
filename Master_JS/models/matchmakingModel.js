const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const match = require("./matchModel");
const client = db.getdatabase();
const saltRounds = 10; 


//every servers here will be official, and will have no admin player or custom settings
/*
match:
{
    duration: 0
    player: [],
    games[],
    log:[]
}
unity:
{
    match_id:

    max_players: 4
    games_pool[]
    private_server: false
    game_name: official


    official: true
    port:
    slave:
    status:waiting
}
*/
class Marchmaking {
    constructor() {

    }
    static async SearchServer() {
        try {
            //! PARA FAZER QUANDO TIVER LOGIN È ADICIONAR O PLAYER À WHITELIST
            var server;
            let collection = client.collection("match")
            let results = await collection.find({
                "settings.isOfficial": true,
                "settings.status": "waiting"
            }).toArray();
            if(results.length){
                for (let result of results){
                    //find first one that isnt on staring
                    if(result.players.length < result.settings.max_players){
                        server = result;
                        break;
                    }
                }
            }
            if(!server || true){
                server = {};
                let settings= {
                max_players: 4,
                games_pool: [],
                isPrivate: false,
                game_name: "Official",
                isOfficial: true,
                };
                server.settings = settings;
                let result = await match.CreateUnityServer(settings);
                if(result.status != 200)
                    return {status: 404, result: {msg:"Matchmaking not available at the moment"}}
                server.settings.ip = result.result.ip
                server.settings.port = result.result.port

            }
            let result_server = {ip:server.settings.ip, port:server.settings.port}
            return {status: 200, result: {server:result_server}}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }
    }

}

module.exports = Marchmaking;