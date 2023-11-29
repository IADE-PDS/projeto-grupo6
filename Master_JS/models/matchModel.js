const bcrypt = require('bcrypt');
const auth = require("../config/utils");
const db = require("../config/database");
const client = db.getdatabase();
const Slave = require("./slaveModel");
const { ObjectId } = require('mongodb');

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
    
    static async GetMatchById(id) {
        try {
            //!This function will never be used directly by the player
            let db = client.collection("match")
            let matchID = new ObjectId(id);
            let dbResult = await db.find({ "_id": matchID}).toArray();
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
            insert_match.settings = settings;

            let dbResult = await db.insertOne(insert_match);
            let result = await Slave.CreateServer(dbResult.insertedId);
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
            //!only servers can close
            let id = new ObjectId(matchID);
            let db = client.collection("match");
            let dbResult = await db.findOne({ _id: id});
            if(!dbResult){
                return {status: 400, result: {
                    msg:"match not found"
                }}
            };
            let full_ip={ip:dbResult.settings.ip, port:dbResult.settings.port};
            let response = await Slave.CloseServer(full_ip);
            if(response.status != 200){
                return { status: 500, result: { msg: "Internal server error" }};
            }
            if(!dbResult.settings.isOfficial || dbResult.settings.status != "finished"){//if server is not official or is official and the status isnt finished, we delete it
                dbResult = await db.deleteOne({_id:id});//deletes from db
            } else{
                dbResult = await db.updateOne({_id: id},
                    {
                        $set: {"settings.status":"finished"}
                    });
                //! need to have authenthication
                //for every player
                //get all matches from the player
                //if a player has more than 10 matches
                //delete the oldest one
            }
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


    //! NEEDS TO BE TESTED WHEN MINIGAMES ARE DONE
    static async UpdateServer(reqBody) {
        try {
            console.log(reqBody);
            let id = new ObjectId(reqBody.matchId);
            let db = client.collection("match")
            let dbResult = await db.findOne({"_id": id});
            if(!dbResult){
                return {status: 400, result: {
                    msg:"Server with given ID does not exist, or could not contact database."
                }}
            };
            let updates = reqBody.updates
            let dbPlayers = dbResult.players;
            let players = toggleElement(dbPlayers ,reqBody.updates.player);
            dbResult = await db.updateOne({_id: id},
                        {
                            $set: {players : players}
                        });

           

            function toggleElement(arr, element) {
                const index = arr.indexOf(element);
                if (index !== -1) {
                  arr.splice(index, 1);
                } else {
                  arr.push(element);
                }
              
                return arr;
              }
              return {status: 200, result: {
                msg:"Server updated successfully",
            }}


        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        } 
    }
    
}
module.exports = Match;