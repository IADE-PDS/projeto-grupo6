const { ObjectId } = require("mongodb");
const db = require("../config/database");
const match = require("./matchModel");
const crashHandler = require("../middleware/crashHandler")
const client = db.getdatabase();

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
    //to verify is the player can still join after 15 seconds
    static async SearchServer(PlayerId) {
        try {

            var server;
            let _id = new ObjectId(PlayerId);
            let collection = client.collection("match")
            //if player for some reason didnt get in the server when he pressed join
            let dbresult = await collection.findOne({
                "whitelist": {
                    $elemMatch: {
                      "_id": _id
                    }
            }});
            if(dbresult){
                let whitelistObj = dbresult.whitelist[dbresult.whitelist.findIndex(element => element._id.toString() == _id.toString())]
                if(match.isWhitelistValid(whitelistObj)){
                    server = dbresult;
                    let ip = process.env.GAMECONNECTIONIP || server.settings.ip;
                    let result_server = {ip: ip , port:server.settings.port}
                    return {status: 200, result: {server:result_server}}
                }
                console.log("Player cant rejoin 15 seconds passed");
                await match.TogglePlayerWhitelist(0,PlayerId, dbresult._id.toString());
            }

            if(!server){
                let results = await collection.find({
                    "settings.isOfficial": true,
                    "settings.status": "waiting"
                }).toArray();

                if(results.length){
                    for (let result of results){
                        for(let whitelistObj of result.whitelist){
                            if(!match.isWhitelistValid(whitelistObj)){
                                await match.TogglePlayerWhitelist(0,PlayerId, dbresult._id.toString());
                                result.whitelist.splice(result.whitelist.findIndex(element => element._id.toString() == whitelistObj._id.toString()));
                            }
                        }
                        //find first one that isnt on staring
                        // can only join, if the valid whitelist players plus the players length is no greater than 4
                        if(result.players.length + result.whitelist.length < 4){
                            server = result;
                            break;
                        }
                    }
                }
            }
            if(server && !server.settings.port && !server.settings.ip){
                //call function here
                console.log("Contineursde");
            }
            //if server doesnt have a port or ip call crashHandler
            if(!server){
                server = {};
                let settings= {
                max_players: 4,
                games_pool: [],
                isPrivate: false,
                game_name: "Official",
                isOfficial: true,
                };
                server.settings = settings;
                let result = await match.CreateUnityServer(settings);
                server._id = result.result.id
                if(result.status != 200)
                    return {status: 404, result: {msg:"Matchmaking not available at the moment"}}
                server.settings.ip = result.result.ip
                server.settings.port = result.result.port
                
            }

             let result = await match.TogglePlayerWhitelist(1,PlayerId, server._id.toString(),0);
             if(result.status != 200){
                 console.log(result);
                 return { status: 500, result: { msg: "Internal server error" }};
             }
            let ip = process.env.GAMECONNECTIONIP || server.settings.ip;
            let result_server = {ip: ip , port:server.settings.port}
            return {status: 200, result: {server:result_server}}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }
    }

}

module.exports = Marchmaking;