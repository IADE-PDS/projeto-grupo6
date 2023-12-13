//if the matchmaking server crashes mid creating a game server
//when the game server gets his info, is gonna get no ip or port.
//if it doents, then call a function here.
//in here when we send a request to all slaves searching for open servers that arent in the database.

module.exports.unityServerBadData = async function () {
    try {
        console.log("deleting");
        console.log("Continue");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
} 
//Game Server crashed
//create a table on the db With the server id and the user
//when 60% of users ask start another slave server 
//connect players to that second server