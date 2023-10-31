
const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();


function dbLobbiestoLobby(dbr)  {
    return new UnityServer(dbr.match_id, dbr.max_players, dbr.games_pool,
        dbr.isPrivate, dbr.game_name, dbr.isOfficial, dbr.port, dbr.child, dbr.status);
}
function dbMatchtoMatch(dbr)  {
    return new Match(dbr.server_unity_id, dbr.players, dbr.games, dbr.log, dbr.max_players,
        dbr.games_pool ,dbr.isPrivate, dbr.game_name, dbr.isOfficial, dbr.port,
        dbr.child, dbr.status);
}
class Match{
    constructor(  server_unity_id, players, games, log, max_players, games_pool,
        isPrivate, game_name,isOfficial, port, child, status){
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
            child: child,
            status: status,
        };
    }
    export() {
        let match=new Match();
        match.server_unity_id= this.server_unity_id;
        match.players = this.players;
        match.games = this.games;
        match.log = this.log;
        match.settings = this.settings;   
        return match; 
    }

    static async GetAllMatches() {
        try {
            let matches= [];
            let results= await client.collection("unity")
                .find({"settings.isPrivate": false,
                       "settings.isOfficial": false,
                       "settings.status": "waiting"})
                .toArray()
                console.log(results);
            for (let result of results) {
                matches.push(dbMatchtoMatch(result));
            }

            return { status: 200, result: matches}
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }  
    }



    static async CreateUnityServerPublic( max_players, game_name,
        games_pool, match_id, port, child) {
        try {
            let db = client.collection("unity")
            //missing crucial information verification
            if(!game_name || !match_id || !port || !child)
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
            insert_match.child = child;
            insert_match.status = "waiting";

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

}

module.exports = UnityServer;

/* 
class UnityServer {
    constructor(match_id, max_players, server_unity_id, games_pool,jogos,
        player, log, isPrivate, game_name,isOfficial, port, child, status) {
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
        this.child = child;
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
        unityserver.child = this.child;
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
        games_pool, match_id, port, child) {
        try {
            let db = client.collection("unity")
            //missing crucial information verification
            if(!game_name || !match_id || !port || !child)
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
            insert_unityserver.child = child;
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


