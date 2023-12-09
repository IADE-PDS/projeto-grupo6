const db = require("../config/database");
const client = db.getdatabase();
const Slave = require("./slaveModel");
const { ObjectId } = require('mongodb');
const utils = require("../config/utils");
const tokenSize = 64;

class Match{
    constructor( players, games, log, max_players, games_pool,//! INFORMAÇÔES DO JOGO ATUAL,INFORMAÇÔES,INFORMAÇÔES UNIVERSAIS DO PLAYER
        isPrivate, game_name,isOfficial, port, ip, status){
        this.owner = owner;//for custom matches, for the owner to be able to change options on the server 
        this.players = players;//Players on the server right now
        this.games = games;//Games played on the server untill now, and the information associated with each game and each player
        this.log = log;//server log
        this.settings= {
            type:type,// for custom servers the type is we
            whitelist:whitelist,//for matchmaking servers, the player when wants to join a matchmaking server will be added to the whitelist and then it will join
            max_time_round:max_time_round,//mach ammount of time allowed by round
            max_rounds:max_rounds,//max rounds
            max_players: max_players,//max players
            games_pool: games_pool,// games allowed to be played
            isPrivate: isPrivate,//if the server is private, private games dont have a whitelist, they simply will not show on the server list
            game_name: game_name,//server name
            isOfficial: isOfficial,//if the server is official
            pin:pin,//4 digit pin to allow players to join without looking in the server list, or to join private games
            port: port,//port of the server
            ip:ip,//ip of the servers
            status: status,//status, waiting(waiting players), started, finished
        };
    };
    static isWhitelistValid(whitelistObj){
        if(Date.now()/1000 - whitelistObj.timestamp/1000 <= 30)
            return true
        return false
    }

    
    static async GetAllMatches() {
        try {
            let matches = [];
            let results = await client.collection("match")
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


    static generatePin(id){
        console.log(id);
        let result = "";
        for (let i = 0; i < 4; i++) {
            let randomIndex = Math.floor(Math.random() * id.length);
            result += id.charAt(randomIndex);
          }
        return result
    }

    static async CreateUnityServer(settings) {
        try {
            let db = client.collection("match")
            let token = utils.genToken(tokenSize);
            //! Verify if every settings exist and are set correctly
            //if no name then cant create
            //if server created successfully
            // add to settings, the port and additional information ex:
            settings.status = "waiting";
            //insert into database
            let insert_match = {};
            insert_match.players = [];
            insert_match.games = [];
            insert_match.whitelist = [];
            insert_match.log = [];
            insert_match.token = token;
            insert_match.settings = settings;

            let dbResult = await db.insertOne(insert_match);
            let result = await Slave.CreateServer(dbResult.token);
            if(result.status != 200){
                await db.deleteOne({_id: dbResult.insertedId});
                return {status: result.status, result: {msg:"something went wrong"}}
            }
            let id = dbResult.insertedId
            //generates pin
            let pin;
            if(!settings.isOfficial)
            {
                while(true){
                    pin = this.generatePin(id.toHexString())
                    console.log(pin);
                    let dbResult = await db.find({ "settings.pin": pin}).toArray();
                    if(!dbResult.length){
                        dbResult = await db.updateOne({_id: id},
                            {
                                $set: {
                                    "settings.pin": pin,                                }
                            });
                        break;
                    }
                }
            };
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
                id: id,
                ip:result.result.ip, port: result.result.port
            }}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }

    static async JoinCommunityLobby(code) {
        try {
            //add player to the whitelist with a timestamp but doesnt need verification
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
    static async AuthethicatePlayer(playerId, matchId) {
        try {
            console.log("authenthicating");
            let _matchId = new ObjectId(matchId);
            let _playerId = new ObjectId(playerId);
            let query = {
                "_id": _matchId,
                "whitelist": {
                    $elemMatch: {
                      "_id": _playerId
                    }
                }
            };
            let dbresult = await client.collection("match").findOne(query);
            if(dbresult){
                let whitelistObj = dbresult.whitelist[dbresult.whitelist.findIndex(element => element._id.toString() == _playerId.toString())]
                if(!this.isWhitelistValid(whitelistObj)){
                    console.log("Player cant rejoin 30 seconds passed");
                    await this.TogglePlayerWhitelist(0,playerId, matchId);
                    dbresult = null;
                }
            }
            if(!dbresult)
                return { status: 401, msg:"User is not authenthicated"}
            return { status: 200, msg:"User is authenthicated"}
            } catch (err) {
                console.log(err);
                return { status: 500, result: { msg: "Internal server error" }};
            } 

    }
    static async TogglePlayerWhitelist(code,playerId, MatchId, points) {
        try {
            //code, 0 to remove 1 to add
            let db = client.collection("match");
            let _matchId = new ObjectId(MatchId);
            let _playerId = new ObjectId(playerId);
            let query = {_id: _matchId};
            let dbResult = await db.findOne(query);
            if(!dbResult){
                return {status: 400, result: {
                    msg:"game server not found"
                }}
            };
            let dbwhitelist = dbResult.whitelist;
            let whitelist = toggleElement(dbwhitelist ,{"_id":_playerId,"timestamp": new Date().getTime(),"points":points});
            function toggleElement(arr, desiredelement) {
                console.log(arr);
                const index = arr.findIndex(element => element._id.toString() == desiredelement._id.toString());
                if (index !== -1) {
                    if(code == 0)
                        arr.splice(index, 1);
                } else {
                    if(code == 1)
                        arr.push(desiredelement);
                }
              
                return arr;
              }
           
              
            let new_value = {$set:{whitelist : whitelist}}
            dbResult = await db.updateOne(query, new_value);
            return { status: 200, msg:"Updated Successfully"}
        } catch (err) {
            console.log(err);
            return { status: 500, result: err };
        }  
    }
    static async closeMatch(matchID) {
        try {
            //!only servers can close
            let id = new ObjectId(matchID);
            let db = client.collection("match");
            let dbResult = await db.findOne({ _id: id});
            if(!dbResult){
                return {status: 400, result: {
                    msg:"match not found"
                }}
            };
            await db.updateOne({_id: id},
                {
                    $set: {"settings.status":"finished"}
                });
            let full_ip={ip:dbResult.settings.ip, port:dbResult.settings.port};
            let response = await Slave.CloseServer(full_ip);
            if(response.status != 200){
                return { status: 500, result: { msg: "Internal server error" }};
            }
            if(!dbResult.settings.isOfficial || dbResult.settings.status != "finished"){//if server is not official or is official and the status isnt finished, we delete it
                dbResult = await db.deleteOne({_id:id});//deletes from db
            } 
              
                //! need to have authenthication
                //for every player
                //get all matches from the player
                //if a player has more than 10 matches
                //delete the oldest one
            return {status: 200, result:{msg: "stopped server successfully"}}
            } catch (err) {
                console.log(err);
                return { status: 500, result: { msg: "Internal server error" }};
            } 
    }

    static parseUpdates(updateTable) {
        let fixedUpdates = []
        if (updateTable.player) {
            fixedUpdates.players = updateTable.players
        }
        if (updateTable.games.length) {
            fixedUpdates.games = updateTable.games
        }
        if (updateTable.log.length) {
            fixedUpdates.log = updateTable.log
        }
        if (updateTable.settings.length) {
            fixedUpdates.settings = updateTable.settings
        }
        return fixedUpdates
    }
    static async UpdateServer(matchId, updates) {
        try {
            let id = new ObjectId(matchId);
            let db = client.collection("match")
            let dbResult = await db.findOne({"_id": id});
            if(!dbResult){
                return {status: 404, result: {
                    msg:"Server with given ID does not exist, or could not contact database."
                }}
            };
            if(dbResult.settings.status == "finished"){
                return {status: 400, result: {
                    msg:"Cannot alter server after it's been finished."
                }}
            }

                //update Players
                if(updates.player){
                    console.log("playerAdded/removed");
                    let dbPlayers = dbResult.players;
                    let ElementToCheck = {"_id": new ObjectId(updates.player.id), "points": updates.player.points};
                    const index = dbPlayers.findIndex(element => element._id.toString() == ElementToCheck._id.toString());
                    if (index !== -1) {
                        await this.TogglePlayerWhitelist(1,dbPlayers[index]._id,matchId,dbPlayers[index].points);
                        dbPlayers.splice(index, 1);
                    } else {
                        await this.TogglePlayerWhitelist(0,ElementToCheck._id,matchId);
                        dbPlayers.push(ElementToCheck);
                    }
                    dbResult.players = dbPlayers;
                    dbResult = await db.updateOne({_id: id},
                        {
                            $set: {players : dbPlayers}
                        });
                }                

            return {status: 200, result: {
                msg:"Server updated successfully",
            }}

           
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        } 
    }
 
    static async GetMatchByToken (token) {
        try {
            let query = {
                token: token}
            let result = await client.collection("match").findOne(query);
            if(!result.settings.port && !result.settings.ip){

            }
            //IF result.setting.ip || result.settings.port
            //crashHandlerModel.GameServerCreationError.
            if(!result)
                return {status:404, results:{msg:"No Match Found"}}
            return { status: 200, result:{match: result}}
            } catch (err) {
                console.log(err);
                return { status: 500, result: { msg: "Internal server error" }};
            } 

    }
    
}

module.exports = Match;