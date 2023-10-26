
const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();


function dbLobbiestoLobby(dbr)  {
    return new UnityServer(dbr.id,
        dbr.server_namename,dbr.pass, dbr.token);
}


class UnityServer {
    constructor(id, max_players, games_pool, isPrivate, isOfficial,
         server_name, port, slave, status) {
        this.id = id;
        this.max_players = max_players;
        this.games_pool = games_pool;
        this.isPrivate = isPrivate;
        this.isOfficial = isOfficial;
        this.server_name = server_name;
        this.port = port;
        this.slave = slave;
        this.status = status;
    }
    export() {
        let unityserver=new UnityServer();
        unityserver.server_namename = this.server_name;
        unityserver.slave = this.slave;
        unityserver.status = this.status;
        unityserver.isPrivate = this.isPrivate;
        unityserver.port = this.port;
        return unityserver; 
    }

    static async getAllLobbies() {
        try {
            let lobbies= [];
            let results= await client.collection("lobby")
                .find({isPrivate: false,
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
