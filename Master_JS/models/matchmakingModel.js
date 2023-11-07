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
            var server;
            let results = await client.collection("match")
                .find({"settings.isOfficial": true,
                       "settings.status": "waiting"})
                .toArray();
            if(results.length){
                for (let result of results){
                    if(unity_server.players.length < unity_server.settings.max_players){
                        server = result;
                        break;
                    }
                }
            }
            if(!server){
                let settings= {
                max_players: 4,
                games_pool: [],
                isPrivate: false,
                game_name: "Official",
                isOfficial: true,
                };
                server = await match.CreateUnityServer(settings);
                //if(server.status != 200)
                  //  return {status: 404, result: {msg:"Matchmaking not available at the moment"}}
            }
            let result_server = {ip:server.ip, port:server.port}
            return {status: 200, result: {server:result_server}}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }
    }

}

module.exports = Marchmaking;