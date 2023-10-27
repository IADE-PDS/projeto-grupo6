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
    static async SearchServer() {
        try {

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
    static async ConnectServer(user) {
        try {

        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }

}

module.exports = Marchmaking;