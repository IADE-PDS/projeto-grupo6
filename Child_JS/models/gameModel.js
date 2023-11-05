var Docker = require('dockerode');
//! PORT RANGE 27000-27100



class Game {
    static async start_game() {
        try {
            //see all available services
            //choose a service, and save the ip
            //configure that service to include the desired variables and settigns
            //up the service
            //return true with the IP
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }

}

module.exports = Game;