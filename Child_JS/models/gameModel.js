var Docker = require('dockerode');
const fs = require('fs');
const yaml = require('js-yaml');
const { exec } = require('child_process');


//! PORT RANGE 27000-27100
const docker = new Docker({ socketPath: '/var/run/docker.sock' }); 

const composeFilePath = './docker/docker-compose.yml';
const fullcomposeFilePath = '/home/user/Slave_js/docker/docker-compose.yml';


var services = [];
//!!! NOT THE BEST WAY OF RUNNING COMMANDS, because is sending mensages throw the stderr but does it succsesfully
class Game {
    static async start_game(id) {
        try {
            getAllServices()
            let tempServices = services;
            let containers = await docker.listContainers({ all: true });
            console.log(services)
            for(let container of containers){
                for(let i = 0; i<tempServices.length;i++){
                    let service = tempServices[i]; 
                    let name = container.Image;
                    name = name.split("-")[1];
                    if(name == service.name){
                        tempServices.splice(i,1);
                        break;
                    }    
                               
                }
            }
            if(!tempServices.length)
                return{status: 507, result: {msg:"Server full"}}
            let service = tempServices[0];
            let port = service.config.ports[0];
            port = port.split(":")[0];
            let composeCommand = 'GAME_ID='+id+' docker compose -f '+fullcomposeFilePath+' up -d '+service.name;
            const { stderr, stdout } = await executeCommand(composeCommand); 
            if (stderr.includes("Started")) {
                return {
                    status: 200,
                    result: {
                        msg: "Started server",
                        ports: port,
                    },
                };
            } else {
                console.error(`Error: ${stderr}`);
                return { status: 500, result: { msg: "Error Creating container" } };
            }

            //up the service
            //return true with the port 
            
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async close_game(port){
        try {
            let closeGame = null; 
            let containers = await docker.listContainers({ all: true });
            for(let container of containers){                 
                    if(port == container.Ports[1].PublicPort){
                        closeGame = container.Image;
                        break;
                    }                    
                }
            closeGame = closeGame.split("-")[1];
            if(!closeGame)
                return{status: 507, result: {msg:"unable to find container"}}
            let composeCommand = ' docker compose -f '+fullcomposeFilePath+' down '+closeGame;
            const { stderr, stdout } = await executeCommand(composeCommand); 
            if (stderr.includes("Removed")) {
                return {
                    status: 200,
                    result: {
                        msg: "Server closed successfully"
                    },
                };
            } else {
                console.error(`Error: ${stderr}`);
                return { status: 500, result: { msg: "Error Creating container" } };
            }
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }


}
async function getAllServices(){
    try {
        const yamlData = fs.readFileSync(composeFilePath, 'utf8');
        const serviceobj = yaml.load(yamlData).services;
        services = Object.keys(serviceobj).map((serviceName) => ({
            name: serviceName,
            config: serviceobj[serviceName],
          }));
      } catch (error) {
        console.error('Error parsing YAML:', error);
      }
}
async function executeCommand(command) {
    return new Promise((resolve, reject) => {
        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr});
            }
        });
    });
}
module.exports = Game;