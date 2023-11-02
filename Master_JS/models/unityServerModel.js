
const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();



function dbMatchtoMatch(dbr)  {
    return new Match(dbr.server_unity_id, dbr.players, dbr.games, dbr.log, dbr.settings.max_players,
        dbr.settings.games_pool ,dbr.settings.isPrivate, dbr.settings.game_name, dbr.settings.isOfficial, dbr.settings.port,
        dbr.settings.slave, dbr.settings.status, dbr.settings.pin);
}

class Match{
    constructor(  server_unity_id, players, games, log, max_players, games_pool,
        isPrivate, game_name,isOfficial, port, slave, status, pin){
        this.server_unity_id = server_unity_id;
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
            slave: slave,
            status: status,
            pin: pin,
        };
    }
    export() {
        let match=new Match();
        match.server_unity_id= this.server_unity_id;
        match.players = this.players;
        match.games = this.games;
        match.log = this.log;
        match.settings = this.settings;   
        match.settings.max_players= this.settings.max_players
        match.settings.games_pools= this.settings.games_pools
        match.settings.isPrivate = this.settings.isPrivate
        match.settings.game_name = this.settings.game_name
        match.settings.isOfficials = this.settings.isOfficials
        match.settings.port = this.settings.port
        match.settings.slave = this.settings.slave
        match.settings.status = this.settings.status
        match.settings.status = this.settings.pin
        return match; 
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
            for (let result of results) {
                matches.push(dbMatchtoMatch(result));
            }
            console.log("result");
            console.log(matches);
            
            return { status: 200, result: matches}
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }  
    }



    static async CreateUnityServerPublic( max_players, game_name,
        games_pool, match_id, port, slave) {
        try {
            let db = client.collection("match")
            //missing crucial information verification
            if(!game_name || !match_id || !port || !slave)
                return {status: 422,result: {
                    msg:"Bad Data"
                }}
            if(!games_pool || games_pool==[] ){ games_pool="all"}
            if(max_players<=0){max_players=4}
            
            let dbResult = await db.find({ game_name: game_name}).toArray();
            if(dbResult.length){
                return {status: 400, result: {
                    msg:"this name already exists"
                }}
            };
            
            let insert_match = new Match();
            insert_match.server_unity_id = null;
            insert_match.players = [];
            insert_match.games = [];
            insert_match.log = [];
            insert_match.max_players = max_players;
            insert_match.game_name = game_name;
            insert_match.games_pool = games_pool;
            insert_match.isOfficial = false;
            insert_match.match_id = match_id;
            insert_match.match_id = port;
            insert_match.slave = slave;
            insert_match.status = "waiting";
            insert_match.pin = null;

            dbResult = await db.insertOne(insert_match);
            let match_id = dbResult.insertedId;
            return {status: 200, result: {
                msg:"unity server created sucessfully"
            }}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }


    static async JoinCommunityLobby(server_id, code) {
        try {
            db = client.collection("match")
            //missing lobby verification
            let dbResult = await db.find({ server_unity_id: server_id}).toArray();
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
            // metodo de verificação pode ter de ser alterado
            if(unity_server.settings.isPrivate == true && code != unity_server.settings.pin){ 
                return {status: 400, result: {
                    msg:"this server cannot be accessed manually"
                }}  
            }
            let ip = "192.xx.xx.xx:"; // ALTERAR NO FUTURO
            let full_ip= ip + unity_server.settings.port
            return {status: 200, result: full_ip}
            } catch (err) {
                console.log(err);
                return { status: 500, result: { msg: "Internal server error" }};
            } 
        }



}

module.exports = Match;

/* 
class UnityServer {
    constructor(match_id, max_players, server_unity_id, games_pool,jogos,
        player, log, isPrivate, game_name,isOfficial, port, slave, status) {
        this.match_id= match_id;
        this.max_players = max_players;
        this.games_pool = games_pool;
        this.isPrivate = isPrivate;
        this.settings= {
            server_unity_id: server_unity_id,
            player: player,
            jogos: jogos,
            log: log
        };
        this.game_name = game_name;
        this.isOfficial = isOfficial;
        this.port = port;
        this.slave = slave;
        this.status = status;
    }
    export() {
        let unityserver=new UnityServer();
        unityserver.match_id= this.match_id;
        unityserver.max_players = this.max_players;
        unityserver.isPrivate = this.isPrivate;
        unityserver.game_name = this.game_name;
        unityserver.isOfficial = this.isOfficial;
        unityserver.port = this.port;
        unityserver.slave = this.slave;
        unityserver.status = this.status;     
        return unityserver; 
    }

    static async GetAllLobbies() {
        try {
            let lobbies= [];
            let results= await client.collection("unity")
                .find({isPrivate: false,
                       isOfficial: false,
                       status: "waiting"})
                .toArray()
                console.log(results);
            for (let result of results) {
                lobbies.push(dbLobbiestoLobby(result));
            }

            return { status: 200, result: lobbies}
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }  
    }

      
    static async CreateUnityServerPublic( max_players, game_name,
        games_pool, match_id, port, slave) {
        try {
            let db = client.collection("unity")
            //missing crucial information verification
            if(!game_name || !match_id || !port || !slave)
                return {status: 422,result: {
                    msg:"Bad Data"
                }}
            if(!games_pool || games_pool==[] ){ games_pool="all"}
            if(max_players<=0){max_players=4}
            
            let dbResult = await db.find({ game_name: game_name}).toArray();
            if(dbResult.length){
                return {status: 400, result: {
                    msg:"this name already exists"
                }}
            };

            let insert_unityserver = new UnityServer();
            insert_unityserver.isPrivate = false;
            insert_unityserver.max_players = max_players;
            insert_unityserver.game_name = game_name;
            insert_unityserver.games_pool = games_pool;
            insert_unityserver.isOfficial = false;
            insert_unityserver.match_id = match_id;
            insert_unityserver.match_id = port;
            insert_unityserver.slave = slave;
            insert_unityserver.status = "waiting";

            dbResult = await db.insertOne(insert_unityserver);
            let unityserver_id = dbResult.insertedId;
            return {status: 200, result: {
                msg:"unity server created sucessfully"
            }}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }

}
*/


