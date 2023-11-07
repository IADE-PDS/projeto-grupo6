var Docker = require('dockerode');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const { exec } = require('child_process');

//! PORT RANGE 27000-27100
const docker = new Docker({ socketPath: '/var/run/docker.sock' }); 

const composeFilePath = './docker/docker-compose.yml';
const fullcomposeFilePath = '/home/user/Slave_js/docker/docker-compose.yml';


var services = [];
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


class Game {
    static async start_game(id) {
        try {
            let tempServices = services;
            let containers = await docker.listContainers({ all: true });
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
            exec(composeCommand, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error: ${error}`);
                  return { status: 500, result: { msg: "Internal server error" }};
                }  else if (stdout.includes("Started Successfully")) {
                    return { status: 200, result: { 
                            msg: "Started server" ,
                            ports:port}};
                  } else {
                    return { status: 500, result: { msg: "Error Creating container" }};
                }
            });

            //up the service
            //return true with the port 
            
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }
    static async close_game(port){
        try {
            let close_game = null; 
            let containers = await docker.listContainers({ all: true });
                for(let container of containers){                   
                        if(port == container.Ports){
                            close_game = container.Image;
                        }                    
                    }
            if(!close_game)
                return{status: 507, result: {msg:"unable to find container"}}
            let composeCommand = ' docker compose -f '+close_game+' down ';
            exec(composeCommand, (error, stdout, stderr) => {
                if (error) {
                  console.error(`Error: ${error}`);
                  return { status: 500, result: { msg: "Internal server error" }};
                }  else if (stdout.includes("Started Successfully")) {
                    return { status: 200, result: { 
                            msg: "Started server" ,
                            ports:port}};
                  } else {
                    return { status: 500, result: { msg: "Error Creating container" }};
                }
            });


            //search on the opened container for a contianer in that port
            //docker compose down *nome do container*
            //return true
            
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }


}
module.exports = Game;