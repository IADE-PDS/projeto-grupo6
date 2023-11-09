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
    constructor( players, games, log, max_players, games_pool,//! INFORMAÇÔES DO JOGO ATUAL,INFORMAÇÔES,INFORMAÇÔES UNIVERSAIS DO PLAYER
        isPrivate, game_name,isOfficial, port, ip, status){
        this.players = players;
        this.games = games;
        this.log = log;
        this.settings= {//! tipos de servidores 
            max_players: max_players,
            games_pool: games_pool,
            isPrivate: isPrivate,
            game_name: game_name,
            isOfficial: isOfficial,
            port: port,
            ip:ip,
            status: status,
        };
    };


    static async GetMatchById(id) {
        try {
            //!This function will never be used directly by the player
            db = client.collection("match")
            let dbResult = await db.find({ "_id": id}).toArray();
            if(!dbResult.length){
                return {status: 400, result: {
                    msg:"server not found"
                }}
            };
            return {status: 200, result: dbResult[0]}
            } catch (err) {
                console.log(err);
                return { status: 500, result: { msg: "Internal server error" }};
            } 
    }
    static async GetAllMatches() {
        try {
            let matches= [];
            let results= await client.collection("match")
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
    static async CreateUnityServer(settings) {
        try {
            let db = client.collection("match")
            //! Verify if every settings exist and are set correctly
            //if no name then cant create
            //if server created successfully
            // add to settings, the port and additional information ex:
            settings.status = "waiting";
            //insert into database
            let insert_match = {};
            insert_match.players = [];
            insert_match.games = [];
            insert_match.log = [];
            settings.ip = undefined;
            settings.port = undefined;
            insert_match.settings = settings;

            let dbResult = await db.insertOne(insert_match);

            let result = await Slave.CreateServer(dbResult.insertedId);
            //await db.deleteOne({_id: dbResult.insertedId});
            if(result.status != 200){
                await db.deleteOne({_id: dbResult.insertedId});
                return {status: result.status, result: {msg:"something went wrong"}}
            }
            let id = dbResult.insertedId
            dbResult = await db.updateOne({_id: id},
                        {
                            $set: { 
                                "settings.ip": result.result.ip,
                                "settings.port":result.result.port
                            }
                        });
            //return status 200 and the ip with the port from the server
            //the unity app recieves the status 200 and enters on the server with the ip and port
            return {status: 200, result: {
                msg:"unity server created sucessfully",
                ip:result.result.ip, port: result.result.port
            }}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async JoinCommunityLobby(code) {
        try {
            //!verify if players is not in a lobby already
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
            let full_ip= unity_server.settings.ip +":"+ unity_server.settings.port
            return {status: 200, result: full_ip}
            } catch (err) {
                console.log(err);
                return { status: 500, result: { msg: "Internal server error" }};
            } 
    }
    static async closeMatch(matchID) {
        try {
            //!vOnly servers can close
            let db = client.collection("match");
            let dbResult = await db.find({ _id: matchID}).toArray();
            if(!dbResult.length){
                return {status: 400, result: {
                    msg:"match not found"
                }}
            };
            let full_ip={ip:unity_server.settings.ip, port:unity_server.settings.port};
            let response = await Slave.CloseServer(full_ip);
            return {status: 200, result: full_ip}
            } catch (err) {
                console.log(err);
                return { status: 500, result: { msg: "Internal server error" }};
            } 
    }

}
module.exports = Match;