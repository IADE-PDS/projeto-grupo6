const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
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
    static async SearchServer(user) {
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
                server = this.CreateServer();
            }
            return server
            this.ConnectServer(user,server);//trocar por só responder mas isso fica para dps 
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }
    }


    static async CreateServer() {
        try {

        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async ConnectServer(user,server) {
        try {

        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }

}

module.exports = Marchmaking;