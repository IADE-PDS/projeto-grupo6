
const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();


function dbLobbiestoLobby(dbr)  {
    return new UnityServer(dbr.id, dbr.match_id, dbr.max_players, dbr.games_pool,
        dbr.isPrivate, dbr.game_name, dbr.isOfficial, dbr.port, dbr.slave, dbr.status);
}


class UnityServer {
    constructor(id,match_id, max_players, games_pool, isPrivate, game_name,
        isOfficial, port, slave, status) {
        this.id = id;
        this.match_id= match_id;
        this.max_players = max_players;
        this.games_pool = games_pool;
        this.isPrivate = isPrivate;
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

    static async getAllLobbies() {
        try {
            let lobbies= [];
            let results= await client.collection("lobby")
                .find({isPrivate: false,
                       isOfficial: false,
                       status: "waiting"})
                .sort({server_name: 1})
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

}

module.exports = UnityServer;
