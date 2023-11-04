const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();
const Slave = require("./slaveModel");


function dbMatchtoMatch(dbr)  {
    return new Match(dbr.server_unity_id, dbr.players, dbr.games, dbr.log, dbr.settings.max_players,
        dbr.settings.games_pool ,dbr.settings.isPrivate, dbr.settings.game_name, dbr.settings.isOfficial, dbr.settings.port,
        dbr.settings.slave_id, dbr.settings.status);
}

class Match{
    constructor( players, games, log, max_players, games_pool,
        isPrivate, game_name,isOfficial, port, slave_id, status){
        this.players = players;
        this.games = games;
        this.log = log;
        this.settings= {
            max_players: max_players,
            games_pool: games_pool,
            isPrivate: isPrivate,
            game_name: game_name,
            isOfficial: isOfficial,
            port: port,
            slave:slave_id,
            status: status,
        };
    };

    static async GetAllMatches() {
        try {
            let matches= [];
            let results= await client.collection("unity")
                .find({"settings.isPrivate": false,
                       "settings.isOfficial": false,
                       "settings.status": "waiting"})
                .toArray();
            console.log(results);   
            //only send the name, and the numbers of players, and maxplayer
            for (let result of results) {
                let match = {};
                match.name = result.settings.game_name;
                match.n_players = result.players.length;
                match.max = result.settings.max_players;
                match.pin = result.settings.pin;
                matches.push(match);
            }
            console.log("result");
            console.log(matches);
            
            return { status: 200, result: matches}
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }  
    }
    static async CreateUnityServerPublic(settings) {
        try {
            let db = client.collection("match")
            //! Verify if every settings exist and ar set correctly
            //if no name then cant create
            let result = Slave.CreateServer(settings);
            //if server created successfully
            // add to settings, the port and additional information ex:
            settings.status = "waiting";

            //insert into database
            let insert_match = {};
            insert_match.players = [];
            insert_match.games = [];
            insert_match.log = [];
            insert_match.settings = settings;
            let dbResult = await db.insertOne(insert_match);
            //return status 200 and the ip with the port from the server
            //the unity app recieves the status 200 and enters on the server with the ip and port
            return {status: 200, result: {
                msg:"unity server created sucessfully",
                ip:settings.ip+":"+settings.port
            }}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async JoinCommunityLobby(code) {
        try {
            db = client.collection("match")
            let dbResult = await db.find({ "unity_server.settings.pin": code}).toArray();
            if(!dbResult.length){
                return {status: 400, result: {
                    msg:"server not found"
                }}
            };
            let unity_server =dbMatchtoMatch(dbResult)

            //full lobby verification
            if(unity_server.players.length >= unity_server.settings.max_players){
                return {status: 400, result: {
                    msg:"Server full please try again at a later date"
                }} 
            }

            //official lobby verification
            if(unity_server.settings.isOfficial == true){
                return {status: 400, result: {
                    msg:"this server cannot be accessed manually"
                }}  
            }
            let full_ip= unity_server.setitngs.ip + unity_server.settings.port
            return {status: 200, result: full_ip}
            } catch (err) {
                console.log(err);
                return { status: 500, result: { msg: "Internal server error" }};
            } 
        }


}
module.exports = Match;