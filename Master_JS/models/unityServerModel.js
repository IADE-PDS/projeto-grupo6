
const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();


function dbLobbiestoLobby(dbr)  {
    return new UnityServer(dbr.match_id, dbr.max_players, dbr.games_pool,
        dbr.isPrivate, dbr.game_name, dbr.isOfficial, dbr.port, dbr.child, dbr.status);
}


class UnityServer {
    constructor(match_id, max_players, games_pool, isPrivate, game_name,
        isOfficial, port, child, status) {
        this.match_id= match_id;
        this.max_players = max_players;
        this.games_pool = games_pool;
        this.isPrivate = isPrivate;
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


module.exports = UnityServer;
