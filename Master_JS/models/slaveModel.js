const bcrypt = require('bcrypt');
const db = require("../config/database");
const client = db.getdatabase();
const axios = require("axios");
const password = process.env.REGISTATION_PASSWORD 

class Slave {
    constructor(ip, n_unityServers){
        this.ip = ip;
        this.n_unityServers = n_unityServers;
    }

    static async RegisterChild(child,ip) {
        try {
            if(child.pass != password || !child.pass)
                return {status: 401, result: {msg:"Not a valid server"}}
            let db = client.collection("slave");
            console.log(child);
            let insert_child = new Slave();
            insert_child.ip = ip;
            insert_child.n_unityServers = 0;
            let dbResult = await db.findOne({ip:ip});
            if(dbResult)
                return{status: 409, result: {msg:"Already Registered"}}
            dbResult = await db.insertOne(insert_child);
            //register slave
            return{status: 200, result: {msg:"Registered sucsessfully"}}
        } catch (err) {
            console.log(err);
            return {status: 500, result: { msg: "Internal server error" }};
        }  
    }
    
    static async CreateServer(Match_id) {
        try {
            //!Try another server if this one not 200!
            let collection = client.collection("slave");
            let slave = await collection.aggregate([
                {$sort: { n_unityServers: 1 }}]).toArray();
            while(slave.length){
                
                if(!slave.length)
                    return {status: 404, result: {msg:"No Servers Found"}}
                slave = slave[0];
                let postData = {
                    id:Match_id
                }
                let url = "http://"+slave.ip+":"+process.env.SLAVEPORT+"/api/game/start"
                let response = await axios.post(url, postData);

                if(response.status == 200)
                    return {status: 200, result: {ip:slave.ip,port:response.data.ports}}
                slave.shift();
            }
            
            return {status: 503, result: {msg:"No Servers Found"}}
        } catch (err) {
            console.log(err);
            return { status: 500, result: { msg: "Internal server error" }};
        }  
    }

    static async CloseServer(ip){
        try{
            let collection = client.collection("slave");
            let slave = await collection.findOne({ip:ip.ip});
            if(!slave)
                return {status:404, results:{msg:"No Servers Found"}}
            let url = "http://"+ip.ip+":"+process.env.SLAVEPORT+`/api/game/stop/${ip.port}`;
            let response = await axios.delete(url);
            if(response.status != 200){
                return{status:500, result:{msg: "Internal server error"}};
            }
            return {status: 200, result:{msg: "stopped server successfully"}}
        }catch(err){
            console.log(err);
            return{status:500, result:{msg: "Internal server error"}};
            
        }
    }
}

module.exports = Slave;